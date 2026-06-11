import fitz
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open(r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-bat-dang-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf")
print(f"Total pages: {len(doc)}")

search_str = "Tìm GTNN của"
found = False

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text("text")
    if search_str in text:
        found = True
        print(f"\n--- Found on Page {page_idx+1} ---")
        lines = text.split("\n")
        # Print lines around the match
        for idx, line in enumerate(lines):
            if search_str in line:
                start = max(0, idx - 3)
                end = min(len(lines), idx + 15)
                print("\n".join(lines[start:end]))
                print("-" * 40)
