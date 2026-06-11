import sys, os

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\VAT LY\vat-ly-nang-cao_aej5nXUCat_880a204426260649ba288e1201f4f991.pdf"

try:
    import fitz # PyMuPDF
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    found_headers = []
    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        lines = text.split("\n")
        for line in lines:
            line_strip = line.strip()
            # Look for "CHUYÊN ĐỀ" or "CHUYEN DE" or "Chuyên đề"
            if "CHUYÊN ĐỀ" in line_strip.upper() or "CHUYÊN ĐỀ" in line_strip:
                found_headers.append((page_num + 1, line_strip))
                
    print("\n--- Found Chuyên đề Headers ---")
    for page, header in found_headers:
        print(f"Page {page}: {header}")
            
except Exception as e:
    import traceback
    traceback.print_exc()
