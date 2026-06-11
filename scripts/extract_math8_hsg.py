import os
import sys
import glob
import json
import re
import hashlib
from datetime import datetime
import fitz  # PyMuPDF

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SOURCE_ROOT = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8"
OUT_PATH = r"reports\content-quality\math8-hsg-raw-extract.json"

DANG_RE = re.compile(r'^\s*(D\u1ea0NG\s+\d+|D\u1ea1ng\s+\d+|Chuy\u00ean\s+\u0111\u1ec1\s+\d+|CHUY\u00caN\s+\u0110\u1ec0\s+\d+)[:.-]?\s*(.*)$', re.IGNORECASE)
BAI_RE = re.compile(r'^\s*(B\u00e0i\s+\d+|V\u00ed\s+d\u1ee5\s+\d+|C\u00e2u\s+\d+|B\u00e0i\s+t\u1eadp\s+\d+)[:.-]?\s*(.*)$', re.IGNORECASE)
HD_RE = re.compile(r'(?:^|\n)\s*[^a-zA-Z0-9\s]{0,3}\s*(HD|HD:|H\u01b0\u1edbng d\u1eabn|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|L\u1eddi gi\u1ea3i|L\u1eddi gi\u1ea3i chi ti\u1ebft|HD\s*):?\s*', re.IGNORECASE)

def get_slug(value):
    normalized = value.lower()
    normalized = re.sub(r'[^a-z0-9]+', '-', normalized)
    normalized = normalized.strip('-')
    if not normalized:
        normalized = "source"
    sha1 = hashlib.sha1(value.encode('utf-8')).hexdigest()
    hash_part = sha1[:8]
    return f"{normalized[:52]}-{hash_part}"

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

def parse_hsg_pdf(pdf_path):
    print(f"Parsing PDF: {os.path.basename(pdf_path)}")
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening {pdf_path}: {e}")
        return "", []
        
    full_text_list = []
    for page in doc:
        full_text_list.append(reconstruct_page(page))
        
    full_text = "\n".join(full_text_list)
    
    # Parse blocks by Dạng and Bài
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
        
    # Process blocks to split into prompt and solution
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
            
        # Ignore extremely short/garbage blocks
        if len(prompt) < 15:
            continue
            
        final_blocks.append({
            "header": b["header"],
            "prompt": prompt,
            "solution": solution,
            "dang": b["dang"],
            "method": b["method"]
        })
        
    print(f"Extracted {len(final_blocks)} blocks from {os.path.basename(pdf_path)}")
    return full_text, final_blocks

def main():
    print("Native PDF HSG Extractor started...")
    pdf_pattern = os.path.join(SOURCE_ROOT, "*.pdf")
    pdf_files = glob.glob(pdf_pattern)
    
    hsg_files = []
    for f in pdf_files:
        name = os.path.basename(f).lower()
        if "boi-duong" in name or "hsg" in name or "chuyen-de" in name or "tai-lieu" in name:
            if "tai-lieu-hoc-them-mon-toan-8-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-1.pdf" in f:
                continue
            hsg_files.append(f)
    print(f"Found {len(hsg_files)} HSG PDF files to process.")
    
    sources = []
    
    for idx, filepath in enumerate(sorted(hsg_files)):
        filename = os.path.basename(filepath)
        print(f"[{idx+1}/{len(hsg_files)}] Processing {filename}...")
        
        full_text, parsed_blocks = parse_hsg_pdf(filepath)
        
        sources.append({
            "fileName": filename,
            "relativePath": filename,
            "path": filepath,
            "extension": "pdf",
            "text": full_text,
            "richExtraction": True,
            "rawOleMarkerCount": 0,
            "formulaAssetCount": 0,
            "formulaAssets": [],
            "parsedBlocks": parsed_blocks
        })
        
    payload = {
        "schemaVersion": "math8_hsg_raw_extract_v1",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "sourceRoot": SOURCE_ROOT,
        "sources": sources
    }
    
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully wrote {len(sources)} HSG sources to {OUT_PATH}")

if __name__ == "__main__":
    main()
