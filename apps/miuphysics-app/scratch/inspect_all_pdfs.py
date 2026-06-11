import os
import fitz # PyMuPDF

dir_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\VAT LY"
output_file = os.path.join(os.path.dirname(__file__), "pdf_list.txt")

try:
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("Scanning PDFs in directory:\n")
        for filename in os.listdir(dir_path):
            if filename.lower().endswith(".pdf"):
                file_path = os.path.join(dir_path, filename)
                try:
                    doc = fitz.open(file_path)
                    f.write(f"\n=========================================\n")
                    f.write(f"File: {filename}\n")
                    f.write(f"Total pages: {len(doc)}\n")
                    # Read first page
                    if len(doc) > 0:
                        text = doc[0].get_text()
                        f.write(f"First page preview:\n{text[:500]}\n")
                except Exception as ex:
                    f.write(f"Error reading {filename}: {ex}\n")
    print(f"Completed! Output written to {output_file}")
except Exception as e:
    import traceback
    traceback.print_exc()
