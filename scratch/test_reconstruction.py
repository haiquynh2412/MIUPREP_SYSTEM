import fitz
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
doc = fitz.open(pdf_path)
page = doc[0]
data = page.get_text("dict")

# Flatten all spans from all blocks
spans = []
for block in data["blocks"]:
    if "lines" not in block:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            # Ignore empty/whitespace spans that are not meaningful gaps
            if not span["text"].strip():
                continue
            spans.append(span)

# Sort spans by y0 (top coordinate) first
spans.sort(key=lambda s: s["bbox"][1])

# Group spans into lines
lines = []
for span in spans:
    placed = False
    s_y0 = span["bbox"][1]
    s_y1 = span["bbox"][3]
    s_height = s_y1 - s_y0
    
    for line in lines:
        # Check vertical overlap
        # Calculate overlap height
        overlap_y0 = max(line["y0"], s_y0)
        overlap_y1 = min(line["y1"], s_y1)
        overlap = overlap_y1 - overlap_y0
        
        # If vertical overlap is more than 35% of the span height or line height, group them
        min_h = min(line["y1"] - line["y0"], s_height)
        if overlap > 0.35 * min_h:
            line["spans"].append(span)
            line["y0"] = min(line["y0"], s_y0)
            line["y1"] = max(line["y1"], s_y1)
            placed = True
            break
            
    if not placed:
        lines.append({
            "y0": s_y0,
            "y1": s_y1,
            "spans": [span]
        })

# Sort lines by y0
lines.sort(key=lambda l: l["y0"])

print("=== Reconstructed Text with Superscripts ===")
for idx, line in enumerate(lines):
    # Sort spans in line by x0
    line_spans = sorted(line["spans"], key=lambda s: s["bbox"][0])
    
    # Find dominant font size
    sizes = [s["size"] for s in line_spans]
    # Dominant size is the max size or mode
    main_size = max(sizes) if sizes else 12.0
    
    line_text = ""
    last_x1 = None
    
    for s in line_spans:
        text = s["text"]
        size = s["size"]
        x0, y0, x1, y1 = s["bbox"]
        
        # Insert space if there is a horizontal gap
        if last_x1 is not None and (x0 - last_x1) > 3.0:
            if not line_text.endswith(" ") and not text.startswith(" "):
                line_text += " "
                
        # Detect superscript
        # If size is smaller and y0 is higher than baseline (approx y1 is in upper half)
        # Main baseline is line["y1"]
        is_small = size < 0.85 * main_size
        mid_y = (y0 + y1) / 2.0
        line_mid = (line["y0"] + line["y1"]) / 2.0
        
        if is_small and mid_y < line_mid:
            # Superscript
            # Clean up the text
            clean_text = text.strip()
            if clean_text:
                line_text += f"^{clean_text}"
        elif is_small and mid_y > line_mid + 2.0:
            # Subscript
            clean_text = text.strip()
            if clean_text:
                line_text += f"_{clean_text}"
        else:
            line_text += text
            
        last_x1 = x1
        
    print(line_text.strip())
