import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

with open("reports/content-quality/math8-hsg-raw-extract.json", "r", encoding="utf-8") as f:
    d = json.load(f)

files = {
    "chuyen-de-bat-dang-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf": 242,
    "chuyen-de-cac-bai-toan-ve-tu-giac-boi-duong-hoc-sinh-gioi-toan-8.pdf": 82,
    "chuyen-de-tam-giac-dong-dang-ta-let-va-lien-quan-boi-duong-hoc-sinh-gioi-toan-8.pdf": 64,
    "chuyen-de-tinh-gia-tri-bieu-thuc-boi-duong-hoc-sinh-gioi-toan-8.pdf": 138
}

for source in d["sources"]:
    fname = source["fileName"]
    if fname in files:
        idx = files[fname]
        block = source["parsedBlocks"][idx-1]
        print(f"\n=======================================================")
        print(f"FILE: {fname} (Block {idx})")
        print(f"Header: {block['header']}")
        print(f"Prompt: {block['prompt']}")
        print(f"Solution: {block['solution'][:200]}...")
        print(f"Dang: {block['dang']}")
        print(f"Method: {block['method'][:100]}...")
