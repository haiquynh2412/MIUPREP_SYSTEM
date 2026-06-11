import os
import sys
import json
import datetime
import fitz # PyMuPDF

# Reconfigure stdout to support UTF-8 on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_root = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 10"
file_list_path = os.path.join(workspace_root, "reports", "content-quality", "math10-files.txt")
out_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

print(f"Workspace root: {workspace_root}")
print(f"Source root: {source_root}")
print(f"File list path: {file_list_path}")
print(f"Output path: {out_path}")

if not os.path.exists(file_list_path):
    print(f"Error: File list not found at {file_list_path}")
    sys.exit(1)

with open(file_list_path, "r", encoding="utf-8") as f:
    files_to_process = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]

print(f"Found {len(files_to_process)} files to process in the list.")

sources = []
for index, rel_path in enumerate(files_to_process):
    full_path = os.path.join(source_root, rel_path.replace("/", "\\"))
    file_name = os.path.basename(full_path)
    
    print(f"[{index+1}/{len(files_to_process)}] Processing: {rel_path} ... ", end="", flush=True)
    
    if not os.path.exists(full_path):
        print("FAILED (File not found)")
        sources.append({
            "fileName": file_name,
            "relativePath": rel_path.replace("\\", "/"),
            "path": full_path,
            "extension": "pdf",
            "text": "",
            "richExtraction": False,
            "error": "File not found"
        })
        continue
        
    try:
        doc = fitz.open(full_path)
        text_pages = []
        for page in doc:
            # Sorting by coordinates keeps inline math in reading order for many PDFs
            # where formulas are encoded as positioned glyph runs.
            text_pages.append(page.get_text("text", sort=True))
        
        extracted_text = "\n".join(text_pages)
        
        sources.append({
            "fileName": file_name,
            "relativePath": rel_path.replace("\\", "/"),
            "path": full_path,
            "extension": "pdf",
            "text": extracted_text,
            "richExtraction": True,
            "richExtractionMethod": "pdf_pymupdf",
            "assetBasePath": f"/assets/math10/formulas/{file_name.lower().replace('.', '_')}",
            "formulaAssetCount": 0,
            "formulaAssets": [],
            "inlineShapeCount": 0,
            "exportedInlineShapes": 0,
            "rawOleMarkerCount": 0
        })
        print(f"OK ({len(extracted_text)} chars, {len(doc)} pages)")
    except Exception as e:
        print(f"FAILED (Error: {e})")
        sources.append({
            "fileName": file_name,
            "relativePath": rel_path.replace("\\", "/"),
            "path": full_path,
            "extension": "pdf",
            "text": "",
            "richExtraction": False,
            "error": str(e)
        })

payload = {
    "schemaVersion": "math10_rich_raw_extract_v1",
    "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "sourceRoot": source_root,
    "assetPublicRoot": "/assets/math10/formulas",
    "sources": sources
}

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully wrote {len(sources)} extracted sources to {out_path}")
