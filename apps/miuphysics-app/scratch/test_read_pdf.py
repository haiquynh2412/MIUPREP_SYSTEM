import fitz

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\VAT LY\vat-ly-nang-cao_aej5nXUCat_880a204426260649ba288e1201f4f991.pdf"

try:
    doc = fitz.open(pdf_path)
    print(f"FILE: {pdf_path}")
    print(f"PAGES: {len(doc)}")
    if len(doc) > 0:
        print(f"PAGE 1 TEXT PREVIEW:\n{doc[0].get_text()[:500]}")
except Exception as e:
    import traceback
    traceback.print_exc()
