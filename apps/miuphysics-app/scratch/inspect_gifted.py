import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "public", "data"))

try:
    from gen_gifted_mechanics import gifted_questions
    output_file = os.path.join(os.path.dirname(__file__), "gifted_list.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"Total questions in gen_gifted_mechanics: {len(gifted_questions)}\n")
        for i, q in enumerate(gifted_questions):
            f.write(f"[{i+1:02d}] ID: {q['id']} | Topic: {q.get('topic_vn', q.get('topic'))} | Diff: {q.get('difficulty')}\n")
    print(f"Successfully wrote {len(gifted_questions)} questions to {output_file}")
except Exception as e:
    import traceback
    traceback.print_exc()
