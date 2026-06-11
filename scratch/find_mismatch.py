import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

with open("reports/content-quality/math8-hsg-raw-extract.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for source in data["sources"]:
    if "bat-dang-thuc" in source["fileName"].lower():
        print(f"Total blocks in {source['fileName']}: {len(source['parsedBlocks'])}")
        # Print blocks 130 to 145
        for i in range(130, 145):
            if i < len(source["parsedBlocks"]):
                block = source["parsedBlocks"][i]
                print(f"\nBlock {i+1}:")
                print(f"  Header: {block['header']}")
                print(f"  Prompt: {block['prompt']}")
                print(f"  Solution empty? {not block['solution'].strip()}")
                print(f"  Solution (first 60 chars): {block['solution'][:60]}")
        break
