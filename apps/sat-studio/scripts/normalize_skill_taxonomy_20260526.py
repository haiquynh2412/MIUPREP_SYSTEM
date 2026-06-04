"""Normalize SAT Studio skill labels that split identical College Board skills.

This is a narrow cleanup for the 2026-05-26 content audit. It does not rewrite
questions or explanations; it only aligns known alias labels to the canonical
SAT Studio/College Board taxonomy so thin-skill reports do not undercount
reviewed content.
"""

from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
BANK_PATH = ROOT / "data" / "antigravity-bank.json"
REPORT_PATH = ROOT / "artifacts" / "skill-taxonomy-normalization-20260526.json"
QUESTION_FILES = [
    ROOT / "data" / "antigravity-bank.json",
    ROOT / "data" / "archive-source-ai-bank.json",
    ROOT / "data" / "kaplan-sat-math-ai-bank.json",
    ROOT / "data" / "opensat-pinesat.json",
    ROOT / "data" / "private-vault-archive-bank.json",
    ROOT / "data" / "sat-1590-elite-ai-bank.json",
    ROOT / "data" / "sat-king-supplemental-ai-bank.json",
    ROOT / "data" / "sat-studio-foundation-bank.json",
]

ALIASES: dict[tuple[str, str, str], tuple[str, str]] = {
    (
        "Math",
        "Problem-Solving and Data Analysis",
        "Scatterplots",
    ): (
        "Problem-Solving and Data Analysis",
        "Two-variable data: models and scatterplots",
    ),
    (
        "Math",
        "Problem-Solving and Data Analysis",
        "Two-variable data: Models and scatterplots",
    ): (
        "Problem-Solving and Data Analysis",
        "Two-variable data: models and scatterplots",
    ),
    (
        "Math",
        "Problem-Solving and Data Analysis",
        "One-variable data: Distributions and measures of center and spread",
    ): (
        "Problem-Solving and Data Analysis",
        "One-variable data: distributions and measures of center and spread",
    ),
    (
        "Math",
        "Problem-Solving and Data Analysis",
        "Ratios, rates, proportional relationships",
    ): (
        "Problem-Solving and Data Analysis",
        "Ratios, rates, proportional relationships, and units",
    ),
    (
        "Math",
        "Advanced Math",
        "Systems of equations in two variables",
    ): (
        "Advanced Math",
        "Nonlinear equations in one variable and systems of equations in two variables",
    ),
    (
        "Math",
        "Algebra",
        "Systems of equations in two variables",
    ): (
        "Algebra",
        "Systems of two linear equations in two variables",
    ),
    (
        "Math",
        "Algebra",
        "Nonlinear equations in one variable and systems of equations in two variables",
    ): (
        "Advanced Math",
        "Nonlinear equations in one variable and systems of equations in two variables",
    ),
}


def normalize_item(item: dict[str, Any]) -> dict[str, Any] | None:
    key = (str(item.get("section") or ""), str(item.get("domain") or ""), str(item.get("skill") or ""))
    replacement = ALIASES.get(key)
    if not replacement:
        return None
    old = {"id": item.get("id"), "domain": item.get("domain"), "skill": item.get("skill"), "canonicalSkill": item.get("canonicalSkill")}
    new_domain, new_skill = replacement
    item["domain"] = new_domain
    item["skill"] = new_skill
    if not item.get("canonicalSkill") or item.get("canonicalSkill") == old["skill"]:
        item["canonicalSkill"] = new_skill
    tags = item.get("contentTags")
    if isinstance(tags, list):
        item["contentTags"] = [new_domain if value == old["domain"] else new_skill if value == old["skill"] else value for value in tags]
    return {**old, "newDomain": new_domain, "newSkill": new_skill, "newCanonicalSkill": item.get("canonicalSkill")}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    changes = []
    changed_files: dict[str, list[dict[str, Any]]] = {}
    payloads: dict[Path, list[dict[str, Any]]] = {}
    for path in QUESTION_FILES:
        if not path.exists():
            continue
        bank = json.loads(path.read_text(encoding="utf-8"))
        payloads[path] = bank
        for item in bank:
            if isinstance(item, dict):
                change = normalize_item(item)
                if change:
                    change["file"] = str(path.relative_to(ROOT))
                    changes.append(change)
                    changed_files.setdefault(str(path.relative_to(ROOT)), []).append(change)

    report = {
        "applied": False,
        "totalChanges": len(changes),
        "changedFiles": {name: len(rows) for name, rows in changed_files.items()},
        "changeCounts": dict(Counter(f"{row['domain']} | {row['skill']} -> {row['newDomain']} | {row['newSkill']}" for row in changes)),
        "samples": changes[:20],
    }

    if args.apply and changes:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        backups = []
        for path, bank in payloads.items():
            if str(path.relative_to(ROOT)) not in changed_files:
                continue
            backup = ROOT / "artifacts" / f"{path.stem}-before-skill-taxonomy-normalization-20260526-{timestamp}.json"
            shutil.copy2(path, backup)
            path.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            backups.append(str(backup.relative_to(ROOT)))
        report["applied"] = True
        report["backupPaths"] = backups

    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
