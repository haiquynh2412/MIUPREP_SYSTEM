import fitz
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

html = page.get_text("html")
print("=== HTML Output ===")
# Print first 2000 chars of HTML
print(html[:2000])
