import hashlib
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone

import fitz  # PyMuPDF


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


SOURCE_ROOT = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\TOAN 9"
OUT_PATH = r"reports\content-quality\math9-hsg-pdf-raw-extract.json"

INCLUDE_KEYWORDS = [
    "boi duong",
    "hoc sinh gioi",
    " hsg",
    "hsg ",
    "nang cao",
    "cuc tri",
    "bat dang thuc",
    "nghiem nguyen",
    "dirich",
    "de chuyen",
    "toan chuyen",
    "chuyen giai",
    "may tinh bo tui",
]

EXCLUDE_PATH_PARTS = [
    "24-chuyen-de-dai-so-boi-duong-hoc-sinh-gioi-toan-9-va-on-thi-vao-lop-10",
]

SECTION_RE = re.compile(
    r"^\s*((?:D[\w\u00c0-\u1ef9]*ng|Chuy[\w\u00c0-\u1ef9]*n\s+d[\w\u00c0-\u1ef9]*|CHU\s*DE|Ch[\w\u00c0-\u1ef9]*\s*d[\w\u00c0-\u1ef9]*)\s*(?:\d+|[IVXLC]+)?)[\s:.-]*(.*)$",
    re.IGNORECASE,
)
EXERCISE_RE = re.compile(
    r"^\s*((?:B[\w\u00c0-\u1ef9]{0,4}i|C[\w\u00c0-\u1ef9]{0,4}u)(?:\s+t[\w\u00c0-\u1ef9]{0,4}p)?\s*(?:\d+|[IVXLC]+)|V[\w\u00c0-\u1ef9]{0,4}\s*d[\w\u00c0-\u1ef9]{0,4}\s*\d+|B[\w\u00c0-\u1ef9]{0,4}i\s*to[\w\u00c0-\u1ef9]{0,4}n\s*\d+)[\s:.)-]*(.*)$",
    re.IGNORECASE,
)
SOLUTION_RE = re.compile(
    r"(?:^|\n)\s*(?:HD|H[\w\u00c0-\u1ef9]*ng\s+d[\w\u00c0-\u1ef9]*n(?:\s+gi[\w\u00c0-\u1ef9]*i)?|L[\w\u00c0-\u1ef9]*i\s+gi[\w\u00c0-\u1ef9]*i(?:\s+chi\s+ti[\w\u00c0-\u1ef9]*t)?|B[\w\u00c0-\u1ef9]*i\s+gi[\w\u00c0-\u1ef9]*i|D[\w\u00c0-\u1ef9]*p\s+[\w\u00c0-\u1ef9]*n|Solution)\s*[:.-]?\s*",
    re.IGNORECASE,
)

PDF_TEXT_REPAIRS = [
    ("\u00d0?t", "\u0110\u1eb7t"),
    ("\u00d0at", "\u0110\u1eb7t"),
    ("lo?i", "lo\u1ea1i"),
    ("Lo?i", "Lo\u1ea1i"),
    ("v?i", "v\u1edbi"),
    ("V?i", "V\u1edbi"),
    ("ph?i", "ph\u1ea3i"),
    ("ho?c", "ho\u1eb7c"),
    ("Gi?i", "Gi\u1ea3i"),
    ("gi?i", "gi\u1ea3i"),
    ("du?c", "\u0111\u01b0\u1ee3c"),
    ("Du?c", "\u0110\u01b0\u1ee3c"),
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
    ("s? nguy\u00ean", "s\u1ed1 nguy\u00ean"),
    ("s? t\u1ef1 nhi\u00ean", "s\u1ed1 t\u1ef1 nhi\u00ean"),
    ("s? ch\u1eb5n", "s\u1ed1 ch\u1eb5n"),
    ("s? l\u1ebb", "s\u1ed1 l\u1ebb"),
    ("(l?)", "(l\u1ebb)"),
    ("(ch?n)", "(ch\u1eb5n)"),
    ("?T\u00ednh", "? T\u00ednh"),
]


def normalize(value):
    text = unicodedata.normalize("NFD", str(value or ""))
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("\u0111", "d").replace("\u0110", "D")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return f" {text.strip()} "


def compact_spaces(value):
    lines = []
    for raw_line in str(value or "").splitlines():
        line = re.sub(r"[ \t\u00a0]+", " ", raw_line).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)


def repair_pdf_text(value):
    text = str(value or "")
    for before, after in PDF_TEXT_REPAIRS:
        text = text.replace(before, after)
    text = re.sub(r"\?([A-Z\u0110])", r"? \1", text)
    return text


def slug(value):
    normalized = normalize(value).strip().replace(" ", "-")
    normalized = re.sub(r"[^a-z0-9-]+", "-", normalized).strip("-") or "source"
    digest = hashlib.sha1(value.encode("utf-8", errors="ignore")).hexdigest()[:8]
    return f"{normalized[:52]}-{digest}"


def should_include(path):
    rel_norm = normalize(os.path.relpath(path, SOURCE_ROOT))
    if any(part in rel_norm for part in EXCLUDE_PATH_PARTS):
        return False
    if not path.lower().endswith(".pdf"):
        return False
    return any(keyword in rel_norm for keyword in INCLUDE_KEYWORDS)


def list_pdf_sources():
    sources = []
    for root, _dirs, files in os.walk(SOURCE_ROOT):
        for name in files:
            path = os.path.join(root, name)
            if should_include(path):
                sources.append(path)
    return sorted(sources, key=lambda value: normalize(os.path.relpath(value, SOURCE_ROOT)))


def reconstruct_page(page):
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


def split_prompt_solution(content):
    match = SOLUTION_RE.search(content)
    if not match:
        return content.strip(), ""
    return content[: match.start()].strip(), content[match.end() :].strip()


def parse_exercise_blocks(text):
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


def blocks_to_import_text(blocks):
    chunks = []
    for block in blocks:
        head = "\n".join(part for part in [block["section"], block["header"]] if part)
        chunk = f"{head}\n{block['prompt']}".strip()
        if block["solution"]:
            chunk += f"\n\nLoi giai nguon:\n{block['solution']}"
        chunks.append(chunk)
    return "\n\n".join(chunks)


def parse_pdf(path):
    doc = fitz.open(path)
    pages = [reconstruct_page(page) for page in doc]
    full_text = repair_pdf_text(compact_spaces("\n".join(pages)))
    blocks = parse_exercise_blocks(full_text)
    import_text = blocks_to_import_text(blocks) if blocks else full_text
    return full_text, import_text, blocks, doc.page_count


def main():
    pdf_files = list_pdf_sources()
    print(f"Found {len(pdf_files)} Math 9 HSG/advanced PDF files.")

    sources = []
    for index, path in enumerate(pdf_files, start=1):
        rel = os.path.relpath(path, SOURCE_ROOT)
        print(f"[{index}/{len(pdf_files)}] {rel}")
        try:
            full_text, import_text, blocks, page_count = parse_pdf(path)
            sources.append(
                {
                    "fileName": os.path.basename(path),
                    "relativePath": rel.replace(os.sep, "/"),
                    "path": path,
                    "extension": "pdf",
                    "text": import_text,
                    "fullText": full_text,
                    "richExtraction": True,
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
                    "fileName": os.path.basename(path),
                    "relativePath": rel.replace(os.sep, "/"),
                    "path": path,
                    "extension": "pdf",
                    "text": "",
                    "richExtraction": False,
                    "rawOleMarkerCount": 0,
                    "formulaRecoveryGap": 0,
                    "formulaAssetCount": 0,
                    "formulaAssets": [],
                    "error": str(exc),
                    "slug": slug(rel),
                }
            )

    payload = {
        "schemaVersion": "math9_hsg_pdf_raw_extract_v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceRoot": SOURCE_ROOT,
        "sources": sources,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
    print(f"Wrote {len(sources)} PDF sources to {OUT_PATH}")


if __name__ == "__main__":
    main()
