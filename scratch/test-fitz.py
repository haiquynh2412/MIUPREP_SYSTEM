import fitz # PyMuPDF
import sys

# Reconfigure stdout to support UTF-8 on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 10\DS_C1_So gan dung va Sai so.pdf"

try:
    doc = fitz.open(file_path)
    print(f"Number of pages: {len(doc)}")
    
    text = ""
    for i in range(min(5, len(doc))):
        page = doc[i]
        text += f"\n--- PAGE {i+1} ---\n"
        text += page.get_text()
        
    print("EXTRACTED TEXT PREVIEW:")
    print(text[:1500])
except Exception as e:
    print(f"Error: {e}")
