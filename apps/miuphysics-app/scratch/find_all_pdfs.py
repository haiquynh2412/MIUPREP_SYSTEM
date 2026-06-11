import os
import fitz

search_dirs = [
    r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM",
    r"C:\Users\HAIQUYNH\.gemini\antigravity\brain\8e91fb49-ef5c-409c-ae0b-01d4e2f308b3"
]

output_file = r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\scratch\pdf_search_results.txt"

with open(output_file, "w", encoding="utf-8") as f:
    f.write("Searching for PDF files...\n")
    for s_dir in search_dirs:
        f.write(f"\nSearching in: {s_dir}\n")
        for root, dirs, files in os.walk(s_dir):
            # Skip node_modules and .git
            if "node_modules" in root or ".git" in root or ".gemini" in root:
                if ".gemini/antigravity/brain" not in root.replace("\\", "/"):
                    continue
            for file in files:
                if file.lower().endswith(".pdf"):
                    path = os.path.join(root, file)
                    try:
                        doc = fitz.open(path)
                        f.write(f"- {file} | Pages: {len(doc)} | Path: {path}\n")
                        if len(doc) > 0:
                            f.write(f"  Preview: {doc[0].get_text()[:200].strip()}\n")
                    except Exception as e:
                        f.write(f"- {file} | Error: {e} | Path: {path}\n")

print(f"Search completed! Results written to {output_file}")
