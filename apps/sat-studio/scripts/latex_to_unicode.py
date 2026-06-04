# -*- coding: utf-8 -*-
"""
Audit LaTeX/math delimiters in antigravity-bank.json without mutating data.

This file intentionally does not convert or rewrite question text. Earlier
bulk conversion proved unsafe because "$" is both a math delimiter and a
currency symbol in SAT word problems. Display cleanup belongs in the renderer
layer, where raw source text can stay intact.
"""
import argparse
import json
import re
from pathlib import Path

DEFAULT_BANK = Path("data/antigravity-bank.json")

LATEX_PATTERN = re.compile(r"(\\\(|\\\)|\\\[|\\\]|\\frac|\\sqrt|\\neq|\\leq|\\geq|\$\$|\$)")
CURRENCY_PATTERN = re.compile(r"\$\s*\d")


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


def audit_bank(bank, sample_limit=12):
    stats = {
        "total_questions": len(bank),
        "questions_with_latex_or_dollar": 0,
        "fields_with_latex_or_dollar": 0,
        "fields_with_currency_dollar": 0,
        "samples": [],
    }

    for question in bank:
        question_hit = False
        for field, text in iter_question_text(question):
            if LATEX_PATTERN.search(text):
                question_hit = True
                stats["fields_with_latex_or_dollar"] += 1
                if len(stats["samples"]) < sample_limit:
                    stats["samples"].append(
                        {
                            "id": question.get("id"),
                            "field": field,
                            "text": text[:240],
                        }
                    )
            if CURRENCY_PATTERN.search(text):
                stats["fields_with_currency_dollar"] += 1
        if question_hit:
            stats["questions_with_latex_or_dollar"] += 1

    return stats


def main(argv=None):
    parser = argparse.ArgumentParser(description="Audit LaTeX/math delimiter usage without changing the bank.")
    parser.add_argument("--bank", default=str(DEFAULT_BANK), help="Path to the question bank JSON.")
    parser.add_argument("--report", help="Optional JSON report path. The bank itself is never modified.")
    args = parser.parse_args(argv)

    bank_path = Path(args.bank)
    with bank_path.open("r", encoding="utf-8") as handle:
        bank = json.load(handle)

    stats = audit_bank(bank)
    print(f"Bank: {bank_path}")
    print(f"Total questions: {stats['total_questions']}")
    print(f"Questions with LaTeX/dollar markers: {stats['questions_with_latex_or_dollar']}")
    print(f"Fields with LaTeX/dollar markers: {stats['fields_with_latex_or_dollar']}")
    print(f"Fields with currency dollars: {stats['fields_with_currency_dollar']}")

    if stats["samples"]:
        print("\nSamples:")
        for sample in stats["samples"]:
            text = sample["text"].replace("\n", " | ")
            print(f"- {sample['id']} [{sample['field']}]: {text}")

    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with report_path.open("w", encoding="utf-8") as handle:
            json.dump(stats, handle, indent=2, ensure_ascii=False)
        print(f"\nReport written: {report_path}")

    print("\nNo data was changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
