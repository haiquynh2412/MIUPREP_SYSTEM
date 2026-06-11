import argparse
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET


MARKER = "\u0001"
W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
M_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/math}"


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def extract_docx_text(path: Path) -> tuple[str, int]:
    with zipfile.ZipFile(path) as archive:
        xml_bytes = archive.read("word/document.xml")

    root = ET.fromstring(xml_bytes)
    formula_like_count = 0
    paragraphs: list[str] = []

    for paragraph in root.iter(f"{W_NS}p"):
      parts: list[str] = []
      for child in paragraph:
          formula_like_count += collect_text(child, parts)
      text = re.sub(r"[ \t]+", " ", "".join(parts)).strip()
      if text:
          paragraphs.append(text)

    return "\n".join(paragraphs), formula_like_count


def collect_text(node: ET.Element, parts: list[str]) -> int:
    name = local_name(node.tag)
    if name in {"oMath", "oMathPara"} or node.tag.startswith(M_NS):
        parts.append(f" {MARKER} ")
        return 1
    if name in {"drawing", "object", "pict"}:
        parts.append(f" {MARKER} ")
        return 1
    if name == "t" and node.text:
        parts.append(node.text)
        return 0
    if name == "tab":
        parts.append("\t")
        return 0
    if name in {"br", "cr"}:
        parts.append("\n")
        return 0

    count = 0
    for child in node:
        count += collect_text(child, parts)
    return count


def read_file_list(file_list_path: Path, source_root: Path) -> list[Path]:
    files: list[Path] = []
    for line in file_list_path.read_text(encoding="utf-8-sig").splitlines():
        value = line.strip()
        if not value or value.startswith("#"):
            continue
        candidate = Path(value)
        if not candidate.is_absolute():
            candidate = source_root / value.replace("/", "\\")
        if candidate.suffix.lower() == ".docx":
            files.append(candidate)
    return files


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", default=r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\TOAN 9")
    parser.add_argument("--file-list", required=True)
    parser.add_argument("--out", default=r"reports\content-quality\math9-plain-docx-raw-extract.json")
    args = parser.parse_args()

    source_root = Path(args.source_root)
    file_list = Path(args.file_list)
    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = Path.cwd() / out_path

    sources = []
    for path in read_file_list(file_list, source_root):
        relative_path = path.relative_to(source_root).as_posix() if path.is_relative_to(source_root) else path.name
        try:
            text, formula_like_count = extract_docx_text(path)
            sources.append({
                "fileName": path.name,
                "relativePath": relative_path,
                "path": str(path),
                "extension": "docx",
                "text": text,
                "richExtraction": False,
                "richExtractionMethod": "docx_xml_plain_text",
                "formulaAssetCount": 0,
                "formulaAssets": [],
                "inlineShapeCount": formula_like_count,
                "exportedInlineShapes": 0,
                "rawOleMarkerCount": formula_like_count,
            })
        except Exception as exc:
            sources.append({
                "fileName": path.name,
                "relativePath": relative_path,
                "path": str(path),
                "extension": "docx",
                "text": "",
                "richExtraction": False,
                "formulaAssetCount": 0,
                "rawOleMarkerCount": 0,
                "error": str(exc),
            })

    payload = {
        "schemaVersion": "math9_plain_docx_raw_extract_v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceRoot": str(source_root),
        "sources": sources,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "sources": len(sources),
        "formulaLikeMarkers": sum(int(source.get("rawOleMarkerCount") or 0) for source in sources),
        "out": str(out_path),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
