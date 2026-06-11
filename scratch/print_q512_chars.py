import json
import os
import re

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

for src in raw_data["sources"]:
    rel_path = src["relativePath"] or src["fileName"]
    if "bai-tap-toan-ung-dung-thuc-te-chuyen-de-tap-hop-va-cac-phep-toan-tap-hop.pdf" in rel_path:
        # Let's find matches
        text = src["text"]
        matches = LEGACY_FONT_RE.findall(text)
        print(f"File: {rel_path}")
        print(f"Legacy characters found in text: {len(matches)}")
        for m in set(matches):
            print(f"  Legacy char: {repr(m)} (code: {ord(m)})")
            
        # Let's print the specific question block if we can find it
        # The question starts with "Câu 230: Qua khảo sát 600"
        idx = text.find("Câu 230: Qua khảo sát 600")
        if idx != -1:
            block = text[idx:idx+1500]
            print("\nBlock excerpt:")
            print(block[:800])
            print("\nLegacy chars in block:")
            block_matches = LEGACY_FONT_RE.findall(block)
            for m in set(block_matches):
                print(f"  Char: {repr(m)} (code: {ord(m)})")
