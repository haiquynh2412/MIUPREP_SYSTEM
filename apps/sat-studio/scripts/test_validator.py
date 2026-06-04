"""Quick validator unit tests for AntigravityEngine."""

import json
import sys
from pathlib import Path

# Allow import from project root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.antigravity_engine import AntigravityEngine

passed = 0
failed = 0

def check(label, condition):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS: {label}")
    else:
        failed += 1
        print(f"  FAIL: {label}")

mc = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "B",
    "explanation": {
        "correct": "Yes",
        "distractors": {"A": "no", "C": "no", "D": "no"}
    }
})

# T1: Valid MC
r = AntigravityEngine._validate(mc, "Probability")
check("Valid MC accepted", r is not None and r["correctAnswer"] == "B")

# T2: Valid Grid-in
gi = json.dumps({
    "prompt": "Solve.",
    "questionType": "student_produced_response",
    "choices": {},
    "correctAnswer": "42",
    "explanation": {"correct": "x=42", "distractors": {"43": "off"}}
})
r2 = AntigravityEngine._validate(gi, "Grid-in")
check("Valid Grid-in accepted", r2 is not None and r2["questionType"] == "student_produced_response")

# T3: String explanation -> reject
bad = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "A",
    "explanation": "just a string"
})
check("String explanation rejected", AntigravityEngine._validate(bad, "Inferences") is None)

# T4: correctAnswer = E -> reject
bad2 = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "E",
    "explanation": {"correct": "ok", "distractors": {"A": "no"}}
})
check("Invalid correctAnswer E rejected", AntigravityEngine._validate(bad2, "Probability") is None)

# T5: Grid-in with 4 MC choices -> reject
bad3 = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "5",
    "explanation": {"correct": "ok", "distractors": {"6": "wrong"}}
})
check("Grid-in with MC choices rejected", AntigravityEngine._validate(bad3, "Grid-in") is None)

# T6: Markdown-wrapped JSON
wrapped = "```json\n" + mc + "\n```"
check("Markdown-wrapped JSON handled", AntigravityEngine._validate(wrapped, "Probability") is not None)

# T7: Missing prompt
bad4 = json.dumps({
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "A",
    "explanation": {"correct": "ok", "distractors": {"B": "no"}}
})
check("Missing prompt rejected", AntigravityEngine._validate(bad4, "Probability") is None)

# T8: Metadata stamping
r8 = AntigravityEngine._validate(mc, "Cross-Text Connections")
check("Section stamped", r8 and r8["section"] == "Reading and Writing")
check("Domain stamped", r8 and r8["domain"] == "Craft and Structure")
check("sourceType stamped", r8 and r8["sourceType"] == "antigravity")
check("reviewStatus = needs_review", r8 and r8["reviewStatus"] == "needs_review")
check("ID prefix antigravity-", r8 and r8["id"].startswith("antigravity-"))

# T9: MC with only 3 choices -> reject
bad5 = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c"},
    "correctAnswer": "A",
    "explanation": {"correct": "ok", "distractors": {"B": "no"}}
})
check("3-choice MC rejected", AntigravityEngine._validate(bad5, "Inferences") is None)

# T10: Missing explanation.distractors
bad6 = json.dumps({
    "prompt": "Q?",
    "choices": {"A": "a", "B": "b", "C": "c", "D": "d"},
    "correctAnswer": "A",
    "explanation": {"correct": "ok"}
})
check("Missing distractors rejected", AntigravityEngine._validate(bad6, "Probability") is None)

print(f"\n{'='*40}")
print(f"Results: {passed} passed, {failed} failed out of {passed + failed}")
if failed:
    sys.exit(1)
else:
    print("ALL TESTS PASSED")
