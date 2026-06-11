import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

with open("reports/content-quality/math8-hsg-raw-extract.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Checking 5 random raw blocks where solution is empty:")
count = 0
for source in data["sources"]:
    fname = source["fileName"]
    for idx, block in enumerate(source["parsedBlocks"]):
        if not block["solution"].strip():
            count += 1
            if count <= 5:
                print(f"\n=====================================")
                print(f"File: {fname} (Block {idx+1})")
                print(f"Header: {block['header']}")
                print(f"Prompt: {block['prompt']}")
                print(f"Solution in JSON: '{block['solution']}'")
                
                # Check surrounding text in raw text to see if there is any solution nearby
                # Let's print some lines after the block header in the raw text
                text = source["text"]
                header_pos = text.find(block["header"])
                if header_pos != -1:
                    print(f"Raw context around header:")
                    print(text[header_pos:header_pos+500])
                    
print(f"\nTotal empty solutions in raw extract: {count}")
