import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
guard_report_path = os.path.join(workspace_root, "reports", "content-quality", "math10-content-guard.json")

if not os.path.exists(guard_report_path):
    print(f"Error: Guard report not found at {guard_report_path}")
    sys.exit(1)

with open(guard_report_path, "r", encoding="utf-8") as f:
    report = json.load(f)

issues = report.get("issues", [])
print(f"Total issues found: {len(issues)}")

# Group issues by code
issues_by_code = {}
for issue in issues:
    code = issue.get("code")
    if code not in issues_by_code:
        issues_by_code[code] = []
    issues_by_code[code].append(issue)

# Load preview items to find the prompt text
preview_path = os.path.join(workspace_root, "reports", "content-quality", "math10-display-ready-preview.json")
# Wait, display-ready preview only contains ready items, let's search in the raw JSON extract instead for raw prompt text
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Create a map from relativePath to raw text
source_map = {}
for src in raw_data.get("sources", []):
    source_map[src["relativePath"]] = src["text"]

print("\n--- SAMPLE ISSUES INSPECTION ---")
for code, insts in issues_by_code.items():
    print(f"\n======================================")
    print(f"CODE: {code} (Total: {len(insts)})")
    print(f"======================================")
    
    # Print up to 3 samples
    for i, inst in enumerate(insts[:3]):
        q_id = inst.get("questionId")
        src_file = inst.get("sourceFile")
        msg = inst.get("message")
        
        print(f"\nSample {i+1}: Question ID: {q_id}")
        print(f"Source file: {src_file}")
        print(f"Issue message: {msg}")
        
        # Let's try to find this block in the raw file text
        raw_text = source_map.get(src_file, "")
        # The question ID usually ends with .q<number>
        if "." in q_id:
            try:
                parts = q_id.split(".")
                q_num_str = parts[-1] # e.g. "q78"
                q_index = int(q_num_str[1:]) - 1 # 0-indexed
                
                # Split the raw text using a python-compatible exercise pattern
                import re
                headers = list(re.finditer(r"(?:^|[\r\n\f]|\s)(?:B\w*i|C\w*u|V\w*\s*d|B\w*\s*to\w*n)\s*\d+[:.)-]?", raw_text, re.IGNORECASE))
                
                if q_index < len(headers):
                    start = headers[q_index].start()
                    end = headers[q_index+1].start() if q_index + 1 < len(headers) else len(raw_text)
                    block = raw_text[start:end].strip()
                    print("Prompt Text Preview:")
                    print("-" * 50)
                    print(block[:600] + ("..." if len(block) > 600 else ""))
                    print("-" * 50)
                else:
                    print(f"Could not extract block index {q_index} (total headers found: {len(headers)})")
            except Exception as e:
                print(f"Error extracting preview: {e}")
