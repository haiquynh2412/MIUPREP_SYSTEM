import json
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

print("Searching for accented bracket patterns...")

accent_chars = ['Ä', 'ä', 'Ç', 'ô', 'ñ', 'å', 'ö', 'ü']

count = 0
for src in raw_data.get("sources", []):
    text = src["text"]
    rel_path = src["relativePath"]
    
    # Check if any accented char is in the text
    found = [c for c in accent_chars if c in text]
    if found:
        # Find lines containing these characters
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(c in line for c in found):
                # Print context (previous line, current line, next line)
                print(f"\nSource: {rel_path} (Line {i+1})")
                print(f"Found characters: {', '.join([c for c in found if c in line])}")
                if i > 0:
                    print(f"  [i-1] {lines[i-1].strip()}")
                print(f"  [i]   {line.strip()}")
                if i < len(lines) - 1:
                    print(f"  [i+1] {lines[i+1].strip()}")
                count += 1
                if count >= 30:
                    break
    if count >= 30:
        break
