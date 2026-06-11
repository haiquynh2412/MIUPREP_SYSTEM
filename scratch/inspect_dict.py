import fitz
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

# Dict structure: page has blocks, block has lines, line has spans, span has text, font, size, bbox
data = page.get_text("dict")

# Print first 3 blocks
for block_idx, block in enumerate(data["blocks"][:8]):
    if "lines" not in block:
        continue
    print(f"\n--- Block {block_idx} ---")
    for line_idx, line in enumerate(block["lines"]):
        line_text = ""
        spans_info = []
        for span in line["spans"]:
            spans_info.append({
                "text": span["text"],
                "font": span["font"],
                "size": round(span["size"], 1),
                "bbox": [round(c, 1) for c in span["bbox"]]
            })
        print(f"  Line {line_idx} spans: {spans_info}")
