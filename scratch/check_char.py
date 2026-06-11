import json
import os
import re

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")
guard_report_path = os.path.join(workspace_root, "reports", "content-quality", "math10-content-guard.json")

LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

for src in raw_data["sources"]:
    rel_path = src["relativePath"] or src["fileName"]
    rel_path_lower = rel_path.lower()
    
    if "thong ke" in rel_path_lower or "thong_ke" in rel_path_lower:
        print(f"Source file: {rel_path}")
        matches = LEGACY_FONT_RE.findall(src["text"])
        print(f"Legacy characters found in source text: {set(matches)}")
        for m in set(matches):
            for line in src["text"].split("\n"):
                if m in line:
                    print(f"  Line: {line.strip()} | Char: {m} (Code: {ord(m)})")
                    
    if "bo-de-on-tap" in rel_path_lower or "chuyen-de-bpt" in rel_path_lower:
        print(f"\nSource file: {rel_path}")
        matches = LEGACY_FONT_RE.findall(src["text"])
        print(f"Legacy characters found: {set(matches)}")
        # Print first 3 contexts for each legacy char found
        for m in set(matches):
            print(f"  Char: {m} (Code: {ord(m)})")
            count = 0
            for line in src["text"].split("\n"):
                if m in line:
                    print(f"    Line: {line.strip()}")
                    count += 1
                    if count >= 3:
                        break
