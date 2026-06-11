import json
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")
guard_report_path = os.path.join(workspace_root, "reports", "content-quality", "math10-content-guard.json")

CONTROL_OR_REPLACEMENT_RE = re.compile(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]')
MOJIBAKE_RE = re.compile(r'(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])')
LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

with open(guard_report_path, "r", encoding="utf-8") as f:
    guard_report = json.load(f)

# Map from questionId to issue details
issues_map = {}
for issue in guard_report.get("issues", []):
    q_id = issue.get("questionId")
    if q_id:
        if q_id not in issues_map:
            issues_map[q_id] = []
        issues_map[q_id].append(issue)

# Process questions from content package standard parser
# Let's import the builder logic to find the parsed questions
# Or we can just find them in the raw text by matching the headers!
# Let's write a simple parser in python that extracts the prompts exactly like the TypeScript importer does.

EXERCISE_HEADER_PATTERN = re.compile(r'(?:^|[\r\n\f]|\s)((?:(?:B\w*i|C\w*u)(?:\s+t\w*p)?\s*(?:\d+|[IVXLC]+(?=\s*(?:[:.)-]|\[|\d|$)))|V\w*\s*d\s*\d+|B\w*\s*to\w*n\s*\d+)[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)', re.IGNORECASE)

def extract_exercise_blocks(text):
    normalized = text.replace('\r\n', '\n').replace('\r', '\n')
    matches = list(EXERCISE_HEADER_PATTERN.finditer(normalized))
    if not matches:
        return [normalized] if len(normalized.strip()) >= 15 else []
    
    blocks = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(normalized)
        block = normalized[start:end].strip()
        if len(block) >= 15:
            blocks.append(block)
    return blocks

print(f"Total sources: {len(raw_data['sources'])}")
print(f"Total questions with issues in guard report: {len(issues_map)}")

detailed_issues = []

for src in raw_data["sources"]:
    rel_path = src["relativePath"]
    text = src["text"]
    blocks = extract_exercise_blocks(text)
    
    for idx, block in enumerate(blocks):
        # Build block ID exactly like buildBlockId in TypeScript
        clean_name = rel_path.replace('/', '_').replace('\\', '_').replace('.', '_').replace('-', '_').replace(' ', '_').replace('[', '_').replace(']', '_').lower()
        # Wait, the cleanName in TypeScript is:
        # const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        # and topicId is prepended.
        # Let's check how math10-import.ts builds the block ID:
        # buildBlockId(resolvedTopicMatch.topic.id, source.relativePath || source.fileName, index + 1)
        # buildBlockId(topicId, fileName, index):
        # const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        # return `${topicId}.${cleanName}.q${index}`;
        
        # Let's search if this block contains any blockers
        has_control = CONTROL_OR_REPLACEMENT_RE.search(block)
        has_mojibake = MOJIBAKE_RE.search(block)
        has_legacy = LEGACY_FONT_RE.search(block)
        has_ole = '\u0001' in block
        
        if has_control or has_mojibake or has_legacy or has_ole:
            detailed_issues.append({
                "source": rel_path,
                "q_num": idx + 1,
                "block": block,
                "control": has_control.group(0) if has_control else None,
                "mojibake": has_mojibake.group(0) if has_mojibake else None,
                "legacy": has_legacy.group(0) if has_legacy else None,
                "ole": has_ole
            })

print(f"Found {len(detailed_issues)} blocks with blockers in python check.")

# Save the detailed issues to a file for review
out_inspect_path = os.path.join(workspace_root, "scratch", "inspect-blockers-full.json")
with open(out_inspect_path, "w", encoding="utf-8") as f:
    json.dump(detailed_issues[:100], f, ensure_ascii=False, indent=2)

print(f"Wrote up to 100 blocker samples to {out_inspect_path}")

# Let's analyze a few specific examples where legacy font or control chars exist:
legacy_samples = [x for x in detailed_issues if x["legacy"]]
print(f"\nLegacy Font Samples count: {len(legacy_samples)}")
for i, sample in enumerate(legacy_samples[:5]):
    print(f"\nLegacy Sample {i+1}: {sample['source']} (Q{sample['q_num']})")
    print(f"Matched char: {sample['legacy']}")
    # Print lines containing the matched character
    for line in sample['block'].split('\n'):
        if sample['legacy'] in line:
            print(f"  Line: {line.strip()}")

control_samples = [x for x in detailed_issues if x["control"] or x["ole"]]
print(f"\nControl/OLE Samples count: {len(control_samples)}")
for i, sample in enumerate(control_samples[:5]):
    print(f"\nControl/OLE Sample {i+1}: {sample['source']} (Q{sample['q_num']})")
    print(f"Control char code: {ord(sample['control']) if sample['control'] else 'OLE'}")
    # Print lines containing control chars or OLE
    for line in sample['block'].split('\n'):
        if (sample['control'] and sample['control'] in line) or ('\u0001' in line):
            # Safe print
            safe_line = line.replace('\u0001', '[OLE]').strip()
            print(f"  Line: {safe_line}")
