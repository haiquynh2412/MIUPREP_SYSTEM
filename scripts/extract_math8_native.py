import os
import sys
import io
import glob
import json
import re
import zipfile
import hashlib
from datetime import datetime
from PIL import Image
import xml.etree.ElementTree as ET

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Settings
SOURCE_ROOT = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\extracted_kntt"
OUT_PATH = r"reports\content-quality\math8-rich-raw-extract.json"
ASSET_PUBLIC_ROOT = r"apps\miuprep-portal\public\assets\math8\formulas"

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'v': 'urn:schemas-microsoft-com:vml',
    'o': 'urn:schemas-microsoft-com:office:office',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'
}

def get_ns_tag(tag, ns_key):
    return f"{{{namespaces[ns_key]}}}{tag}"

def get_slug(value):
    normalized = value.lower()
    normalized = re.sub(r'[^a-z0-9]+', '-', normalized)
    normalized = normalized.strip('-')
    if not normalized:
        normalized = "source"
    sha1 = hashlib.sha1(value.encode('utf-8')).hexdigest()
    hash_part = sha1[:8]
    return f"{normalized[:52]}-{hash_part}"

def count_ole_markers(text):
    # Matches character code 1 (the OLE marker)
    return text.count('\x01')

def parse_docx_rich(docx_path, chapter_slug, asset_target_dir, asset_public_base):
    # Ensure asset target directory exists
    os.makedirs(asset_target_dir, exist_ok=True)
    
    with zipfile.ZipFile(docx_path) as z:
        # Load relationships
        rels_xml = z.read("word/_rels/document.xml.rels")
        rels_root = ET.fromstring(rels_xml)
        rels_map = {}
        for rel in rels_root.findall('.//rel:Relationship', namespaces):
            r_id = rel.attrib.get('Id')
            target = rel.attrib.get('Target')
            rels_map[r_id] = target

        # Load main document
        doc_xml = z.read("word/document.xml")
        root = ET.fromstring(doc_xml)

        text_parts = []
        formula_assets = []
        formula_counter = 0

        # Recursive text extractor that maintains order
        def traverse(element):
            nonlocal formula_counter
            tag = element.tag
            
            # Paragraph
            if tag == get_ns_tag('p', 'w'):
                for child in element:
                    traverse(child)
                text_parts.append('\n')
                return
                
            # Text run
            if tag == get_ns_tag('t', 'w'):
                if element.text:
                    text_parts.append(element.text)
                return
                
            # Line break
            if tag == get_ns_tag('br', 'w'):
                text_parts.append('\n')
                return
                
            # Tab
            if tag == get_ns_tag('tab', 'w'):
                text_parts.append('\t')
                return
                
            # Object (Formula)
            if tag == get_ns_tag('object', 'w'):
                # Find imagedata
                imagedata = element.find('.//v:imagedata', namespaces)
                if imagedata is not None:
                    r_id_key = get_ns_tag('id', 'r')
                    r_id = imagedata.attrib.get(r_id_key)
                    if r_id and r_id in rels_map:
                        target_media = rels_map[r_id]
                        zip_media_path = "word/" + target_media.lstrip("word/")
                        
                        formula_counter += 1
                        asset_name = f"formula{formula_counter:04d}.png"
                        target_path = os.path.join(asset_target_dir, asset_name)
                        public_path = f"{asset_public_base}/{asset_name}"
                        
                        copied = False
                        width, height = None, None
                        
                        try:
                            # Extract media data from zip in-memory
                            media_data = z.read(zip_media_path)
                            
                            # Convert to PNG using Pillow in-memory
                            try:
                                im = Image.open(io.BytesIO(media_data))
                                width, height = im.size
                                im.save(target_path, "PNG")
                                copied = True
                            except Exception as ex:
                                print(f"  Pillow failed for {zip_media_path}: {ex}")
                                
                        except Exception as ex:
                            print(f"  Failed reading/saving media {zip_media_path}: {ex}")
                        
                        # Generate token placeholder in text
                        token_parts = [f"{{formula:{public_path}"]
                        if width:
                            token_parts.append(f"|w={width}")
                        if height:
                            token_parts.append(f"|h={height}")
                        token_parts.append("}}")
                        token = "".join(token_parts)
                        
                        text_parts.append(f" {token} ")
                        
                        formula_assets.append({
                            "src": public_path,
                            "width": width,
                            "height": height,
                            "fileName": asset_name,
                            "copied": copied,
                            "source": f"inlineShape:{formula_counter}",
                            "exportMethod": "zip_pillow_png" if copied else "failed"
                        })
                        return
            
            # Default traverse children
            for child in element:
                traverse(child)

        # Traverse document body
        body = root.find('.//w:body', namespaces)
        if body is not None:
            traverse(body)
        else:
            traverse(root)

        full_text = "".join(text_parts)

        return full_text, formula_assets, formula_counter

def main():
    print(f"Native Python docx extractor started at {datetime.now()}")
    print(f"Scanning source directory: {SOURCE_ROOT}")
    
    docx_files = []
    # Find all .docx files in SOURCE_ROOT, skip lock files
    for entry in os.listdir(SOURCE_ROOT):
        if entry.lower().endswith(".docx") and not entry.startswith("~$"):
            docx_files.append(os.path.join(SOURCE_ROOT, entry))
            
    docx_files.sort()
    print(f"Found {len(docx_files)} valid docx files to process.")
    
    sources = []
    processed_count = 0
    
    for docx_path in docx_files:
        filename = os.path.basename(docx_path)
        # Generate relative path as name
        relative_path = filename
        chapter_slug = get_slug(relative_path)
        asset_target_dir = os.path.join(ASSET_PUBLIC_ROOT, chapter_slug)
        asset_public_base = f"/assets/math8/formulas/{chapter_slug}"
        
        print(f"[{processed_count + 1}/{len(docx_files)}] Extracting rich {relative_path}...")
        
        try:
            full_text, formula_assets, shape_count = parse_docx_rich(
                docx_path, 
                chapter_slug, 
                asset_target_dir, 
                asset_public_base
            )
            
            sources.append({
                "fileName": filename,
                "relativePath": relative_path,
                "path": docx_path,
                "extension": "docx",
                "text": full_text,
                "richExtraction": True,
                "richExtractionMethod": "zip_pillow_png",
                "assetBasePath": asset_public_base,
                "formulaAssetCount": len(formula_assets),
                "formulaAssets": formula_assets,
                "inlineShapeCount": shape_count,
                "exportedInlineShapes": len([a for a in formula_assets if a["copied"]]),
                "rawOleMarkerCount": count_ole_markers(full_text)
            })
            print(f"  Extracted {len(formula_assets)} formula images successfully.")
            
        except Exception as e:
            print(f"  Error extracting {relative_path}: {e}")
            sources.append({
                "fileName": filename,
                "relativePath": relative_path,
                "path": docx_path,
                "extension": "docx",
                "text": "",
                "richExtraction": False,
                "formulaAssetCount": 0,
                "rawOleMarkerCount": 0,
                "error": str(e)
            })
            
        processed_count += 1
        
        # Write intermediate payload to avoid losing progress
        write_payload(sources)
        
    print(f"Finished extracting {processed_count} sources.")
    print(f"Wrote rich extracted sources to {OUT_PATH}")

def write_payload(sources):
    payload = {
        "schemaVersion": "math8_rich_raw_extract_v1",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "sourceRoot": SOURCE_ROOT,
        "assetPublicRoot": "/assets/math8/formulas",
        "sources": sources
    }
    
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
