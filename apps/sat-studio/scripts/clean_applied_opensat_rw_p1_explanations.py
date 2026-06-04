import json
from pathlib import Path

try:
    from scripts.check_questions import normalize_raw_question
    from scripts.review_unified_needs_review_bank import load_payload, write_payload
    from scripts.tag_trap_types import tag_question
    from scripts.triage_opensat_rw_p1_explanations import (
        OPENSAT_PATH,
        REPORT_JSON,
        infer_family,
        set_explanation,
        upgrade_explanation,
        validate_after,
    )
except ModuleNotFoundError:
    from check_questions import normalize_raw_question
    from review_unified_needs_review_bank import load_payload, write_payload
    from tag_trap_types import tag_question
    from triage_opensat_rw_p1_explanations import (
        OPENSAT_PATH,
        REPORT_JSON,
        infer_family,
        set_explanation,
        upgrade_explanation,
        validate_after,
    )


def main() -> None:
    report = json.loads(REPORT_JSON.read_text(encoding="utf-8"))
    applied = report.get("applied") or []
    indices = [int(row["sourceIndex"]) for row in applied if "sourceIndex" in row]
    payload, questions = load_payload(OPENSAT_PATH)
    blocked = []
    for index in indices:
        raw = questions[index]
        question = normalize_raw_question(raw, OPENSAT_PATH.name, index)
        inferred_domain, inferred_skill = infer_family(question)
        set_explanation(raw, upgrade_explanation(question, inferred_domain, inferred_skill))
        normalized = normalize_raw_question(raw, OPENSAT_PATH.name, index)
        raw["trapTypes"] = tag_question(normalized)
        raw["trapTypesVersion"] = "trap-types-v1-2026-05-20"
        validation = validate_after(raw, index)
        if validation["issues"] or validation["warnings"] or validation["depthFlags"]:
            blocked.append({"sourceIndex": index, "id": raw.get("id"), **validation})
    if blocked:
        raise SystemExit(json.dumps({"blocked": blocked[:20], "blockedCount": len(blocked)}, indent=2, ensure_ascii=False))
    write_payload(OPENSAT_PATH, payload)
    print(json.dumps({"rewritten": len(indices), "blocked": 0}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
