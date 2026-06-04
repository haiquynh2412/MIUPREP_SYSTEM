import json
import math
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

try:
    from scripts.audit_sat_2026_readiness import (
        OFFICIAL_MATH,
        additional_needed_to_reach_pct,
        is_core_ready,
        normalize_skill,
        pct,
        question_id,
    )
    from scripts.check_questions import iter_questions
    from scripts.math_verifier import is_grid_in
except ModuleNotFoundError:
    from audit_sat_2026_readiness import (
        OFFICIAL_MATH,
        additional_needed_to_reach_pct,
        is_core_ready,
        normalize_skill,
        pct,
        question_id,
    )
    from check_questions import iter_questions
    from math_verifier import is_grid_in


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ARTIFACT_DIR = ROOT / "artifacts"
OUT_JSON = DATA_DIR / "math-algebra-advanced-blueprint-analysis.json"
OUT_MD = ARTIFACT_DIR / f"math-algebra-advanced-content-roadmap-{date.today().strftime('%Y%m%d')}.md"

DOMAINS = ["Algebra", "Advanced Math"]

ALGEBRA_FAMILIES = {
    "Systems of two linear equations in two variables": ["systems of two linear equations", "systems of linear equations"],
    "Linear inequalities in one or two variables": ["linear inequalities", "inequality", "inequalities"],
    "Linear equations in one variable": ["linear equations in one variable", "one variable"],
    "Linear equations in two variables": ["linear equations in two variables"],
    "Linear functions": ["linear functions", "linear function", "slope"],
}

ADVANCED_FAMILIES = {
    "Equivalent expressions": ["equivalent expressions", "equivalent expression", "rewrite", "factoring", "expanding"],
    "Nonlinear equations in one variable": ["nonlinear equations", "quadratic equations", "quadratic", "exponential equations"],
    "Systems of equations in two variables": ["systems of equations in two variables", "nonlinear systems", "system"],
    "Nonlinear functions": ["nonlinear functions", "exponential functions", "quadratic functions", "function notation"],
}

TARGET_FAMILY_SHARE = {
    "Algebra": {
        "Linear equations in one variable": 0.18,
        "Linear equations in two variables": 0.20,
        "Linear functions": 0.22,
        "Systems of two linear equations in two variables": 0.25,
        "Linear inequalities in one or two variables": 0.15,
    },
    "Advanced Math": {
        "Equivalent expressions": 0.22,
        "Nonlinear equations in one variable": 0.30,
        "Systems of equations in two variables": 0.20,
        "Nonlinear functions": 0.28,
    },
}

PHASE_A_ADDITIONS = {"Algebra": 28, "Advanced Math": 36}
PHASE_B_ADDITIONS = {"Algebra": 70, "Advanced Math": 90}

DIFFICULTY_TARGETS = {
    "Algebra": {"Easy": 0.10, "Medium": 0.45, "Hard": 0.45},
    "Advanced Math": {"Easy": 0.07, "Medium": 0.30, "Hard": 0.63},
}

BAND_TARGETS = {
    "G10-Bridge": 0.18,
    "SAT-Core": 0.32,
    "SAT-Advanced": 0.30,
    "SAT-Elite": 0.20,
}


def canonical_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def lower_text(value):
    return canonical_text(value).lower()


def question_type(question):
    return "SPR" if is_grid_in(question) else "MC"


def canonical_skill(question):
    return normalize_skill(question.get("canonicalSkill") or question.get("skill") or question.get("microSkill") or "")


def classify_family(question):
    domain = question.get("domain")
    skill_text = lower_text(canonical_skill(question))
    micro_text = lower_text(question.get("microSkill"))
    prompt_text = lower_text(question.get("prompt"))[:800]
    haystack = " ".join([skill_text, micro_text, prompt_text])
    families = ALGEBRA_FAMILIES if domain == "Algebra" else ADVANCED_FAMILIES if domain == "Advanced Math" else {}
    for family, needles in families.items():
        if any(needle in haystack for needle in needles):
            return family
    return f"{domain} mixed/other" if domain in DOMAINS else "Other"


def counter_dict(counter):
    return dict(sorted(counter.items(), key=lambda item: (-item[1], item[0])))


def round_alloc(total, shares):
    raw = {key: total * share for key, share in shares.items()}
    base = {key: int(math.floor(value)) for key, value in raw.items()}
    remaining = total - sum(base.values())
    ranked = sorted(raw, key=lambda key: raw[key] - base[key], reverse=True)
    for key in ranked[:remaining]:
        base[key] += 1
    return base


def domain_distribution(math_rows):
    total = len(math_rows)
    counts = Counter(row.get("domain") for row in math_rows if row.get("domain") in OFFICIAL_MATH)
    rows = []
    for domain, target_pct in OFFICIAL_MATH.items():
        count = counts.get(domain, 0)
        rows.append(
            {
                "domain": domain,
                "count": count,
                "actualPct": pct(count, total),
                "officialPct": target_pct,
                "deltaPctPoints": round(pct(count, total) - target_pct, 1),
                "targetCountAtCurrentTotal": int(round(total * target_pct / 100)),
                "deltaCountAtCurrentTotal": count - int(round(total * target_pct / 100)),
                "additionalNeededIfOnlyAddingThisDomain": additional_needed_to_reach_pct(count, total, target_pct),
            }
        )
    return rows


def grouped_rows(rows, domain):
    domain_rows = [row for row in rows if row.get("domain") == domain]
    family_map = defaultdict(list)
    for row in domain_rows:
        family_map[classify_family(row)].append(row)

    target_floor = 70 if domain == "Algebra" else 80
    output = []
    for family in sorted(TARGET_FAMILY_SHARE[domain]):
        items = family_map.get(family, [])
        diff = Counter(item.get("difficulty") or "Unknown" for item in items)
        bands = Counter(item.get("targetBand") or "Unlabeled" for item in items)
        formats = Counter(question_type(item) for item in items)
        sources = Counter(item.get("sourceType") or "unknown" for item in items)
        hard_pct = pct(diff.get("Hard", 0), len(items))
        target_count = int(round(sum(1 for row in domain_rows) * TARGET_FAMILY_SHARE[domain][family]))
        output.append(
            {
                "family": family,
                "count": len(items),
                "targetSharePct": round(TARGET_FAMILY_SHARE[domain][family] * 100),
                "targetCountWithinCurrentDomain": target_count,
                "deltaToWithinDomainTarget": len(items) - target_count,
                "floorFor1600Track": target_floor,
                "shortfallToFloor": max(0, target_floor - len(items)),
                "difficulty": counter_dict(diff),
                "hardPct": hard_pct,
                "targetBand": counter_dict(bands),
                "format": counter_dict(formats),
                "sourceType": counter_dict(sources),
                "sampleIds": [question_id(item) for item in items[:6]],
            }
        )

    other_items = [item for family, items in family_map.items() if family not in TARGET_FAMILY_SHARE[domain] for item in items]
    if other_items:
        output.append(
            {
                "family": f"{domain} mixed/other",
                "count": len(other_items),
                "targetSharePct": 0,
                "targetCountWithinCurrentDomain": 0,
                "deltaToWithinDomainTarget": len(other_items),
                "floorFor1600Track": 0,
                "shortfallToFloor": 0,
                "difficulty": counter_dict(Counter(item.get("difficulty") or "Unknown" for item in other_items)),
                "hardPct": pct(sum(1 for item in other_items if item.get("difficulty") == "Hard"), len(other_items)),
                "targetBand": counter_dict(Counter(item.get("targetBand") or "Unlabeled" for item in other_items)),
                "format": counter_dict(Counter(question_type(item) for item in other_items)),
                "sourceType": counter_dict(Counter(item.get("sourceType") or "unknown" for item in other_items)),
                "sampleIds": [question_id(item) for item in other_items[:6]],
            }
        )
    return output


def phase_allocation(total_by_domain):
    plan = {}
    for domain, total in total_by_domain.items():
        family_alloc = round_alloc(total, TARGET_FAMILY_SHARE[domain])
        difficulty_alloc = round_alloc(total, DIFFICULTY_TARGETS[domain])
        band_alloc = round_alloc(total, BAND_TARGETS)
        plan[domain] = {
            "total": total,
            "familyAllocation": family_alloc,
            "difficultyAllocation": difficulty_alloc,
            "targetBandAllocation": band_alloc,
            "formatAllocation": round_alloc(total, {"MC": 0.78, "SPR": 0.22}),
        }
    return plan


def total_dual_additions(algebra, advanced, total, target_pct=0.35):
    needed_sum = ((2 * target_pct) * total - algebra - advanced) / (1 - 2 * target_pct)
    additions = max(0, math.ceil(needed_sum))
    new_total = total + additions
    return {
        "totalAdditionsIfOnlyAddingAlgebraAndAdvanced": additions,
        "algebraAdditionsAtDualTarget": max(0, math.ceil(target_pct * new_total - algebra)),
        "advancedMathAdditionsAtDualTarget": max(0, math.ceil(target_pct * new_total - advanced)),
        "projectedMathTotal": new_total,
    }


def markdown_table(headers, rows):
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(value) for value in row) + " |")
    return "\n".join(lines)


def write_markdown(report):
    summary = report["summary"]
    domain_rows = report["domainDistribution"]
    lines = [
        "# Algebra va Advanced Math - ke hoach bo sung noi dung",
        "",
        f"Ngay tao: {report['generatedAt']}",
        "",
        "## Ket luan dieu hanh",
        "",
        f"- Co so tinh: {summary['coreReadyMathTotal']} cau Math `core ready reviewed`.",
        f"- Algebra hien co {summary['algebraCount']} cau, chiem {summary['algebraPct']}% so voi muc SAT 35%. Neu chi them Algebra thi can them {summary['algebraAdditionalIfOnlyAddingThisDomain']} cau.",
        f"- Advanced Math hien co {summary['advancedMathCount']} cau, chiem {summary['advancedMathPct']}% so voi muc SAT 35%. Neu chi them Advanced Math thi can them {summary['advancedMathAdditionalIfOnlyAddingThisDomain']} cau.",
        f"- Neu chi them Algebra + Advanced Math de dua ca hai ve 35%, can khoang {summary['dualTarget']['totalAdditionsIfOnlyAddingAlgebraAndAdvanced']} cau moi. Day khong phai cach ROI tot nhat.",
        "- Huong dung: them batch co muc tieu nho, dong thoi chuyen bot PSDA/Geometry lap mau sang remedial/hidden va tao curriculum view theo trinh do.",
        "",
        "## Can bang domain Math hien tai",
        "",
        markdown_table(
            ["Domain", "Count", "Actual", "Official", "Delta", "Add-only need"],
            [
                [
                    item["domain"],
                    item["count"],
                    f"{item['actualPct']}%",
                    f"{item['officialPct']}%",
                    f"{item['deltaPctPoints']} pp",
                    item["additionalNeededIfOnlyAddingThisDomain"],
                ]
                for item in domain_rows
            ],
        ),
        "",
        "## Algebra - phan tich micro-skill",
        "",
        markdown_table(
            ["Family", "Count", "Hard", "Target share", "Floor gap", "Diff mix", "Band mix"],
            [
                [
                    item["family"],
                    item["count"],
                    f"{item['hardPct']}%",
                    f"{item['targetSharePct']}%",
                    item["shortfallToFloor"],
                    ", ".join(f"{k}:{v}" for k, v in item["difficulty"].items()),
                    ", ".join(f"{k}:{v}" for k, v in item["targetBand"].items()),
                ]
                for item in report["families"]["Algebra"]
            ],
        ),
        "",
        "## Advanced Math - phan tich micro-skill",
        "",
        markdown_table(
            ["Family", "Count", "Hard", "Target share", "Floor gap", "Diff mix", "Band mix"],
            [
                [
                    item["family"],
                    item["count"],
                    f"{item['hardPct']}%",
                    f"{item['targetSharePct']}%",
                    item["shortfallToFloor"],
                    ", ".join(f"{k}:{v}" for k, v in item["difficulty"].items()),
                    ", ".join(f"{k}:{v}" for k, v in item["targetBand"].items()),
                ]
                for item in report["families"]["Advanced Math"]
            ],
        ),
        "",
        "## Lo trinh bo sung theo trinh do Grade 10 -> SAT 1600",
        "",
        "### Tang 1: G10-Bridge",
        "- Algebra: equation one-variable, slope tu bang/graph, he phuong trinh co he so than thien, inequality doc tu ngu canh.",
        "- Advanced Math: factor/rewrite co pattern ro, quadratic mot buoc, exponential growth co bang gia tri.",
        "- Do kho: Easy/Medium; muc tieu la lam chac ngon ngu de bai, don vi, dau bat dang thuc.",
        "",
        "### Tang 2: SAT-Core",
        "- Algebra: bien doi phuong trinh hai bien, intercept/slope, systems tu word problem, inequality region.",
        "- Advanced Math: equivalent expressions, quadratic roots/vertex, nonlinear function interpretation.",
        "- Do kho: Medium chinh, co distractor do sai dau, chia sai, nham intercept.",
        "",
        "### Tang 3: SAT-Advanced",
        "- Algebra: systems tham so, linear model voi constraints, piecewise/rate context.",
        "- Advanced Math: nonlinear equations co tham so, function transformation, quadratic/exponential model.",
        "- Do kho: Medium/Hard; yeu cau chon phuong phap ngan nhat va nhan trap.",
        "",
        "### Tang 4: SAT-Elite 1550-1600",
        "- Algebra: an tham so, so sanh he so, he vo nghiem/vo so nghiem, inequality voi dieu kien an.",
        "- Advanced Math: nonlinear system, function composition/inverse-lite, equivalent expression an tham so.",
        "- Do kho: Hard; loi giai phai co route nhanh, route an toan, va phan tich vi sao distractor hap dan.",
        "",
        "## Checklist tao content truoc mat",
        "",
        "### Phase A - 64 cau co ROI cao",
        markdown_table(
            ["Domain", "Total", "MC", "SPR", "Easy", "Medium", "Hard", "G10", "Core", "Advanced", "Elite"],
            [
                [
                    domain,
                    item["total"],
                    item["formatAllocation"].get("MC", 0),
                    item["formatAllocation"].get("SPR", 0),
                    item["difficultyAllocation"].get("Easy", 0),
                    item["difficultyAllocation"].get("Medium", 0),
                    item["difficultyAllocation"].get("Hard", 0),
                    item["targetBandAllocation"].get("G10-Bridge", 0),
                    item["targetBandAllocation"].get("SAT-Core", 0),
                    item["targetBandAllocation"].get("SAT-Advanced", 0),
                    item["targetBandAllocation"].get("SAT-Elite", 0),
                ]
                for domain, item in report["phaseA"].items()
            ],
        ),
        "",
        "Family allocation Phase A:",
    ]
    for domain, item in report["phaseA"].items():
        lines.append(f"- {domain}: " + "; ".join(f"{family}: {count}" for family, count in item["familyAllocation"].items()))
    lines.extend(
        [
            "",
            "### Phase B - 160 cau sau khi Phase A qua audit",
            markdown_table(
                ["Domain", "Total", "MC", "SPR", "Easy", "Medium", "Hard", "G10", "Core", "Advanced", "Elite"],
                [
                    [
                        domain,
                        item["total"],
                        item["formatAllocation"].get("MC", 0),
                        item["formatAllocation"].get("SPR", 0),
                        item["difficultyAllocation"].get("Easy", 0),
                        item["difficultyAllocation"].get("Medium", 0),
                        item["difficultyAllocation"].get("Hard", 0),
                        item["targetBandAllocation"].get("G10-Bridge", 0),
                        item["targetBandAllocation"].get("SAT-Core", 0),
                        item["targetBandAllocation"].get("SAT-Advanced", 0),
                        item["targetBandAllocation"].get("SAT-Elite", 0),
                    ]
                    for domain, item in report["phaseB"].items()
                ],
            ),
            "",
            "Family allocation Phase B:",
        ]
    )
    for domain, item in report["phaseB"].items():
        lines.append(f"- {domain}: " + "; ".join(f"{family}: {count}" for family, count in item["familyAllocation"].items()))
    lines.extend(
        [
            "",
            "## Quy tac chat luong cho moi cau moi",
            "",
            "- Explanation bat buoc co: loi giai dung, shortcut/route scoring, va 2-3 trap distractor neu la MC.",
            "- Moi Hard item phai co `targetBand` SAT-Advanced hoac SAT-Elite va `modulePlacement` module2_upper.",
            "- Khong them PSDA/Geometry trong hai batch toi, tru khi can sua accuracy blocker.",
            "- SPR moi gioi han khoang 22% vi Math bank hien da khong thieu SPR.",
            "- Sau moi batch: chay expert audit, rebuild explanation queue, readiness audit, browser smoke.",
        ]
    )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    rows = [row for row in iter_questions() if is_core_ready(row) and row.get("section") == "Math"]
    domain_rows = domain_distribution(rows)
    counts = {item["domain"]: item["count"] for item in domain_rows}
    total = len(rows)
    algebra = counts.get("Algebra", 0)
    advanced = counts.get("Advanced Math", 0)
    report = {
        "generatedAt": date.today().isoformat(),
        "basis": "Math questions with reviewStatus=reviewed, not rejected/blocked, not hidden_duplicate, not remedial_pool.",
        "summary": {
            "coreReadyMathTotal": total,
            "algebraCount": algebra,
            "algebraPct": pct(algebra, total),
            "algebraAdditionalIfOnlyAddingThisDomain": additional_needed_to_reach_pct(algebra, total, OFFICIAL_MATH["Algebra"]),
            "advancedMathCount": advanced,
            "advancedMathPct": pct(advanced, total),
            "advancedMathAdditionalIfOnlyAddingThisDomain": additional_needed_to_reach_pct(advanced, total, OFFICIAL_MATH["Advanced Math"]),
            "dualTarget": total_dual_additions(algebra, advanced, total),
        },
        "domainDistribution": domain_rows,
        "families": {domain: grouped_rows(rows, domain) for domain in DOMAINS},
        "phaseA": phase_allocation(PHASE_A_ADDITIONS),
        "phaseB": phase_allocation(PHASE_B_ADDITIONS),
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ARTIFACT_DIR.mkdir(exist_ok=True)
    write_markdown(report)
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "summary": report["summary"]}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
