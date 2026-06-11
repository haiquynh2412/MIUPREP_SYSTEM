import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

with open("reports/content-quality/math8-display-ready-preview.json", "r", encoding="utf-8") as f:
    data = json.load(f)

items = data["items"]
total_hsg = 0
has_solution = 0
placeholder_solution = 0

for item in items:
    level = item.get("metadata", {}).get("level", "")
    if level == "hsg":
        total_hsg += 1
        steps = item.get("explanation", {}).get("steps", "")
        if "Chưa có lời giải" in steps or "Nguồn chưa có lời giải" in steps or not steps.strip():
            placeholder_solution += 1
        else:
            has_solution += 1

print(f"Total HSG questions: {total_hsg}")
print(f"HSG questions with detailed solutions: {has_solution} ({has_solution / total_hsg * 100:.2f}%)")
print(f"HSG questions with placeholder solutions: {placeholder_solution} ({placeholder_solution / total_hsg * 100:.2f}%)")
