import fitz
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

print("=== Standard Text Extraction ===")
print(page.get_text("text")[:400])

print("\n=== Sorted Text Extraction (top-to-bottom, left-to-right) ===")
# PyMuPDF allows sorting text blocks by coordinate
print(page.get_text("text", sort=True)[:400])

print("\n=== Blocks Extraction ===")
blocks = page.get_text("blocks")
for b in blocks[:10]:
    # block tuple: (x0, y0, x1, y1, "text", block_no, block_type)
    print(f"Block {b[5]} ({b[0]:.1f}, {b[1]:.1f}): {b[4].strip().replace('\n', ' ')}")
