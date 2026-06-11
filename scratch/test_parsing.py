import fitz
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
doc = fitz.open(pdf_path)

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

# Reconstruct first 3 pages
full_text = ""
for idx in range(3):
    full_text += f"\n--- PAGE {idx+1} ---\n" + reconstruct_page(doc[idx])

print("=== Reconstructed text preview ===")
print(full_text[:1200])

# Parse exercises
DANG_RE = re.compile(r'^\s*(D\u1ea0NG\s+\d+|D\u1ea1ng\s+\d+)[:.-]?\s*(.*)$', re.MULTILINE | re.IGNORECASE)
BAI_RE = re.compile(r'^\s*(B\u00e0i\s+\d+|V\u00ed\s+d\u1ee5\s+\d+|C\u00e2u\s+\d+)[:.-]?\s*(.*)$', re.MULTILINE | re.IGNORECASE)
HD_RE = re.compile(r'(?:^|\n)\s*(HD|HD:|H\u01b0\u1edbng d\u1eabn|H\u01b0\u1edbng d\u1eabn gi\u1ea3i|L\u1eddi gi\u1ea3i|L\u1eddi gi\u1ea3i chi ti\u1ebft):?\s*', re.IGNORECASE)

print("\n=== Test Parsing Loop ===")
current_dang = "Dạng chung"
current_method = ""

# Let's split the text by Dạng and Bài
lines = full_text.split('\n')
blocks = []
current_block = None

for line in lines:
    dang_match = DANG_RE.match(line)
    if dang_match:
        current_dang = dang_match.group(1) + ": " + dang_match.group(2)
        current_method = ""
        print("Found Dạng:", current_dang)
        continue
        
    bai_match = BAI_RE.match(line)
    if bai_match:
        if current_block:
            blocks.append(current_block)
        current_block = {
            "header": bai_match.group(1),
            "content": bai_match.group(2),
            "dang": current_dang,
            "method": current_method.strip()
        }
        continue
        
    if current_block:
        current_block["content"] += "\n" + line
    else:
        # If no block is active, accumulate into current_method
        if not line.startswith("--- PAGE"):
            current_method += "\n" + line

if current_block:
    blocks.append(current_block)

print("\nParsed blocks count:", len(blocks))
for idx, b in enumerate(blocks[:4]):
    print(f"\n--- Parsed Block {idx+1} ---")
    print("Dạng:", b["dang"])
    print("Method (Theory):", b["method"][:150])
    
    # Split content into prompt and solution
    hd_match = HD_RE.search(b["content"])
    if hd_match:
        prompt = b["content"][:hd_match.start()].strip()
        solution = b["content"][hd_match.end():].strip()
        print("Prompt:", prompt)
        print("Solution (HD):", solution[:200])
    else:
        print("Prompt (No HD):", b["content"][:200])
