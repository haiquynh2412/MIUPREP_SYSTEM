"""Antigravity Testbank Generator – SAT Studio.

Generates original SAT question candidates via Google Gemini API.
All questions land as ``needs_review`` and must pass human review
before they become visible to students.

Usage
-----
    python scripts/antigravity_engine.py --count 3
"""

import argparse
import json
import os
import time
import uuid
from pathlib import Path

from google import genai
from google.genai import types
from dotenv import load_dotenv

try:
    from scripts.math_verifier import verify_math_answer
except ModuleNotFoundError:
    from math_verifier import verify_math_answer


# ---------------------------------------------------------------------------
# Prompt library – one per thin skill
# ---------------------------------------------------------------------------

# Diverse topic pool for Rhetorical Synthesis – deterministic rotation
# ensures no back-to-back repeats even across multiple --count runs.
RHETORICAL_TOPICS = [
    "the economic impact of microfinance programs in rural communities",
    "the influence of Baroque architecture on modern civic buildings",
    "the sociological effects of remote work on urban migration patterns",
    "the development of early computing systems during World War II",
    "the role of textile arts in preserving indigenous cultural identity",
    "how inflation targeting by central banks affects household savings",
    "the psychological impact of color theory in retail store design",
    "the evolution of Japanese woodblock printing techniques in the Edo period",
    "the effects of gerrymandering on voter turnout in midterm elections",
    "how algorithmic trading has reshaped modern stock exchanges",
    "the archaeological significance of Mesopotamian clay tablets",
    "the relationship between urban green spaces and property values",
    "how jazz improvisation techniques influenced abstract expressionism",
    "the impact of high-speed rail networks on regional economic growth",
    "the sociological study of language shift in bilingual communities",
    "the engineering challenges of building earthquake-resistant bridges",
    "the history of public library systems in 19th-century America",
    "the effects of universal basic income pilot programs on employment",
    "the role of typography in shaping newspaper readability during the 1920s",
    "how climate policy incentives affect renewable energy adoption rates",
]

PROMPTS = {
    "Cross-Text Connections": """
You are an expert SAT item writer. Create ONE original Digital SAT
Reading & Writing question testing Cross-Text Connections (Hard).

Rules:
- Write Text 1 and Text 2 (50-80 words each) on a fresh academic topic.
  The texts must disagree, qualify, or build on each other.
- One correct answer and three plausible distractors.
- Do NOT copy any copyrighted source text.
- ALL text (prompt, choices, explanation) must be in English.

Return ONLY a JSON object (no markdown fences):
{
  "prompt": "Text 1: ...\\n\\nText 2: ...\\n\\nBased on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?",
  "choices": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correctAnswer": "A",
  "explanation": {
    "correct": "Detailed reasoning with textual evidence.",
    "distractors": {
      "B": "Why a student might pick B and why it is wrong.",
      "C": "Why C is wrong.",
      "D": "Why D is wrong."
    }
  }
}
""",

    # NOTE: This prompt is a TEMPLATE. The {topic} placeholder is filled
    # at generation time by _build_rhetorical_prompt() to guarantee
    # topic diversity across successive calls.
    "Rhetorical Synthesis": """
You are an expert SAT item writer. Create ONE original Digital SAT
Reading & Writing question testing Rhetorical Synthesis (Hard).

MANDATORY TOPIC: {topic}
You MUST write the notes and question about this specific topic.
Do NOT substitute a different topic, especially not biology or light.

Rules:
- Provide 4-5 bullet-point notes about the MANDATORY TOPIC above.
- State a clear rhetorical goal the student must achieve
  (e.g. emphasize a cause, compare two outcomes, highlight a limitation).
- The correct choice satisfies the goal; distractors contain true
  facts from the notes but miss the goal.
- ALL text must be in English.

Return ONLY a JSON object (no markdown fences):
{{
  "prompt": "While researching {topic}, a student has taken the following notes:\\n- Note 1\\n- Note 2\\n- Note 3\\n- Note 4\\n\\nThe student wants to [specific goal]. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
  "choices": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
  "correctAnswer": "A",
  "explanation": {{
    "correct": "Why this choice achieves the stated goal.",
    "distractors": {{
      "B": "Why B fails the goal.",
      "C": "Why C fails the goal.",
      "D": "Why D fails the goal."
    }}
  }}
}}
""",

    "Inferences": """
You are an expert SAT item writer. Create ONE original Digital SAT
Reading & Writing question testing Inferences (Hard).

Rules:
- Write a complex academic passage (60-100 words).
- The correct answer must be an INDIRECT inference, not a restatement.
- Distractors should include out-of-scope leaps, opposite claims,
  and partial matches.
- ALL text must be in English.

Return ONLY a JSON object (no markdown fences):
{
  "prompt": "Passage text...\\n\\nWhich choice is most strongly supported by the text?",
  "choices": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correctAnswer": "A",
  "explanation": {
    "correct": "Why this inference is supported.",
    "distractors": {
      "B": "Why B goes beyond the text.",
      "C": "Why C is wrong.",
      "D": "Why D is wrong."
    }
  }
}
""",

    "Grid-in": """
You are an expert SAT Math item writer. Create ONE original
student-produced response (grid-in) question (Hard).

Rules:
- Multi-step real-world word problem (no bare equations).
- The answer must be a clean number or simple fraction.
- Do NOT include multiple-choice options.
- ALL text must be in English.

Return ONLY a JSON object (no markdown fences):
{
  "prompt": "Word problem text...",
  "questionType": "student_produced_response",
  "choices": {},
  "correctAnswer": "7.5",
  "explanation": {
    "correct": "Step-by-step solution.",
    "distractors": {
      "Common error 1": "Why a student might get this wrong answer.",
      "Common error 2": "Why this mistake happens."
    }
  }
}
""",

    "Probability": """
You are an expert SAT Math item writer. Create ONE original
multiple-choice Probability question (Hard).

Rules:
- Real-world context requiring conditional or compound probability.
- Clean fractional or decimal answer.
- ALL text must be in English.

Return ONLY a JSON object (no markdown fences):
{
  "prompt": "Probability word problem...",
  "choices": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correctAnswer": "A",
  "explanation": {
    "correct": "Detailed probability calculation.",
    "distractors": {
      "B": "Why B is wrong.",
      "C": "Why C is wrong.",
      "D": "Why D is wrong."
    }
  }
}
""",
}

# Map each skill to its SAT Studio section/domain
SKILL_META = {
    "Cross-Text Connections": ("Reading and Writing", "Craft and Structure"),
    "Rhetorical Synthesis":   ("Reading and Writing", "Expression of Ideas"),
    "Inferences":             ("Reading and Writing", "Information and Ideas"),
    "Grid-in":                ("Math", "Problem-Solving and Data Analysis"),
    "Probability":            ("Math", "Problem-Solving and Data Analysis"),
}


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class AntigravityEngine:
    """Generate SAT Studio review candidates from blueprint-only prompts."""

    def __init__(self):
        load_dotenv()

        # Paths
        base_dir = Path(__file__).resolve().parents[1]
        self.bank_file = base_dir / "data" / "antigravity-bank.json"

        # Load existing bank
        self.questions = self._load_bank()

        # Configure Gemini via the new google.genai SDK
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is missing. Add it to .env")

        self.client = genai.Client(api_key=api_key)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # -- persistence --------------------------------------------------------

    def _load_bank(self):
        if not self.bank_file.exists():
            return []
        try:
            data = json.loads(self.bank_file.read_text(encoding="utf-8"))
            return data if isinstance(data, list) else []
        except (json.JSONDecodeError, OSError):
            return []

    def _save_bank(self):
        self.bank_file.parent.mkdir(parents=True, exist_ok=True)
        self.bank_file.write_text(
            json.dumps(self.questions, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    # -- validation ---------------------------------------------------------

    @staticmethod
    def _validate(raw_text, skill):
        """Parse, validate, and stamp a generated question."""
        text = raw_text.strip()
        # Strip markdown fences if present
        for prefix in ("```json", "```"):
            if text.startswith(prefix):
                text = text[len(prefix):]
        if text.endswith("```"):
            text = text[:-3]

        try:
            data = json.loads(text.strip())
        except json.JSONDecodeError:
            print("   -> FAIL: response is not valid JSON")
            return None

        # Required keys
        for key in ("prompt", "correctAnswer", "explanation"):
            if key not in data:
                print(f"   -> FAIL: missing required key '{key}'")
                return None

        # Explanation must be a structured object
        expl = data.get("explanation")
        if (
            not isinstance(expl, dict)
            or "correct" not in expl
            or "distractors" not in expl
        ):
            print("   -> FAIL: explanation must have 'correct' + 'distractors'")
            return None

        # Grid-in vs multiple choice
        is_grid_in = skill == "Grid-in"
        if is_grid_in:
            data["questionType"] = "student_produced_response"
            # Reject if LLM accidentally included MC choices
            if data.get("choices") and len(data["choices"]) > 0:
                print("   -> FAIL: Grid-in must not have MC choices")
                return None
            data["choices"] = {}
            data["acceptableAnswers"] = data.get("acceptableAnswers") or [str(data["correctAnswer"])]
        else:
            choices = data.get("choices", {})
            if not isinstance(choices, dict) or len(choices) != 4:
                print("   -> FAIL: MC question needs exactly 4 choices")
                return None
            if data["correctAnswer"] not in ("A", "B", "C", "D"):
                print("   -> FAIL: correctAnswer must be A/B/C/D")
                return None

        # Stamp SAT Studio metadata
        section, domain = SKILL_META.get(skill, ("Unknown", "Unknown"))
        data.update({
            "id": f"antigravity-{uuid.uuid4().hex[:8]}",
            "section": section,
            "domain": domain,
            "skill": skill,
            "difficulty": "Hard",
            "sourceType": "antigravity",
            "sourceName": "Antigravity Vault",
            "sourceReference": "data/antigravity-bank.json",
            "reviewStatus": "needs_review",
            "generationEngine": "antigravity",
            "licenseNote": "Antigravity-generated original. Needs review.",
        })
        math_check = verify_math_answer(data)
        if math_check["status"] == "failed":
            print(f"   -> FAIL: math verification failed: {', '.join(math_check['issues'])}")
            return None
        data["autoCheck"] = {
            "status": "passed" if math_check["status"] == "passed" else "warning",
            "validator": "antigravity_math_verifier" if section == "Math" else "structure",
            "checks": ["structure", "answer_key", "explanation", "math_verification"],
            "mathVerification": math_check,
            "checkedAt": "2026-05-17T00:00:00.000Z",
        }
        return data

    # -- generation ---------------------------------------------------------

    def _build_rhetorical_prompt(self, iteration_index):
        """Return a Rhetorical Synthesis prompt with a deterministic topic.

        The topic is selected by rotating through RHETORICAL_TOPICS,
        offset by the current bank size so successive --count runs
        never repeat the same topic sequence.
        """
        existing_count = sum(
            1 for q in self.questions if q.get("skill") == "Rhetorical Synthesis"
        )
        topic_index = (existing_count + iteration_index) % len(RHETORICAL_TOPICS)
        topic = RHETORICAL_TOPICS[topic_index]
        return PROMPTS["Rhetorical Synthesis"].format(topic=topic)

    def _call_api(self, prompt, skill, retries=3):
        for attempt in range(retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                result = self._validate(response.text, skill)
                if result:
                    return result
            except Exception as exc:
                print(f"   -> API error: {exc}")

            if attempt < retries - 1:
                wait = 4 * (attempt + 1)
                print(f"   -> Retry {attempt + 1}/{retries} in {wait}s...")
                time.sleep(wait)
        return None

    def generate(self, count_per_skill=1):
        """Generate *count_per_skill* questions for every thin skill."""
        generated = 0
        
        # Sort skills by how many questions currently exist in the bank, ascending.
        # This ensures that if the API quota is exhausted, we prioritize skills
        # that are currently lacking (e.g., Probability, Inferences).
        skill_counts = {
            skill: sum(1 for q in self.questions if q.get("skill") == skill)
            for skill in PROMPTS.keys()
        }
        prioritized_skills = sorted(PROMPTS.keys(), key=lambda s: skill_counts[s])
        
        for skill in prioritized_skills:
            prompt_template = PROMPTS[skill]
            for i in range(count_per_skill):
                tag = f"[{skill} {i+1}/{count_per_skill}]"
                print(f"{tag} Generating...")

                # Rhetorical Synthesis uses topic-rotated prompts
                if skill == "Rhetorical Synthesis":
                    prompt = self._build_rhetorical_prompt(i)
                else:
                    prompt = prompt_template

                question = self._call_api(prompt, skill)
                if question:
                    self.questions.append(question)
                    generated += 1
                    print(f"{tag} OK -> {question['id']}")
                else:
                    print(f"{tag} FAILED after retries")
                time.sleep(4)  # respect free-tier rate limit

        self._save_bank()
        print(f"\nDone. {generated} new questions saved. "
              f"Bank total: {len(self.questions)}.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Antigravity Testbank Generator – SAT Studio"
    )
    parser.add_argument(
        "--count", type=int, default=1,
        help="Number of questions to generate per skill type",
    )
    args = parser.parse_args()

    engine = AntigravityEngine()
    engine.generate(args.count)
