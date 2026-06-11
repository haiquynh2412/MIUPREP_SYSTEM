import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import fitz  # PyMuPDF


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


SECTION_RE = re.compile(
    r"^\s*((?:D[\w\u00c0-\u1ef9]*ng|Chuy[\w\u00c0-\u1ef9]*n\s+d[\w\u00c0-\u1ef9]*|CHU\s*DE|CHỦ\s*ĐỀ|Ch[\w\u00c0-\u1ef9]*\s*d[\w\u00c0-\u1ef9]*|B[\w\u00c0-\u1ef9]*i\s+t[\w\u00c0-\u1ef9]*p\s+t[\w\u00c0-\u1ef9]*ng\s+h[\w\u00c0-\u1ef9]*p)\s*(?:\d+|[IVXLC]+)?)[\s:.-]*(.*)$",
    re.IGNORECASE,
)
EXERCISE_RE = re.compile(
    r"^\s*((?:B[\w\u00c0-\u1ef9]{0,4}i|C[\w\u00c0-\u1ef9]{0,4}u)(?:\s+t[\w\u00c0-\u1ef9]{0,4}p)?\s*(?:\d+|[IVXLC]+)|V[\w\u00c0-\u1ef9]{0,4}\s*d[\w\u00c0-\u1ef9]{0,4}\s*\d+|B[\w\u00c0-\u1ef9]{0,4}i\s*to[\w\u00c0-\u1ef9]{0,4}n\s*\d+)[\s:.)-]*(.*)$",
    re.IGNORECASE,
)
SOLUTION_RE = re.compile(
    r"(?:^|\n)\s*(?:HD|H[\w\u00c0-\u1ef9]*ng\s+d[\w\u00c0-\u1ef9]*n(?:\s+gi[\w\u00c0-\u1ef9]*i)?|L[\w\u00c0-\u1ef9]*i\s+gi[\w\u00c0-\u1ef9]*i(?:\s+chi\s+ti[\w\u00c0-\u1ef9]*t)?|B[\w\u00c0-\u1ef9]*i\s+gi[\w\u00c0-\u1ef9]*i|D[\w\u00c0-\u1ef9]*p\s+[\w\u00c0-\u1ef9]*n|Đ[\w\u00c0-\u1ef9]*p\s+[\w\u00c0-\u1ef9]*n|Solution)\s*[:.-]?\s*",
    re.IGNORECASE,
)

PDF_TEXT_REPAIRS = [
    ("\u00d0?t", "\u0110\u1eb7t"),
    ("\u00d0at", "\u0110\u1eb7t"),
    ("lo?i", "lo\u1ea1i"),
    ("v?i", "v\u1edbi"),
    ("ph?i", "ph\u1ea3i"),
    ("ho?c", "ho\u1eb7c"),
    ("Gi?i", "Gi\u1ea3i"),
    ("gi?i", "gi\u1ea3i"),
    ("du?c", "\u0111\u01b0\u1ee3c"),
    ("t?c", "t\u1ee9c"),
    ("l?n", "l\u1ea7n"),
    ("nghi?m", "nghi\u1ec7m"),
    ("t?ng", "t\u1ed5ng"),
    ("ch? s?", "ch\u1eef s\u1ed1"),
    ("b?ng", "b\u1eb1ng"),
    ("th?a", "th\u1ecfa"),
    ("nguy?n", "nguy\u00ean"),
    ("gi? s?", "gi\u1ea3 s\u1eed"),
    ("ch?n", "ch\u1eb5n"),
    ("c?p", "c\u1eb7p"),
]


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFD", str(value or ""))
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("\u0111", "d").replace("\u0110", "D").lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def compact_spaces(value: str) -> str:
    lines = []
    for raw_line in str(value or "").splitlines():
        line = re.sub(r"[ \t\u00a0]+", " ", raw_line).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)


def repair_pdf_text(value: str) -> str:
    text = str(value or "")
    for before, after in PDF_TEXT_REPAIRS:
        text = text.replace(before, after)
    text = re.sub(r"\?([A-Z\u0110])", r"? \1", text)
    return text


def slug(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9-]+", "-", normalize(value).replace(" ", "-")).strip("-") or "source"
    digest = hashlib.sha1(value.encode("utf-8", errors="ignore")).hexdigest()[:8]
    return f"{normalized[:52]}-{digest}"


def reconstruct_page(page) -> str:
    data = page.get_text("dict")
    spans = []
    for block in data.get("blocks", []):
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if span.get("text", "").strip():
                    spans.append(span)
    if not spans:
        return ""

    spans.sort(key=lambda item: (item["bbox"][1], item["bbox"][0]))
    lines = []
    for span in spans:
        x0, y0, x1, y1 = span["bbox"]
        height = max(1.0, y1 - y0)
        target = None
        for line in lines:
            overlap = min(line["y1"], y1) - max(line["y0"], y0)
            if overlap > 0.35 * min(line["y1"] - line["y0"], height):
                target = line
                break
        if target is None:
            target = {"y0": y0, "y1": y1, "spans": []}
            lines.append(target)
        target["y0"] = min(target["y0"], y0)
        target["y1"] = max(target["y1"], y1)
        target["spans"].append(span)

    page_lines = []
    for line in sorted(lines, key=lambda item: item["y0"]):
        line_spans = sorted(line["spans"], key=lambda item: item["bbox"][0])
        main_size = max((span.get("size", 12.0) for span in line_spans), default=12.0)
        last_x1 = None
        text = ""
        for span in line_spans:
            span_text = span.get("text", "")
            x0, y0, x1, y1 = span["bbox"]
            if last_x1 is not None and x0 - last_x1 > 3.0 and text and not text.endswith(" "):
                text += " "
            size = span.get("size", main_size)
            mid_y = (y0 + y1) / 2
            line_mid_y = (line["y0"] + line["y1"]) / 2
            clean = span_text.strip()
            if clean and size < 0.85 * main_size and mid_y < line_mid_y:
                text += f"^{clean}"
            elif clean and size < 0.85 * main_size and mid_y > line_mid_y + 2:
                text += f"_{clean}"
            else:
                text += span_text
            last_x1 = x1
        clean_line = re.sub(r"[ \t\u00a0]+", " ", text).strip()
        if clean_line:
            page_lines.append(clean_line)
    return "\n".join(page_lines)


def split_prompt_solution(content: str) -> tuple[str, str]:
    match = SOLUTION_RE.search(content)
    if not match:
        return content.strip(), ""
    return content[: match.start()].strip(), content[match.end() :].strip()


def parse_exercise_blocks(text: str) -> list[dict]:
    blocks = []
    current_section = ""
    current = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        section_match = SECTION_RE.match(line)
        exercise_match = EXERCISE_RE.match(line)
        if section_match and not exercise_match:
            if current:
                blocks.append(current)
                current = None
            current_section = f"{section_match.group(1).strip()} {section_match.group(2).strip()}".strip()
            continue
        if exercise_match:
            if current:
                blocks.append(current)
            current = {
                "section": current_section,
                "header": exercise_match.group(1).strip(),
                "content": exercise_match.group(2).strip(),
            }
            continue
        if current:
            current["content"] += "\n" + line

    if current:
        blocks.append(current)

    parsed = []
    for block in blocks:
        prompt, solution = split_prompt_solution(block["content"])
        if len(normalize(prompt)) < 25:
            continue
        parsed.append(
            {
                "section": block["section"],
                "header": block["header"],
                "prompt": prompt,
                "solution": solution,
            }
        )
    return parsed


def blocks_to_import_text(blocks: list[dict]) -> str:
    chunks = []
    for block in blocks:
        head = "\n".join(part for part in [block["section"], block["header"]] if part)
        chunk = f"{head}\n{block['prompt']}".strip()
        if block["solution"]:
            chunk += f"\n\nLoi giai nguon:\n{block['solution']}"
        chunks.append(chunk)
    return "\n\n".join(chunks)


def parse_pdf(path: Path) -> tuple[str, str, list[dict], int]:
    doc = fitz.open(path)
    try:
        pages = [reconstruct_page(page) for page in doc]
        full_text = repair_pdf_text(compact_spaces("\n".join(pages)))
        blocks = parse_exercise_blocks(full_text)
        import_text = blocks_to_import_text(blocks) if blocks else full_text
        return full_text, import_text, blocks, doc.page_count
    finally:
        doc.close()


def read_file_list(source_root: Path, file_list: Path) -> list[Path]:
    files = []
    for raw in file_list.read_text(encoding="utf-8-sig").splitlines():
        rel = raw.strip().replace("\\", "/")
        if not rel or rel.startswith("#") or not rel.lower().endswith(".pdf"):
            continue
        candidate = source_root / Path(rel)
        if candidate.exists():
            files.append(candidate)
        else:
            print(f"warning: missing source {rel}")
    return files


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", default=r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\TOAN 9")
    parser.add_argument("--file-list", default=r"reports\content-quality\math9-onvao10-file-list.txt")
    parser.add_argument("--out", default=r"reports\content-quality\math9-onvao10-pdf-raw-extract.json")
    args = parser.parse_args()

    source_root = Path(args.source_root)
    file_list = Path(args.file_list)
    pdf_files = read_file_list(source_root, file_list)
    print(f"Found {len(pdf_files)} on-vao-10 PDF files.")

    sources = []
    for index, pdf_path in enumerate(pdf_files, start=1):
        rel = pdf_path.relative_to(source_root).as_posix()
        print(f"[{index}/{len(pdf_files)}] {rel}")
        try:
            full_text, import_text, blocks, page_count = parse_pdf(pdf_path)
            sources.append(
                {
                    "fileName": pdf_path.name,
                    "relativePath": rel,
                    "path": str(pdf_path),
                    "extension": "pdf",
                    "text": import_text,
                    "fullText": full_text,
                    "richExtraction": True,
                    "richExtractionMethod": "pdf_pymupdf_onvao10",
                    "rawOleMarkerCount": 0,
                    "formulaRecoveryGap": 0,
                    "formulaAssetCount": 0,
                    "formulaAssets": [],
                    "pageCount": page_count,
                    "extractedBlockCount": len(blocks),
                    "parsedBlocks": blocks,
                    "slug": slug(rel),
                }
            )
            print(f"  pages={page_count} blocks={len(blocks)} text={len(import_text)}")
        except Exception as exc:
            print(f"  error={exc}")
            sources.append(
                {
                    "fileName": pdf_path.name,
                    "relativePath": rel,
                    "path": str(pdf_path),
                    "extension": "pdf",
                    "text": "",
                    "richExtraction": False,
                    "formulaAssetCount": 0,
                    "formulaAssets": [],
                    "rawOleMarkerCount": 0,
                    "error": str(exc),
                    "slug": slug(rel),
                }
            )

    payload = {
        "schemaVersion": "math9_onvao10_pdf_raw_extract_v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceRoot": str(source_root),
        "sources": sources,
    }
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(sources)} PDF sources to {out_path}")


if __name__ == "__main__":
    main()
