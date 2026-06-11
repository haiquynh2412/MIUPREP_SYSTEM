import json
import os
import re

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')
MOJIBAKE_RE = re.compile(r'(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])')
CONTROL_OR_REPLACEMENT_RE = re.compile(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]')

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

target_qid = "math10.math10.algebra.logic_sets.menh_de_va_tap_hop_bai_tap_toan_ung_dung_thuc_te_chuyen_de_tap_hop_va_cac_phep_toan_tap_hop_pdf.q512"

# Node.js matches: 'menh de va tap hop/bai-tap-toan-ung-dung-thuc-te-chuyen-de-tap-hop-va-cac-phep-toan-tap-hop.pdf'
# Let's extract the actual prompt from the matched source file in raw_data
for src in raw_data["sources"]:
    rel_path = src["relativePath"] or src["fileName"]
    if "bai-tap-toan-ung-dung-thuc-te-chuyen-de-tap-hop-va-cac-phep-toan-tap-hop.pdf" in rel_path:
        # We need to find the block. Let's just print the legacy matches in the entire source text!
        legacy_matches = LEGACY_FONT_RE.findall(src["text"])
        mojibake_matches = MOJIBAKE_RE.findall(src["text"])
        control_matches = CONTROL_OR_REPLACEMENT_RE.findall(src["text"])
        print(f"File: {rel_path}")
        print(f"Legacy matches count: {len(legacy_matches)} -> {set(legacy_matches)}")
        print(f"Mojibake matches count: {len(mojibake_matches)}")
        print(f"Control matches count: {len(control_matches)}")
        
        # Let's see if we can find the exact block text around the legacy chars
        for m in set(legacy_matches):
            for line in src["text"].split("\n"):
                if m in line:
                    print(f"  Legacy Char line: {line.strip()} | Char: {m} (ord: {ord(m)})")
