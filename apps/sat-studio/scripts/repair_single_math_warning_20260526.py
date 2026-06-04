"""Repair one reviewed Math item whose verifier saw an intermediate final value."""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data" / "antigravity-bank.json"
REPORT_PATH = ROOT / "artifacts" / "single-math-warning-repair-20260526.json"
TARGET_ID = "antigravity-1600-systems-quadratic-param"


def clean_math_text(value: str) -> str:
    return (
        value.replace("$", "")
        .replace("\\implies", "so")
        .replace("\\", "")
    )


def repair_item(item: dict[str, Any]) -> dict[str, Any]:
    before = {
        "prompt": item.get("prompt"),
        "correct": (item.get("explanation") or {}).get("correct") if isinstance(item.get("explanation"), dict) else None,
    }
    item["prompt"] = (
        "A system of two equations is shown below, where k is a constant.\n\n"
        "y = x^2 - 4x + 6\n"
        "y = kx - 3\n\n"
        "If the system has exactly one real solution (x, y), and the x-coordinate of this solution is positive, what is the value of k?"
    )
    explanation = item.get("explanation")
    if isinstance(explanation, dict):
        correct = clean_math_text(str(explanation.get("correct") or ""))
        if "Final answer = 2." not in correct:
            correct = f"{correct} Final answer = 2."
        explanation["correct"] = correct
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            for letter, text in list(distractors.items()):
                distractors[letter] = clean_math_text(str(text))
    item.setdefault("contentAudit", {})
    if isinstance(item["contentAudit"], dict):
        item["contentAudit"]["lastDisplayRepair"] = "2026-05-26 single math warning repair"
    return before


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    matched = [item for item in bank if isinstance(item, dict) and item.get("id") == TARGET_ID]
    report: dict[str, Any] = {"targetId": TARGET_ID, "matched": len(matched), "applied": False}
    if matched:
        before = repair_item(matched[0])
        report["beforePrompt"] = before["prompt"]
        report["afterPrompt"] = matched[0].get("prompt")
    if args.apply and matched:
        backup = ROOT / "artifacts" / f"antigravity-bank-before-single-math-warning-repair-20260526-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        shutil.copy2(BANK_PATH, backup)
        BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        report["applied"] = True
        report["backupPath"] = str(backup.relative_to(ROOT))
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
