import json
import sys
import random

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

with open("reports/content-quality/math8-display-ready-preview.json", "r", encoding="utf-8") as f:
    data = json.load(f)

items = data["items"]
print(f"Total converted items: {len(items)}")

# 1. Structural audit checks
missing_thinking = 0
missing_steps = 0
missing_answer = 0
missing_hard_lens = 0
empty_prompt = 0
hsg_items = []

for item in items:
    prompt = item.get("prompt", "")
    if not prompt.strip():
        empty_prompt += 1
        
    level = item.get("metadata", {}).get("level", "")
    if level == "hsg":
        hsg_items.append(item)
        
    explanation = item.get("explanation", {})
    if isinstance(explanation, dict):
        if not explanation.get("thinking", "").strip():
            missing_thinking += 1
        if not explanation.get("steps", "").strip():
            missing_steps += 1
        if not explanation.get("answer"):
            missing_answer += 1
        if level == "hsg" and not explanation.get("hardProblemLens", "").strip():
            missing_hard_lens += 1

print("\n--- Structural Audit Results ---")
print(f"Empty Prompts: {empty_prompt}")
print(f"HSG Questions Count: {len(hsg_items)}")
print(f"Missing thinking: {missing_thinking}")
print(f"Missing steps: {missing_steps}")
print(f"Missing answer: {missing_answer} (Note: some proof questions might not have a short answer)")
print(f"Missing hardProblemLens in HSG items: {missing_hard_lens}")

# 2. Sample random HSG questions for manual inspection
print("\n--- Sampling 3 Random HSG Questions ---")
random.seed(42)  # For deterministic sampling
sampled = random.sample(hsg_items, 3)

for idx, item in enumerate(sampled):
    print(f"\n=======================================================")
    print(f"SAMPLE {idx+1}: {item['id']}")
    print(f"Topic ID: {item['metadata']['topicId']}")
    print(f"Pattern ID: {item['metadata']['patternId']}")
    print(f"Concept IDs: {item['conceptIds']}")
    print(f"Skill IDs: {item['skillIds']}")
    print(f"Prompt: {item['prompt']}")
    
    explanation = item['explanation']
    print("\n[Thinking (Tư duy & Quan sát)]")
    print(explanation.get("thinking"))
    print("\n[Steps (Các bước giải)]")
    print(explanation.get("steps")[:600] + "..." if len(explanation.get("steps", "")) > 600 else explanation.get("steps"))
    print("\n[Answer (Đáp số)]")
    print(explanation.get("answer"))
    print("\n[Hard Problem Lens (Lăng kính chuyên đề)]")
    print(explanation.get("hardProblemLens"))
