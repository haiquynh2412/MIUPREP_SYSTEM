import csv
import os

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
csv_path = os.path.join(workspace_root, "reports", "content-quality", "math10-content-issues.csv")

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    blockers = [row for row in reader if row.get("severity") == "blocker"]

print(f"Total remaining blockers: {len(blockers)}")
for idx, row in enumerate(blockers):
    print(f"{idx+1}. ID: {row.get('questionId')} | Source: {row.get('sourceFile')} | Code: {row.get('code')}")
