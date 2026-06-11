import json
import os

transcript_path = r"C:\Users\HAIQUYNH\.gemini\antigravity\brain\8e91fb49-ef5c-409c-ae0b-01d4e2f308b3\.system_generated\logs\transcript.jsonl"
output_path = r"C:\Users\HAIQUYNH\OneDrive\CODE AI\MIUPREP_SYSTEM\apps\miuphysics-app\scratch\transcript_search_result.txt"

keywords = ["task-1029", "điện học", "mạch cầu", "r1, r2", "bóng đèn", "bếp điện", "hsg vật lý 9"]

results = []

if os.path.exists(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            for kw in keywords:
                if kw.lower() in line.lower():
                    # Trích xuất một phần nội dung xung quanh từ khóa để đọc
                    # Vì dòng trong jsonl có thể rất dài, ta cố gắng tìm vị trí từ khóa và lấy +-1000 ký tự
                    idx = line.lower().find(kw.lower())
                    start = max(0, idx - 500)
                    end = min(len(line), idx + 2000)
                    snippet = line[start:end]
                    results.append(f"Line {line_num} | Keyword: '{kw}'\nSnippet:\n... {snippet} ...\n{'-'*50}\n")
                    break # Chỉ cần khớp một từ khóa trên mỗi dòng là đủ

    with open(output_path, "w", encoding="utf-8") as out:
        out.write(f"Found {len(results)} matching lines in transcript.\n\n")
        out.write("".join(results))
    print(f"Done! Found {len(results)} matches. Results written to {output_path}")
else:
    print(f"Error: Transcript path not found at {transcript_path}")
