import fitz  # PyMuPDF
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"

try:
    doc = fitz.open(pdf_path)
    print("PDF successfully opened. Pages:", len(doc))
    
    # Extract page 1
    page = doc[0]
    text = page.get_text()
    print("--- Page 1 Text ---")
    print(text[:1000])
    
    # Check if there are images
    image_list = page.get_images()
    print("--- Page 1 Images count:", len(image_list))
except Exception as e:
    print("Error:", e)
