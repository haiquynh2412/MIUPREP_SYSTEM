# -*- coding: utf-8 -*-
"""
Audit suspicious symbol artifacts after LaTeX cleanup without mutating data.

The previous version inserted "!=" with broad regexes such as "with ... 0",
which can corrupt normal decimals like "0.75". This replacement only reports
high-risk patterns so a separate, source-backed repair can decide what to fix.
"""
import argparse
import json
import re
from pathlib import Path

DEFAULT_BANK = Path("data/antigravity-bank.json")

SUSPICIOUS_PATTERNS = {
    "not_equal_before_decimal": re.compile(r"\u2260\s+\d+\.\d+"),
    "cost_without_dollar": re.compile(r"\bcosts?\s+\d+(?:\.\d{2})?\b", re.I),
    "money_decimal_without_dollar": re.compile(r"\b\d+\.\d{2}\b"),
    "remaining_latex_command": re.compile(r"\\(?:frac|sqrt|neq|leq|geq|pi|theta)\b"),
}


def iter_question_text(question):
    for field in ("prompt", "correctAnswer", "cognitiveMove"):
        value = question.get(field)
        if isinstance(value, str):
            yield field, value

    choices = question.get("choices")
    if isinstance(choices, dict):
        for key, value in choices.items():
            if isinstance(value, str):
                yield f"choices.{key}", value

    explanation = question.get("explanation")
    if isinstance(explanation, dict):
        correct = explanation.get("correct")
        if isinstance(correct, str):
            yield "explanation.correct", correct
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            for key, value in distractors.items():
                if isinstance(value, str):
                    yield f"explanation.distractors.{key}", value


def audit_symbols(bank, sample_limit=8):
    report = {name: {"count": 0, "samples": []} for name in SUSPICIOUS_PATTERNS}

    for question in bank:
        for field, text in iter_question_text(question):
            for name, pattern in SUSPICIOUS_PATTERNS.items():
                match = pattern.search(text)
                if not match:
                    continue
                entry = report[name]
                entry["count"] += 1
                if len(entry["samples"]) < sample_limit:
                    start = max(0, match.start() - 80)
                    end = min(len(text), match.end() + 120)
                    entry["samples"].append(
                        {
                            "id": question.get("id"),
                            "field": field,
                            "text": text[start:end],
                        }
                    )

    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description="Audit suspicious symbol artifacts without changing the bank.")
    parser.add_argument("--bank", default=str(DEFAULT_BANK), help="Path to the question bank JSON.")
    parser.add_argument("--report", help="Optional JSON report path. The bank itself is never modified.")
    args = parser.parse_args(argv)

    bank_path = Path(args.bank)
    with bank_path.open("r", encoding="utf-8") as handle:
        bank = json.load(handle)

    report = audit_symbols(bank)
    print(f"Bank: {bank_path}")
    for name, entry in report.items():
        print(f"\n{name}: {entry['count']}")
        for sample in entry["samples"]:
            text = sample["text"].replace("\n", " | ")
            print(f"- {sample['id']} [{sample['field']}]: {text}")

    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with report_path.open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2, ensure_ascii=False)
        print(f"\nReport written: {report_path}")

    print("\nNo data was changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
