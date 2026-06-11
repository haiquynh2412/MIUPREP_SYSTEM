import os
import docx

dir_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\VAT LY"
output_file = r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\scratch\docx_previews.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for filename in os.listdir(dir_path):
        if filename.lower().endswith(".docx"):
            path = os.path.join(dir_path, filename)
            f.write(f"\n=========================================\n")
            f.write(f"File: {filename}\n")
            try:
                doc = docx.Document(path)
                text = []
                for p in doc.paragraphs[:20]: # first 20 paragraphs
                    text.append(p.text)
                full_text = "\n".join(text)
                f.write(f"Content preview (first 1000 chars):\n{full_text[:1000]}\n")
            except Exception as e:
                f.write(f"Error reading docx: {e}\n")

print(f"Completed! Output written to {output_file}")
