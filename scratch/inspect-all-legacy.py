import json
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

EXERCISE_HEADER_PATTERN = re.compile(r'(?:^|[\r\n\f]|\s)((?:B\w*i|C\w*u|V\w*\s*d|B\w*\s*to\w*n)\s*\d+[:.)-]?)', re.IGNORECASE)

def extract_exercise_blocks(text):
    normalized = text.replace('\r\n', '\n').replace('\r', '\n')
    matches = list(EXERCISE_HEADER_PATTERN.finditer(normalized))
    if not matches:
        return [normalized] if len(normalized.strip()) >= 15 else []
    
    blocks = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(normalized)
        block = normalized[start:end].strip()
        if len(block) >= 15:
            blocks.append(block)
    return blocks

legacy_blocks = []
for src in raw_data["sources"]:
    rel_path = src["relativePath"]
    text = src["text"]
    blocks = extract_exercise_blocks(text)
    for idx, block in enumerate(blocks):
        match = LEGACY_FONT_RE.search(block)
        if match:
            legacy_blocks.append({
                "source": rel_path,
                "q_num": idx + 1,
                "char": match.group(0),
                "block": block
            })

out_path = os.path.join(workspace_root, "scratch", "legacy-blocks.txt")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(f"Total legacy blocks found: {len(legacy_blocks)}\n\n")
    for i, item in enumerate(legacy_blocks):
        f.write(f"=== SAMPLE {i+1} ===\n")
        f.write(f"Source: {item['source']} (Q{item['q_num']})\n")
        f.write(f"Matched Char: {repr(item['char'])} (code: {ord(item['char'])})\n")
        f.write(f"Content:\n{item['block']}\n")
        f.write("="*60 + "\n\n")

print(f"Exported {len(legacy_blocks)} legacy blocks to {out_path}")
