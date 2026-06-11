import argparse
import datetime
import json
import os
import re
import sys
import time
import unicodedata
from collections import defaultdict

import fitz


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_DIR = os.path.join(WORKSPACE_ROOT, "reports", "content-quality")
RAW_PATH = os.path.join(REPORT_DIR, "math10-rich-raw-extract.json")
EXCLUDED_PATH = os.path.join(REPORT_DIR, "math10-excluded-question-bank.json")
GUARD_PATH = os.path.join(REPORT_DIR, "math10-content-guard.json")
ASSET_DISK_ROOT = os.path.join(WORKSPACE_ROOT, "apps", "miuprep-portal", "public", "assets", "math10", "figures")
ASSET_PUBLIC_ROOT = "/assets/math10/figures"
REPORT_PATH = os.path.join(REPORT_DIR, "math10-figure-recovery-report.json")
REPAIR_CODES = {
    "display.image_missing",
    "display.formula_review",
    "display.legacy_font_encoding",
    "display.source_noise",
}


STOPWORDS = {
    "cau", "bai", "vi", "du", "cho", "cac", "sau", "day", "hinh", "do", "thi", "bang",
    "trong", "la", "cua", "mot", "hai", "ba", "bon", "nam", "dap", "an", "chon", "tim",
    "tinh", "hoi", "biet", "duoc", "the", "nao", "dung", "sai", "abc", "oxy",
}


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFD", str(value or ""))
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def slug(value: str, limit: int = 150) -> str:
    text = normalize(value).replace(" ", "-")
    text = re.sub(r"[^a-z0-9._-]+", "-", text).strip("-")
    return (text[:limit].strip("-") or "figure")


def prompt_tokens(prompt: str) -> list[str]:
    words = normalize(prompt).split()
    result = []
    seen = set()
    for word in words:
        if len(word) < 3 or word in STOPWORDS:
            continue
        if word.isdigit():
            continue
        if word not in seen:
            seen.add(word)
            result.append(word)
        if len(result) >= 42:
            break
    return result


def prompt_header(prompt: str) -> str:
    first = normalize(prompt)[:120]
    match = re.match(r"(cau|bai|vi du|bai toan)\s+([0-9]+|[ivxlc]+)", first)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return " ".join(first.split()[:4])


def score_page(page_text: str, prompt: str, tokens: list[str], header: str) -> int:
    text = normalize(page_text)
    score = 0
    if header and header in text:
        score += 35
    prompt_start = " ".join(normalize(prompt).split()[:14])
    if prompt_start and prompt_start in text:
        score += 50
    for token in tokens:
        if token in text:
            score += 1
    return score


def find_best_page(page_texts: list[str], prompt: str) -> tuple[int, int]:
    tokens = prompt_tokens(prompt)
    header = prompt_header(prompt)
    best_index = 0
    best_score = -1
    for index, page_text in enumerate(page_texts):
        score = score_page(page_text, prompt, tokens, header)
        if score > best_score:
            best_score = score
            best_index = index
    return best_index, best_score


def is_header_text(text: str) -> bool:
    return bool(re.search(r"(?:^|\s)(?:cau|bai|vi du|bai toan)\s+(?:[0-9]+|[ivxlc]+)(?:\s|[:.)-]|$)", normalize(text)))


def find_crop_rect(page: fitz.Page, blocks: list, prompt: str) -> fitz.Rect:
    page_rect = page.rect
    header = prompt_header(prompt)
    tokens = set(prompt_tokens(prompt)[:12])
    y0 = None

    for block in blocks:
        x0, by0, x1, by1, text = block[:5]
        n = normalize(text)
        if header and header in n:
            y0 = max(0, by0 - 10)
            break

    if y0 is None:
        best = (0, None)
        for block in blocks:
            x0, by0, x1, by1, text = block[:5]
            n = normalize(text)
            overlap = sum(1 for token in tokens if token in n)
            if overlap > best[0]:
                best = (overlap, by0)
        y0 = max(0, (best[1] if best[1] is not None else 0) - 10)

    next_y = None
    for block in blocks:
        x0, by0, x1, by1, text = block[:5]
        if by0 <= y0 + 24:
            continue
        if is_header_text(text):
            next_y = by0 - 8
            break

    if next_y is None or next_y <= y0 + 140:
        next_y = min(page_rect.height, y0 + 430)
    else:
        next_y = min(next_y, y0 + 650)

    return fitz.Rect(
        max(0, page_rect.x0 + 24),
        max(0, y0),
        min(page_rect.width, page_rect.x1 - 24),
        min(page_rect.height, next_y),
    )


def image_dimensions(pix: fitz.Pixmap) -> tuple[int, int]:
    return pix.width, pix.height


def load_json(path: str):
    with open(path, "r", encoding="utf-8-sig") as file:
        return json.load(file)


def write_json(path: str, payload) -> None:
    tmp_path = f"{path}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
    for attempt in range(12):
        try:
            os.replace(tmp_path, path)
            return
        except PermissionError:
            if attempt == 11:
                raise
            time.sleep(0.75)


def persist_progress(raw_payload, targets_count: int, recovered: list[dict], skipped: list[dict]) -> None:
    raw_payload["generatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    write_json(RAW_PATH, raw_payload)
    write_json(REPORT_PATH, {
        "schemaVersion": "math10_figure_recovery_report_v1",
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "targets": targets_count,
        "recovered": len(recovered),
        "skipped": len(skipped),
        "assetRoot": ASSET_PUBLIC_ROOT,
        "items": recovered,
        "skippedItems": skipped,
        "partial": True,
    })


def build_issue_map(guard_payload) -> dict[str, list[dict]]:
    issue_map = defaultdict(list)
    for issue in guard_payload.get("issues", []):
        question_id = issue.get("questionId")
        if question_id:
            issue_map[question_id].append(issue)
    return issue_map


def recover(limit: int = 0, overwrite: bool = False) -> None:
    raw_payload = load_json(RAW_PATH)
    excluded_payload = load_json(EXCLUDED_PATH)
    guard_payload = load_json(GUARD_PATH)
    issue_map = build_issue_map(guard_payload)
    sources = raw_payload.get("sources", raw_payload if isinstance(raw_payload, list) else [])
    source_by_relative = {source.get("relativePath") or source.get("fileName"): source for source in sources}
    source_by_file = {source.get("fileName"): source for source in sources}

    targets = []
    for item in excluded_payload.get("items", []):
        codes = {issue.get("code") for issue in issue_map.get(item.get("id"), [])}
        repair_codes = sorted(codes.intersection(REPAIR_CODES))
        if not repair_codes:
            continue
        item["_repairCodes"] = repair_codes
        targets.append(item)
    if limit:
        targets = targets[:limit]

    os.makedirs(ASSET_DISK_ROOT, exist_ok=True)
    docs: dict[str, fitz.Document] = {}
    page_text_cache: dict[str, list[str]] = {}
    page_block_cache: dict[tuple[str, int], list] = {}
    recovered = []
    skipped = []

    for index, item in enumerate(targets, start=1):
        item_id = item.get("id", "")
        metadata = item.get("metadata", {})
        source_key = metadata.get("sourceFile", "")
        source = source_by_relative.get(source_key) or source_by_file.get(os.path.basename(source_key))
        if not source:
            skipped.append({"id": item_id, "reason": "source_not_found", "sourceFile": source_key})
            continue

        source_path = source.get("path") or metadata.get("sourcePath", "")
        if not source_path or not os.path.exists(source_path):
            skipped.append({"id": item_id, "reason": "pdf_not_found", "sourceFile": source_key, "path": source_path})
            continue

        asset_name = f"{slug(item_id)}.png"
        asset_disk_path = os.path.join(ASSET_DISK_ROOT, asset_name)
        asset_public_path = f"{ASSET_PUBLIC_ROOT}/{asset_name}"

        if os.path.exists(asset_disk_path) and not overwrite:
            try:
                pix_info = fitz.Pixmap(asset_disk_path)
                width, height = image_dimensions(pix_info)
            except Exception:
                width, height = 640, 360
            add_asset_to_source(source, item_id, item.get("sourceId", ""), asset_public_path, width, height, "existing", repair_codes=item.get("_repairCodes", []))
            recovered.append({"id": item_id, "src": asset_public_path, "status": "existing", "repairCodes": item.get("_repairCodes", [])})
            continue

        if source_path not in docs:
            docs[source_path] = fitz.open(source_path)
            page_text_cache[source_path] = [page.get_text("text", sort=True) for page in docs[source_path]]
        doc = docs[source_path]

        page_index, score = find_best_page(page_text_cache[source_path], item.get("prompt", ""))
        if score < 6:
            skipped.append({"id": item_id, "reason": "low_page_match_score", "score": score, "sourceFile": source_key})
            continue

        page = doc[page_index]
        cache_key = (source_path, page_index)
        if cache_key not in page_block_cache:
            page_block_cache[cache_key] = page.get_text("blocks", sort=True)
        rect = find_crop_rect(page, page_block_cache[cache_key], item.get("prompt", ""))
        matrix = fitz.Matrix(1.65, 1.65)
        pix = page.get_pixmap(matrix=matrix, clip=rect, alpha=False)
        pix.save(asset_disk_path)
        width, height = image_dimensions(pix)

        add_asset_to_source(source, item_id, item.get("sourceId", ""), asset_public_path, width, height, "pdf_crop", page_index + 1, score, rect, item.get("_repairCodes", []))
        recovered.append({
            "id": item_id,
            "src": asset_public_path,
            "sourceFile": source_key,
            "repairCodes": item.get("_repairCodes", []),
            "page": page_index + 1,
            "score": score,
            "width": width,
            "height": height,
            "crop": [round(rect.x0, 2), round(rect.y0, 2), round(rect.x1, 2), round(rect.y1, 2)],
        })

        if index % 25 == 0:
            persist_progress(raw_payload, len(targets), recovered, skipped)
        if index % 50 == 0:
            print(f"Recovered {len(recovered)}/{len(targets)} figure assets...", flush=True)

    for doc in docs.values():
        doc.close()

    raw_payload["generatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    write_json(RAW_PATH, raw_payload)
    write_json(REPORT_PATH, {
        "schemaVersion": "math10_figure_recovery_report_v1",
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "targets": len(targets),
        "recovered": len(recovered),
        "skipped": len(skipped),
        "assetRoot": ASSET_PUBLIC_ROOT,
        "items": recovered,
        "skippedItems": skipped,
        "partial": False,
    })
    print(json.dumps({
        "targets": len(targets),
        "recovered": len(recovered),
        "skipped": len(skipped),
        "report": REPORT_PATH,
    }, ensure_ascii=False, indent=2))


def add_asset_to_source(source: dict, item_id: str, source_id: str, src: str, width: int, height: int, method: str, page: int | None = None, score: int | None = None, rect: fitz.Rect | None = None, repair_codes: list[str] | None = None) -> None:
    assets = source.setdefault("questionFigureAssets", {})
    repair_codes = repair_codes or []
    asset = {
        "src": src,
        "width": width,
        "height": height,
        "alt": "Hình minh họa từ file gốc",
        "source": method,
        "repairCodes": repair_codes,
        "displayMode": "figure_reference" if repair_codes == ["display.image_missing"] else "source_snippet_repair",
    }
    if page is not None:
        asset["page"] = page
    if score is not None:
        asset["matchScore"] = score
    if rect is not None:
        asset["crop"] = [round(rect.x0, 2), round(rect.y0, 2), round(rect.x1, 2), round(rect.y1, 2)]
    assets[item_id] = asset
    if source_id:
        assets[source_id] = asset


def main() -> None:
    parser = argparse.ArgumentParser(description="Recover Math 10 figure assets by cropping source PDF question blocks.")
    parser.add_argument("--limit", type=int, default=0, help="Process only the first N image-missing items.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing recovered image files.")
    args = parser.parse_args()
    recover(limit=args.limit, overwrite=args.overwrite)


if __name__ == "__main__":
    main()
