import json
import math
import re
from collections import Counter
from datetime import date
from pathlib import Path

try:
    from scripts.check_questions import (
        DATA_DIR,
        QUESTION_FILES,
        is_hidden_duplicate_row,
        is_rejected_row,
        is_remedial_pool_row,
        iter_questions,
    )
    from scripts.math_verifier import is_grid_in
except ModuleNotFoundError:
    from check_questions import (
        DATA_DIR,
        QUESTION_FILES,
        is_hidden_duplicate_row,
        is_rejected_row,
        is_remedial_pool_row,
        iter_questions,
    )
    from math_verifier import is_grid_in


ROOT = Path(__file__).resolve().parents[1]
OUT = DATA_DIR / "sat-2026-readiness-audit.json"

OFFICIAL_RW = {
    "Information and Ideas": 26,
    "Craft and Structure": 28,
    "Expression of Ideas": 20,
    "Standard English Conventions": 26,
}

OFFICIAL_MATH = {
    "Algebra": 35,
    "Advanced Math": 35,
    "Problem-Solving and Data Analysis": 15,
    "Geometry and Trigonometry": 15,
}

RW_SKILLS = [
    "Central Ideas and Details",
    "Command of Evidence",
    "Inferences",
    "Words in Context",
    "Text Structure and Purpose",
    "Cross-Text Connections",
    "Rhetorical Synthesis",
    "Transitions",
    "Boundaries",
    "Form, Structure, and Sense",
]

MATH_SUBSKILLS = [
    "Linear equations in one variable",
    "Linear functions",
    "Linear equations in two variables",
    "Systems of two linear equations in two variables",
    "Linear inequalities in one or two variables",
    "Equivalent expressions",
    "Nonlinear functions",
    "Nonlinear equations in one variable",
    "Nonlinear equations in one variable and systems of equations in two variables",
    "Ratios, rates, proportional relationships, and units",
    "Percentages",
    "One-variable data: distributions and measures of center and spread",
    "Two-variable data: models and scatterplots",
    "Probability and conditional probability",
    "Inference from sample statistics and margin of error",
    "Evaluating statistical claims: observational studies and experiments",
    "Area and volume",
    "Lines, angles, and triangles",
    "Right triangles and trigonometry",
    "Circles",
]

PUBLIC_SAFE_SOURCE_TYPES = {
    "original",
    "ai_generated",
    "antigravity",
    "foundation",
    "sat_1590",
    "sat_king",
    "sat_studio_original",
}
PRIVATE_SOURCE_TYPES = {"private_vault", "antigravity"}
TARGET_TOLERANCE_PCT_POINTS = 3.0
MIN_CORE_PER_RW_SKILL = 60
MIN_CORE_PER_MATH_SUBSKILL = 35


def pct(count, total, digits=1):
    return round(100 * count / total, digits) if total else 0


def canonical_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def word_count(value):
    return len(re.findall(r"\b[\w'-]+\b", str(value or "")))


def normalize_skill(skill):
    skill = canonical_text(skill)
    aliases = {
        "Cross-Text Connection": "Cross-Text Connections",
        "Text Structure in Purpose": "Text Structure and Purpose",
        "Form, structure, and sense": "Form, Structure, and Sense",
        "Form, Structure, and Sense": "Form, Structure, and Sense",
        "Command of Evidence: Textual": "Command of Evidence",
        "Command of Evidence: Quantitative": "Command of Evidence",
        "Rates and units": "Ratios, rates, proportional relationships, and units",
        "Ratios and rates": "Ratios, rates, proportional relationships, and units",
        "Statistics": "One-variable data: distributions and measures of center and spread",
        "Data interpretation": "Two-variable data: models and scatterplots",
        "Probability": "Probability and conditional probability",
        "Linear functions and slope": "Linear functions",
        "Linear inequalities": "Linear inequalities in one or two variables",
        "Systems of linear equations": "Systems of two linear equations in two variables",
        "Nonlinear equations and functions": "Nonlinear equations in one variable",
        "Nonlinear equations": "Nonlinear equations in one variable",
        "Quadratic equations": "Nonlinear equations in one variable",
        "Exponential functions": "Nonlinear functions",
        "Advanced equations and functions": "Nonlinear equations in one variable",
        "Right triangles": "Right triangles and trigonometry",
        "Data, rates, percentages, and probability": "Problem-Solving and Data Analysis mixed",
        "Linear equations, inequalities, and functions": "Algebra mixed",
        "Geometry and trigonometry": "Geometry and Trigonometry mixed",
        "Grid-in": "Grid-in/SPR",
    }
    return aliases.get(skill, skill)


def question_id(question):
    return question.get("id") or f"{question.get('_sourceFile')}#{question.get('_sourceIndex')}"


def practice_pool(question):
    return question.get("practicePool") or question.get("skeletonDiversity", {}).get("practicePool") or "core_pool"


def content_verdict(question):
    return canonical_text((question.get("contentAudit") or {}).get("verdict")).lower()


def is_blocked_for_study(question):
    publication = canonical_text(question.get("publicationStatus")).lower()
    audit_status = canonical_text(question.get("auditStatus")).lower()
    verdict = content_verdict(question)
    return (
        is_rejected_row(question)
        or audit_status == "blocked"
        or publication == "audit_blocked"
        or publication.startswith("rejected")
        or verdict in {"blocked", "fail"}
    )


def is_reviewed(question):
    return canonical_text(question.get("reviewStatus")).lower() == "reviewed"


def is_study_visible(question):
    return not is_blocked_for_study(question) and not is_hidden_duplicate_row(question)


def is_core_visible(question):
    return is_study_visible(question) and not is_remedial_pool_row(question)


def is_core_ready(question):
    return is_reviewed(question) and is_core_visible(question)


def is_public_candidate_ready(question):
    publication = canonical_text(question.get("publicationStatus")).lower()
    source_type = canonical_text(question.get("sourceType"))
    return (
        is_core_ready(question)
        and question.get("visibility") == "public_candidate"
        and publication.startswith("public_candidate")
        and source_type in PUBLIC_SAFE_SOURCE_TYPES
        and content_verdict(question) == "pass"
    )


def is_family_only(question):
    source_type = canonical_text(question.get("sourceType"))
    return question.get("visibility") == "private_family" or source_type in PRIVATE_SOURCE_TYPES


def target_count_at_current_total(total, target_pct):
    return int(round(total * target_pct / 100))


def additional_needed_to_reach_pct(current, total, target_pct):
    target = target_pct / 100
    if target <= 0 or target >= 1:
        return 0
    if total <= 0 or current / total >= target:
        return 0
    return int(math.ceil((target * total - current) / (1 - target)))


def balance_direction(delta_pct_points):
    if delta_pct_points <= -TARGET_TOLERANCE_PCT_POINTS:
        return "underrepresented"
    if delta_pct_points >= TARGET_TOLERANCE_PCT_POINTS:
        return "overrepresented"
    return "near_target"


def domain_distribution(rows, section, official):
    section_rows = [row for row in rows if row.get("section") == section and row.get("domain") in official]
    total = len(section_rows)
    counts = Counter(row.get("domain") for row in section_rows)
    distribution = []
    for domain, target in official.items():
        count = counts.get(domain, 0)
        actual_pct = pct(count, total)
        delta_pct = round(actual_pct - target, 1)
        target_count = target_count_at_current_total(total, target)
        distribution.append(
            {
                "domain": domain,
                "count": count,
                "totalInSectionBasis": total,
                "actualPct": actual_pct,
                "officialPct": target,
                "deltaPctPoints": delta_pct,
                "targetCountAtCurrentTotal": target_count,
                "deltaCountAtCurrentTotal": count - target_count,
                "additionalNeededIfOnlyAddingThisDomain": additional_needed_to_reach_pct(count, total, target),
                "balance": balance_direction(delta_pct),
            }
        )
    return distribution


def domain_action_rows(label, rows, section, official):
    actions = []
    for item in domain_distribution(rows, section, official):
        if item["balance"] == "near_target":
            continue
        if item["balance"] == "underrepresented":
            action = "generate_or_promote_more_core_items"
            priority = abs(item["deltaPctPoints"]) + item["additionalNeededIfOnlyAddingThisDomain"] / 100
        else:
            action = "deprioritize_surplus_easy_medium_or_use_for_remediation"
            priority = abs(item["deltaPctPoints"]) + max(item["deltaCountAtCurrentTotal"], 0) / 100
        actions.append(
            {
                "basis": label,
                "section": section,
                "domain": item["domain"],
                "balance": item["balance"],
                "actualPct": item["actualPct"],
                "officialPct": item["officialPct"],
                "deltaPctPoints": item["deltaPctPoints"],
                "deltaCountAtCurrentTotal": item["deltaCountAtCurrentTotal"],
                "additionalNeededIfOnlyAddingThisDomain": item["additionalNeededIfOnlyAddingThisDomain"],
                "recommendedAction": action,
                "_priority": round(priority, 3),
            }
        )
    return sorted(actions, key=lambda row: row["_priority"], reverse=True)


def skill_counts(rows, skills, section=None):
    counts = Counter()
    hard_counts = Counter()
    grid_counts = Counter()
    for row in rows:
        if section and row.get("section") != section:
            continue
        skill = normalize_skill(row.get("skill"))
        counts[skill] += 1
        if row.get("difficulty") == "Hard":
            hard_counts[skill] += 1
        if row.get("section") == "Math" and is_grid_in(row):
            grid_counts[skill] += 1
    return [
        {
            "skill": skill,
            "count": counts.get(skill, 0),
            "hardCount": hard_counts.get(skill, 0),
            "gridInCount": grid_counts.get(skill, 0),
        }
        for skill in skills
    ]


def thin_skill_rows(skill_rows, min_count):
    return [row for row in skill_rows if row["count"] < min_count]


def difficulty_mix(rows):
    counts = Counter(row.get("difficulty") or "Unknown" for row in rows)
    total = sum(counts.values())
    return {
        key: {"count": counts.get(key, 0), "pct": pct(counts.get(key, 0), total)}
        for key in ["Easy", "Medium", "Hard", "Unknown"]
    }


def source_breakdown(rows):
    return dict(sorted(Counter(row.get("sourceType") or "unknown" for row in rows).items()))


def section_breakdown(rows):
    return dict(sorted(Counter(row.get("section") or "Unknown" for row in rows).items()))


def pool_breakdown(rows):
    return dict(sorted(Counter(practice_pool(row) for row in rows).items()))


def hard_multi_step_math(question):
    if question.get("section") != "Math" or question.get("difficulty") != "Hard":
        return False
    prompt = str(question.get("prompt") or "").lower()
    context_markers = [
        "table",
        "graph",
        "survey",
        "study",
        "model",
        "population",
        "price",
        "cost",
        "rate",
        "percent",
        "rectangle",
        "triangle",
        "circle",
        "xy-plane",
        "line",
    ]
    return word_count(prompt) >= 35 and any(marker in prompt for marker in context_markers)


def skeleton_key(question):
    text = str(question.get("prompt") or "").lower()
    text = re.sub(r"\b\d+(?:\.\d+)?\b", "#", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:260]


def repeated_skeletons(rows, min_count=10, limit=12):
    counts = Counter(skeleton_key(row) for row in rows if row.get("prompt"))
    return [
        {"count": count, "sampleSkeleton": skeleton}
        for skeleton, count in counts.most_common(limit)
        if count >= min_count
    ]


def sample_ids(rows, predicate, limit=12):
    return [question_id(row) for row in rows if predicate(row)][:limit]


def format_stats(rows):
    math_rows = [row for row in rows if row.get("section") == "Math"]
    grid_rows = [row for row in math_rows if is_grid_in(row)]
    hard_math_rows = [row for row in math_rows if row.get("difficulty") == "Hard"]
    hard_multi_step = [row for row in math_rows if hard_multi_step_math(row)]
    return {
        "mathTotal": len(math_rows),
        "mathGridIn": len(grid_rows),
        "mathGridInPct": pct(len(grid_rows), len(math_rows)),
        "mathGridInOfficialPct": 25,
        "mathGridInDeltaPctPoints": round(pct(len(grid_rows), len(math_rows)) - 25, 1),
        "mathGridInAdditionalNeededIfOnlyAddingSPR": additional_needed_to_reach_pct(len(grid_rows), len(math_rows), 25),
        "hardMathTotal": len(hard_math_rows),
        "hardMultiStepMathHeuristic": len(hard_multi_step),
        "hardMultiStepMathPctOfHardMath": pct(len(hard_multi_step), len(hard_math_rows)),
    }


def build_inventory(all_rows, non_blocked, study_visible, core_ready, public_ready):
    hidden = [row for row in all_rows if is_hidden_duplicate_row(row)]
    remedial = [row for row in all_rows if is_remedial_pool_row(row)]
    blocked = [row for row in all_rows if is_blocked_for_study(row)]
    needs_review = [
        row
        for row in all_rows
        if not is_blocked_for_study(row)
        and (not is_reviewed(row) or content_verdict(row) in {"needs_review", ""})
    ]
    sat_1590_rows = [row for row in all_rows if row.get("sourceType") == "sat_1590" and not is_blocked_for_study(row)]
    strict_1600_rows = [
        row
        for row in all_rows
        if row.get("strict1600Review") and not is_blocked_for_study(row) and row.get("difficulty") == "Hard"
    ]
    return {
        "questionFiles": QUESTION_FILES,
        "loadedTotal": len(all_rows),
        "nonBlockedForStudy": len(non_blocked),
        "studyVisibleExcludingHidden": len(study_visible),
        "coreReadyReviewed": len(core_ready),
        "publicCandidateReadyReviewed": len(public_ready),
        "blockedOrRejected": len(blocked),
        "hiddenDuplicate": len(hidden),
        "remedialPool": len(remedial),
        "needsReviewOrContentAuditNotPass": len(needs_review),
        "familyOnlyNonBlocked": len([row for row in non_blocked if is_family_only(row)]),
        "sat1590NonBlocked": len(sat_1590_rows),
        "sat1590CoreReady": len([row for row in core_ready if row.get("sourceType") == "sat_1590"]),
        "strict1600HardNonBlocked": len(strict_1600_rows),
        "sourceCountsLoaded": source_breakdown(all_rows),
        "sourceCountsCoreReady": source_breakdown(core_ready),
        "sectionCountsCoreReady": section_breakdown(core_ready),
        "poolCountsLoaded": pool_breakdown(all_rows),
    }


def build_report(rows):
    all_rows = list(rows)
    non_blocked = [row for row in all_rows if not is_blocked_for_study(row)]
    study_visible = [row for row in all_rows if is_study_visible(row)]
    core_ready = [row for row in all_rows if is_core_ready(row)]
    public_ready = [row for row in all_rows if is_public_candidate_ready(row)]

    rw_core_skills = skill_counts(core_ready, RW_SKILLS, section="Reading and Writing")
    math_core_skills = skill_counts(core_ready, MATH_SUBSKILLS, section="Math")
    public_rw_skills = skill_counts(public_ready, RW_SKILLS, section="Reading and Writing")
    public_math_skills = skill_counts(public_ready, MATH_SUBSKILLS, section="Math")

    balance_actions = (
        domain_action_rows("coreReadyReviewed", core_ready, "Reading and Writing", OFFICIAL_RW)
        + domain_action_rows("coreReadyReviewed", core_ready, "Math", OFFICIAL_MATH)
        + domain_action_rows("publicCandidateReadyReviewed", public_ready, "Reading and Writing", OFFICIAL_RW)
        + domain_action_rows("publicCandidateReadyReviewed", public_ready, "Math", OFFICIAL_MATH)
    )
    balance_actions = sorted(balance_actions, key=lambda row: row["_priority"], reverse=True)
    for row in balance_actions:
        row.pop("_priority", None)

    report = {
        "generatedAt": date.today().isoformat(),
        "basis": {
            "officialReferences": [
                {
                    "label": "College Board SAT content domains",
                    "url": "https://satsuite.collegeboard.org/practice/content-domains",
                },
                {
                    "label": "College Board SAT structure",
                    "url": "https://satsuite.collegeboard.org/sat/whats-on-the-test/structure",
                },
                {
                    "label": "College Board Math student-produced responses",
                    "url": "https://satsuite.collegeboard.org/sat/whats-on-the-test/math/student-produced",
                },
                {
                    "label": "College Board Assessment Framework for the Digital SAT Suite",
                    "url": "https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf",
                },
            ],
            "rwOfficialDomainPct": OFFICIAL_RW,
            "mathOfficialDomainPct": OFFICIAL_MATH,
            "mathOfficialFormatPct": {"multipleChoice": 75, "studentProducedResponse": 25},
            "officialStructure": {
                "readingWriting": "54 questions, 64 minutes, two 32-minute modules",
                "math": "44 questions, 70 minutes, two 35-minute modules",
                "total": "98 questions, 134 minutes",
                "adaptive": "two-stage adaptive; first module routes to easier or harder second module",
            },
            "auditPolicy": {
                "coreReadyReviewed": "reviewStatus reviewed, not blocked/rejected, not hidden_duplicate, not remedial_pool",
                "publicCandidateReadyReviewed": "core-ready public_candidate rows from public-safe source types with contentAudit pass",
                "balanceTolerancePctPoints": TARGET_TOLERANCE_PCT_POINTS,
            },
        },
        "inventory": build_inventory(all_rows, non_blocked, study_visible, core_ready, public_ready),
        "domainBalance": {
            "coreReadyReadingWriting": domain_distribution(core_ready, "Reading and Writing", OFFICIAL_RW),
            "coreReadyMath": domain_distribution(core_ready, "Math", OFFICIAL_MATH),
            "publicReadyReadingWriting": domain_distribution(public_ready, "Reading and Writing", OFFICIAL_RW),
            "publicReadyMath": domain_distribution(public_ready, "Math", OFFICIAL_MATH),
            "nonBlockedReadingWriting": domain_distribution(non_blocked, "Reading and Writing", OFFICIAL_RW),
            "nonBlockedMath": domain_distribution(non_blocked, "Math", OFFICIAL_MATH),
        },
        "skillCoverage": {
            "coreReadyReadingWriting": rw_core_skills,
            "coreReadyMathSubskills": math_core_skills,
            "publicReadyReadingWriting": public_rw_skills,
            "publicReadyMathSubskills": public_math_skills,
            "thinCoreReadyReadingWriting": thin_skill_rows(rw_core_skills, MIN_CORE_PER_RW_SKILL),
            "thinCoreReadyMathSubskills": thin_skill_rows(math_core_skills, MIN_CORE_PER_MATH_SUBSKILL),
            "thinPublicReadyReadingWriting": thin_skill_rows(public_rw_skills, 20),
            "thinPublicReadyMathSubskills": thin_skill_rows(public_math_skills, 12),
        },
        "difficulty": {
            "allLoaded": difficulty_mix(all_rows),
            "nonBlockedForStudy": difficulty_mix(non_blocked),
            "coreReadyReviewed": difficulty_mix(core_ready),
            "publicCandidateReadyReviewed": difficulty_mix(public_ready),
            "sat1590CoreReady": difficulty_mix([row for row in core_ready if row.get("sourceType") == "sat_1590"]),
        },
        "formatAndFidelity": {
            "coreReady": format_stats(core_ready),
            "publicCandidateReady": format_stats(public_ready),
            "sat1590CoreReady": format_stats([row for row in core_ready if row.get("sourceType") == "sat_1590"]),
            "templateRepetitionRiskCoreReady": repeated_skeletons(core_ready),
            "sampleHardMultiStepMathIds": sample_ids(core_ready, hard_multi_step_math, limit=15),
            "samplePublicGridInIds": sample_ids(public_ready, lambda row: row.get("section") == "Math" and is_grid_in(row), limit=15),
        },
        "balancePlan": {
            "domainActions": balance_actions,
            "nextGenerationTargets": [
                {
                    "section": "Reading and Writing",
                    "domain": "Expression of Ideas",
                    "skills": ["Transitions", "Rhetorical Synthesis"],
                    "priority": "highest_rw_gap",
                    "guidance": "Add original medium/hard items with varied student-notes contexts and tighter transition traps.",
                },
                {
                    "section": "Reading and Writing",
                    "domain": "Craft and Structure",
                    "skills": ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"],
                    "priority": "rw_gap",
                    "guidance": "Add short-passage hard items with real rhetorical purpose and paired-text reasoning.",
                },
                {
                    "section": "Math",
                    "domain": "Algebra",
                    "skills": [
                        "Linear equations in two variables",
                        "Linear functions",
                        "Systems of two linear equations in two variables",
                        "Linear inequalities in one or two variables",
                    ],
                    "priority": "highest_math_gap",
                    "guidance": "Prefer hard and SPR forms, especially word problems and graph/table contexts.",
                },
                {
                    "section": "Math",
                    "domain": "Advanced Math",
                    "skills": [
                        "Equivalent expressions",
                        "Nonlinear functions",
                        "Nonlinear equations in one variable",
                        "Nonlinear equations in one variable and systems of equations in two variables",
                    ],
                    "priority": "math_gap",
                    "guidance": "Prefer 1590-level structure, parameter, discriminant, and equivalent-form items.",
                },
                {
                    "section": "Math",
                    "domain": "Grid-in/SPR",
                    "skills": ["Algebra", "Advanced Math"],
                    "priority": "format_gap",
                    "guidance": "Raise core-ready Math SPR toward the official 25% target without adding easy numeric clones.",
                },
            ],
            "deprioritizationPolicy": [
                "Do not delete surplus domains; route surplus easy/medium generated clones to remedial_pool or topic-specific drills.",
                "Keep hard, high-quality variants when the context, trap, or method differs materially.",
                "Keep private/vault/archive rows out of public export unless rewritten as original public-safe drafts.",
            ],
        },
        "publicSafety": {
            "publicCandidateReadyDefinition": "visibility public_candidate, publicationStatus public_candidate*, contentAudit pass, sourceType in public-safe list",
            "publicSafeSourceTypes": sorted(PUBLIC_SAFE_SOURCE_TYPES),
            "privateOnlySourceTypes": sorted(PRIVATE_SOURCE_TYPES),
            "notes": [
                "Official or commercial source text should remain metadata-only/private and should not be exported publicly.",
                "OpenSAT/foundation rows can support local study, but public release should require source/license and content audit pass.",
                "SAT 1590 and SAT King rows are the best public-candidate pools, but still need human pedagogical review before broad release.",
            ],
        },
        "scorecard": {
            "domainBalanceCore": 7.0,
            "skillCoverageCore": 7.5,
            "hardAnd1590Coverage": 8.0,
            "mathSprFidelity": 6.0,
            "publicReleaseReadiness": 6.5,
            "summary": "Core inventory is large and strong for hard practice, but normal practice overweights Standard English, Geometry, and Data Analysis while underweighting Expression of Ideas, Algebra, Advanced Math, and Math SPR. Public-ready balance is narrower than family/local balance.",
        },
    }
    return report


def main():
    report = build_report(iter_questions())
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    compact = {
        "path": str(OUT),
        "inventory": report["inventory"],
        "coreFormat": report["formatAndFidelity"]["coreReady"],
        "topDomainActions": report["balancePlan"]["domainActions"][:8],
        "thinCoreRwSkills": report["skillCoverage"]["thinCoreReadyReadingWriting"],
        "thinCoreMathSubskills": report["skillCoverage"]["thinCoreReadyMathSubskills"][:8],
    }
    print(json.dumps(compact, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
