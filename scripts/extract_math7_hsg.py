import os
import sys
import glob
import json
import re
import zipfile
import hashlib
from xml.etree import ElementTree as ET
from datetime import datetime, timezone
import fitz  # PyMuPDF

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SOURCE_ROOT = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 7"
OUT_PATH = r"reports\content-quality\math7-hsg-raw-extract.json"

DANG_RE = re.compile(r'^\s*(D\u1ea0NG\s+\d+|D\u1ea1ng\s+\d+|Chuy\u00ean\s+\u0111\u1ec1\s+\d+|CHUY\u00caN\s+\u0110\u1ec0\s+\d+|Ch\u1ee7\s+\u0111\u1ec1\s+\d+|CH\u1ee6\s+\u0110\u1ec0\s+\d+)[:.-]?\s*(.*)$', re.IGNORECASE)
BAI_RE = re.compile(r'^\s*(B\u00e0i\s+\d+|V\u00ed\s+d\u1ee5\s+\d+|C\u00e2u\s+\d+|B\u00e0i\s+t\u1eadp\s+\d+)[:.-]?\s*(.*)$', re.IGNORECASE)
HD_RE = re.compile(r'(?:^|\n)\s*[^a-zA-Z0-9\s]{0,3}\s*(HD|HD:|H\u01b0\u1edbng d\u1eabn|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|L\u1eddi gi\u1ea3i|L\u1eddi gi\u1ea3i chi ti\u1ebft|Gi\u1ea3i|Tr\u00ecnh b\u00e0y l\u1eddi gi\u1ea3i|Ch\u1ee9ng minh|HD\s*):?\s*', re.IGNORECASE)

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
M_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/math}"
MARKER = "\u0001"

def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag

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

def extract_docx_text(path: str) -> str:
    with zipfile.ZipFile(path) as archive:
        xml_bytes = archive.read("word/document.xml")
    root = ET.fromstring(xml_bytes)
    paragraphs: list[str] = []
    for paragraph in root.iter(f"{W_NS}p"):
        parts: list[str] = []
        for child in paragraph:
            collect_text(child, parts)
        text = re.sub(r"[ \t]+", " ", "".join(parts)).strip()
        if text:
            paragraphs.append(text)
    return "\n".join(paragraphs)

def reconstruct_page(page):
    data = page.get_text("dict")
    spans = []
    for block in data["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if not span["text"].strip():
                    continue
                spans.append(span)
    
    if not spans:
        return ""
        
    spans.sort(key=lambda s: s["bbox"][1])
    
    lines = []
    for span in spans:
        placed = False
        s_y0 = span["bbox"][1]
        s_y1 = span["bbox"][3]
        s_height = s_y1 - s_y0
        
        for line in lines:
            overlap_y0 = max(line["y0"], s_y0)
            overlap_y1 = min(line["y1"], s_y1)
            overlap = overlap_y1 - overlap_y0
            min_h = min(line["y1"] - line["y0"], s_height)
            if overlap > 0.35 * min_h:
                line["spans"].append(span)
                line["y0"] = min(line["y0"], s_y0)
                line["y1"] = max(line["y1"], s_y1)
                placed = True
                break
        if not placed:
            lines.append({"y0": s_y0, "y1": s_y1, "spans": [span]})
            
    lines.sort(key=lambda l: l["y0"])
    
    page_lines = []
    for line in lines:
        line_spans = sorted(line["spans"], key=lambda s: s["bbox"][0])
        sizes = [s["size"] for s in line_spans]
        main_size = max(sizes) if sizes else 12.0
        line_text = ""
        last_x1 = None
        
        for s in line_spans:
            text = s["text"]
            size = s["size"]
            x0, y0, x1, y1 = s["bbox"]
            
            if last_x1 is not None and (x0 - last_x1) > 3.0:
                if not line_text.endswith(" ") and not text.startswith(" "):
                    line_text += " "
            
            is_small = size < 0.85 * main_size
            mid_y = (y0 + y1) / 2.0
            line_mid = (line["y0"] + line["y1"]) / 2.0
            
            if is_small and mid_y < line_mid:
                clean_text = text.strip()
                if clean_text:
                    line_text += f"^{clean_text}"
            elif is_small and mid_y > line_mid + 2.0:
                clean_text = text.strip()
                if clean_text:
                    line_text += f"_{clean_text}"
            else:
                line_text += text
            last_x1 = x1
        page_lines.append(line_text.strip())
    return "\n".join(page_lines)

def parse_extracted_text(full_text: str) -> list[dict]:
    lines = full_text.split('\n')
    parsed_blocks = []
    current_dang = "Dạng chung"
    current_method = ""
    current_block = None
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        dang_match = DANG_RE.match(line_stripped)
        if dang_match:
            if current_block:
                parsed_blocks.append(current_block)
                current_block = None
            current_dang = dang_match.group(1) + ": " + dang_match.group(2)
            current_method = ""
            continue
            
        bai_match = BAI_RE.match(line_stripped)
        if bai_match:
            if current_block:
                parsed_blocks.append(current_block)
            current_block = {
                "header": bai_match.group(1).strip(),
                "content": bai_match.group(2).strip(),
                "dang": current_dang.strip(),
                "method": current_method.strip()
            }
            continue
            
        if current_block:
            current_block["content"] += "\n" + line
        else:
            # Accumulate into method text if no block is active
            if not line_stripped.startswith("--- PAGE") and "GV: " not in line_stripped:
                current_method += "\n" + line

    if current_block:
        parsed_blocks.append(current_block)
        
    final_blocks = []
    for b in parsed_blocks:
        content = b["content"].strip()
        hd_match = HD_RE.search(content)
        if hd_match:
            prompt = content[:hd_match.start()].strip()
            solution = content[hd_match.end():].strip()
        else:
            prompt = content
            solution = ""
            
        if len(prompt) < 15:
            continue
            
        final_blocks.append({
            "header": b["header"],
            "prompt": prompt,
            "solution": solution,
            "dang": b["dang"],
            "method": b["method"]
        })
        
    return final_blocks

def process_file(filepath: str) -> dict:
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        print(f"Parsing PDF: {filename}")
        try:
            doc = fitz.open(filepath)
        except Exception as e:
            return {"error": str(e)}
        full_text_list = []
        for page in doc:
            full_text_list.append(reconstruct_page(page))
        full_text = "\n".join(full_text_list)
    elif ext == ".docx":
        print(f"Parsing DOCX: {filename}")
        try:
            full_text = extract_docx_text(filepath)
        except Exception as e:
            return {"error": str(e)}
    else:
        return {"error": f"Unsupported format: {ext}"}
        
    parsed_blocks = parse_extracted_text(full_text)
    print(f"Extracted {len(parsed_blocks)} blocks from {filename}")
    
    return {
        "fileName": filename,
        "relativePath": filename,
        "path": filepath,
        "extension": ext[1:],
        "text": full_text,
        "richExtraction": True,
        "rawOleMarkerCount": 0,
        "formulaAssetCount": 0,
        "formulaAssets": [],
        "parsedBlocks": parsed_blocks
    }

def main():
    print("Grade 7 content extraction started...")
    
    # Process PDF and DOCX files in SOURCE_ROOT
    files = glob.glob(os.path.join(SOURCE_ROOT, "*.*"))
    target_files = [f for f in files if os.path.splitext(f)[1].lower() in [".pdf", ".docx"]]
    print(f"Found {len(target_files)} target files to process in {SOURCE_ROOT}.")
    
    sources = []
    for idx, filepath in enumerate(sorted(target_files)):
        print(f"[{idx+1}/{len(target_files)}] Processing {os.path.basename(filepath)}...")
        res = process_file(filepath)
        if "error" in res:
            print(f"Error processing {os.path.basename(filepath)}: {res['error']}")
            sources.append({
                "fileName": os.path.basename(filepath),
                "relativePath": os.path.basename(filepath),
                "path": filepath,
                "text": "",
                "error": res["error"]
            })
        else:
            sources.append(res)
            
    payload = {
        "schemaVersion": "math7_hsg_raw_extract_v1",
        "generatedAt": datetime.now(timezone.utc).isoformat() + "Z",
        "sourceRoot": SOURCE_ROOT,
        "sources": sources
    }
    
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully wrote {len(sources)} sources to {OUT_PATH}")

if __name__ == "__main__":
    main()
