import os
import sys
import json
import datetime
import fitz  # PyMuPDF

# Reconfigure stdout to support UTF-8 on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_root = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 11"
out_path = os.path.join(workspace_root, "reports", "content-quality", "math11-rich-raw-extract.json")

print(f"Workspace root: {workspace_root}")
print(f"Source root: {source_root}")
print(f"Output path: {out_path}")

if not os.path.exists(source_root):
    print(f"Error: Source directory not found at {source_root}")
    sys.exit(1)

# Recursively scan for all PDF files in source_root
pdf_files = []
for root, _, files in os.walk(source_root):
    for file in files:
        if file.lower().endswith(".pdf"):
            full_path = os.path.join(root, file)
            # Compute relative path from source_root
            rel_path = os.path.relpath(full_path, source_root).replace("\\", "/")
            pdf_files.append((rel_path, full_path))

# Sort to have deterministic ordering
pdf_files.sort(key=lambda x: x[0])
print(f"Found {len(pdf_files)} PDF files in source root.")

sources = []
for index, (rel_path, full_path) in enumerate(pdf_files):
    file_name = os.path.basename(full_path)
    print(f"[{index+1}/{len(pdf_files)}] Processing: {rel_path} ... ", end="", flush=True)
    
    try:
        doc = fitz.open(full_path)
        text_pages = []
        for page in doc:
            # Sorting by coordinates keeps inline math in reading order
            text_pages.append(page.get_text("text", sort=True))
        
        extracted_text = "\n".join(text_pages)
        
        sources.append({
            "fileName": file_name,
            "relativePath": rel_path,
            "path": full_path,
            "extension": "pdf",
            "text": extracted_text,
            "richExtraction": True,
            "richExtractionMethod": "pdf_pymupdf",
            "assetBasePath": f"/assets/math11/formulas/{file_name.lower().replace('.', '_')}",
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
            "relativePath": rel_path,
            "path": full_path,
            "extension": "pdf",
            "text": "",
            "richExtraction": False,
            "error": str(e)
        })

payload = {
    "schemaVersion": "math11_rich_raw_extract_v1",
    "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
    "sourceRoot": source_root,
    "assetPublicRoot": "/assets/math11/formulas",
    "sources": sources
}

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully wrote {len(sources)} extracted sources to {out_path}")
