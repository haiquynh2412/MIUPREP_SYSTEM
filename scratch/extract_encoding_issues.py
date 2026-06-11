import json
import os
import re

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
guard_report_path = os.path.join(workspace_root, "reports", "content-quality", "math10-content-guard.json")
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

# Regex to detect issues
CONTROL_OR_REPLACEMENT_RE = re.compile(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]')
MOJIBAKE_RE = re.compile(r'(?:[\u00c3\u00c4\u00c5\u00c6][\u0080-\u00bf]|\u00e1[\u00ba\u00bb])')
LEGACY_FONT_RE = re.compile(r'[\u00a9\u00aa\u00ad\u00ae\u00b5\u00b8\u00c5\u00cf\u00d7\u00d8\u00de\u00e7\u00f1\u00f8\u00fc]')

with open(guard_report_path, "r", encoding="utf-8") as f:
    guard_report = json.load(f)

# Collect questionIds that have encoding or control issues
targeted_qids = set()
issues_by_qid = {}

for issue in guard_report.get("issues", []):
    code = issue.get("code")
    qid = issue.get("questionId")
    if code in ["display.legacy_font_encoding", "display.control_characters"] and qid:
        targeted_qids.add(qid)
        if qid not in issues_by_qid:
            issues_by_qid[qid] = []
        issues_by_qid[qid].append(issue)

print(f"Found {len(targeted_qids)} unique questions with encoding/control issues.")

# Load raw extract
with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Parser definitions
EXERCISE_HEADER_PATTERN = re.compile(
    r'(?:^|[\r\n\f]|[^\w])\s*((?:(?:B\w*i|C\w*u)(?:\s+t\w*p)?\s*(?:\d+|[IVXLC]+(?=\s*(?:[:.)-]|\[|\d|$)))|V\w*\s*d\s*\d+|B\w*\s*to\w*n\s*\d+)[A-Za-z\u00c0-\u1ef90-9\s]*[:.)-]?)',
    re.IGNORECASE | re.UNICODE
)

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

# Build clean file names
def get_clean_name(file_path):
    # const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return re.sub(r'[^a-zA-Z0-9]', '_', file_path).lower()

# Importer function mapping source text to blocks
blocks_by_id = {}
for src in raw_data["sources"]:
    rel_path = src["relativePath"] or src["fileName"]
    clean_name = get_clean_name(rel_path)
    # Match topic (we can cheat and look at topicId from issues)
    # Let's map topicId by looking at our targeted_qids
    # Find matching targeted_qids for this file name
    matching_qids = [qid for qid in targeted_qids if clean_name in qid]
    if not matching_qids:
        continue
        
    # Extract blocks
    raw_blocks = extract_exercise_blocks(src["text"])
    for idx, block in enumerate(raw_blocks):
        # We need to construct the possible block IDs for this block
        # Since we don't know the exact topic, we check which of the targeted_qids matches clean_name and q{idx+1}
        suffix = f".{clean_name}.q{idx+1}"
        matched_qid = None
        for qid in matching_qids:
            if qid.endswith(suffix):
                matched_qid = qid
                break
        
        if matched_qid:
            blocks_by_id[matched_qid] = {
                "prompt": block,
                "file": rel_path
            }

# Control and page break characters regex
CONTROL_RE = re.compile(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]')

def clean_text_fn(text, rel_path):
    cleaned = CONTROL_RE.sub(' ', text)
    cleaned = cleaned.replace('\u0001', ' ').replace('\u0002', ' ')
    rel_path_lower = rel_path.lower()
    
    if "le-quang-xe" in rel_path_lower or "le_quang_xe" in rel_path_lower or "menh de va tap hop" in rel_path_lower:
        replacements = {
            '¶': '{',
            '©': '}',
            '®': 'R',
            'ß': '{',
            '™': '}',
            'Ä': '(',
            'ä': ')',
            'Ç': '(',
            'å': ')',
            'ñ': '[',
            'ï': '[',
            'ã': ')',
            'Å': '(',
            'ò': ']',
            'ö': '(',
            'ü': ')'
        }
        for k, v in replacements.items():
            cleaned = cleaned.replace(k, v)
            
        cleaned = re.sub(r'([;\s\-−\d\w√+∞]+)ô(?=\s|[\.\,\)\}\]\|\n]|$)', r'\1]', cleaned)
        cleaned = re.sub(r';\s*ô', '; ]', cleaned)
        cleaned = re.sub(r'([0-9a-zA-Z\+−∞√]+)ô', r'\1]', cleaned)
        
    if "menh de" in rel_path_lower or "menh_de" in rel_path_lower:
        tcvn_replacements = {
            'cã': 'có',
            'nghiÖm': 'nghiệm',
            'ph©n': 'phân',
            'biÖt': 'biệt',
            'híng': 'hướng',
            'híc': 'hướng'
        }
        for k, v in tcvn_replacements.items():
            cleaned = cleaned.replace(k, v)
            
    return cleaned

# Generate markdown report
output_review_path = os.path.join(workspace_root, "scratch", "review-193-issues.md")
with open(output_review_path, "w", encoding="utf-8") as f:
    f.write("# Review of 193 Encoding Issues in Math 10\n\n")
    f.write(f"Total targeted questions: {len(targeted_qids)}\n\n")
    
    # Group by source file
    grouped_by_file = {}
    for qid in sorted(list(targeted_qids)):
        if qid not in blocks_by_id:
            # Maybe the ID construction differs slightly or block was skipped
            continue
        block_info = blocks_by_id[qid]
        fname = block_info["file"]
        if fname not in grouped_by_file:
            grouped_by_file[fname] = []
        grouped_by_file[fname].append((qid, block_info["prompt"]))
        
    f.write(f"Matched {len(blocks_by_id)} out of {len(targeted_qids)} questions in raw extract.\n\n")
    
    for fname, items in sorted(grouped_by_file.items()):
        f.write(f"## Source: `{fname}` ({len(items)} issues)\n\n")
        for idx, (qid, raw_prompt) in enumerate(items):
            cleaned_prompt = clean_text_fn(raw_prompt, fname)
            f.write(f"### {idx+1}. ID: `{qid}`\n")
            f.write(f"- **Issues**: {', '.join([x.get('message') for x in issues_by_qid[qid]])}\n\n")
            f.write("#### Before:\n")
            f.write("```text\n" + raw_prompt + "\n```\n\n")
            f.write("#### After Clean (Proposed):\n")
            f.write("```text\n" + cleaned_prompt + "\n```\n\n")
            f.write("---\n\n")
            
print(f"Wrote detailed comparison to {output_review_path}")
