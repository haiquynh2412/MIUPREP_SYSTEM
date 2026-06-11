import os
import sys
import fitz  # PyMuPDF

# Reconfigure stdout to use UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8"
pdf_files = [
    "tai-lieu-hoc-tap-mon-toan-8-hoc-ki-1-nam-hoc-2025-2026.pdf",
    "tai-lieu-hoc-them-mon-toan-8-sach-ket-noi-tri-thuc-voi-cuoc-song-hoc-ki-1.pdf",
    "cac-chuyen-de-hoc-tap-mon-toan-8-phan-dai-so.pdf"
]

for pdf_name in pdf_files:
    pdf_path = os.path.join(pdf_dir, pdf_name)
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_name}")
        continue
    
    print(f"\nScanning PDF: {pdf_name}")
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening {pdf_name}: {e}")
        continue
        
    print(f"Total pages: {len(doc)}")
    
    # Search for keywords
    keywords = ["HƯỚNG DẪN GIẢI", "LỜI GIẢI", "ĐÁP ÁN", "ĐÁP SỐ", "Bài giải"]
    for kw in keywords:
        matches = []
        for i, page in enumerate(doc):
            text = page.get_text()
            if kw.lower() in text.lower():
                matches.append(i + 1)
        if matches:
            print(f"- Keyword '{kw}': found on {len(matches)} pages. Sample pages: {matches[:10]}")
        else:
            print(f"- Keyword '{kw}': not found")
            
    # Print the last page text to see if there is an answer section
    last_page = doc[-1]
    print("\n--- Last Page Preview ---")
    print(last_page.get_text()[:600])
