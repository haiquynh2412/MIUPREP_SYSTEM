"""Shared SAT Studio math-answer verification helpers.

The verifier is intentionally conservative: it confirms clear numeric
equivalence and flags clear contradictions, but returns warnings when a
question needs human review instead of guessing.
"""

from __future__ import annotations

import ast
import math
import operator
import re
from fractions import Fraction
from typing import Any


TOLERANCE = 5e-4
GRID_IN_TYPES = {"student_produced_response", "grid_in", "numeric"}
ANSWER_TOKEN_STOPWORDS = {
    "that",
    "this",
    "with",
    "from",
    "into",
    "because",
    "which",
    "choice",
    "answer",
    "correct",
    "sentence",
    "passage",
    "text",
    "would",
    "could",
    "most",
    "best",
    "only",
}

_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def explanation_text(explanation: Any) -> str:
    if isinstance(explanation, dict):
        return str(explanation.get("correct") or "")
    if isinstance(explanation, list):
        return " ".join(str(item) for item in explanation)
    return str(explanation or "")


def all_explanation_text(explanation: Any) -> str:
    if isinstance(explanation, dict):
        parts = [str(explanation.get("correct") or "")]
        distractors = explanation.get("distractors")
        if isinstance(distractors, dict):
            parts.extend(str(value) for value in distractors.values())
        return " ".join(parts)
    return explanation_text(explanation)


def is_grid_in(question: dict[str, Any]) -> bool:
    return str(question.get("questionType") or "").lower() in GRID_IN_TYPES


def _eval_ast(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return _eval_ast(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_eval_ast(node.left), _eval_ast(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_eval_ast(node.operand))
    raise ValueError("unsupported expression")


def safe_eval_expression(expr: str) -> float | None:
    raw = str(expr)
    if "," in raw and not re.fullmatch(r"\s*[\-\u2212]?\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*", raw):
        return None
    cleaned = normalize_math_expression(expr)
    if not cleaned or not re.search(r"\d", cleaned):
        return None
    if not re.fullmatch(r"[0-9.\-+*/() ]+", cleaned):
        return None
    try:
        tree = ast.parse(cleaned, mode="eval")
        value = _eval_ast(tree)
    except Exception:
        return None
    if not isinstance(value, (int, float)):
        return None
    if not math.isfinite(value):
        return None
    return float(value)


def normalize_math_expression(expr: str) -> str:
    text = str(expr)
    text = text.replace("$", "").replace(",", "").replace("\u2212", "-")
    text = text.replace("\\(", "").replace("\\)", "")
    text = re.sub(r"\\(?:left|right)", "", text)
    text = re.sub(r"<sup>\s*([+-]?\d+)\s*</sup>", r"^\1", text, flags=re.I)
    text = text.replace("\u00b2", "^2").replace("\u00b3", "^3")
    text = text.replace("\\times", "*").replace("\\cdot", "*")
    text = text.replace("\u00d7", "*").replace("\u00f7", "/")
    while True:
        converted = re.sub(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}", r"(\1)/(\2)", text)
        if converted == text:
            break
        text = converted
    text = re.sub(r"\\sqrt\s*\{([^{}]+)\}", r"(\1)**0.5", text)
    text = text.replace("\\pi", "pi")
    text = re.sub(r"(pi|\u03c0)\s*(?=\()", r"\1*", text, flags=re.I)
    text = re.sub(r"(?<=\d)\s*(?=pi|\u03c0)", "*", text, flags=re.I)
    text = re.sub(r"(?<=\))\s*(?=pi|\u03c0)", "*", text, flags=re.I)
    text = re.sub(r"(?<=\d)\s*(?=\()", "*", text)
    text = re.sub(r"(?<=\))\s*(?=\d)", "*", text)
    text = text.replace("^", "**")
    text = re.sub(r"(?<=\d)\s*[xX]\s*(?=\d)", "*", text)
    text = re.sub(r"pi|\u03c0", str(math.pi), text, flags=re.I)
    text = re.sub(r"(?<=\d)\s*(?=\()", "*", text)
    text = re.sub(r"(?<=\d)\s+(?=\d)", "", text)
    return text.strip().rstrip(".")


def parse_numeric_value(value: Any) -> float | None:
    text = str(value or "").strip()
    if not text:
        return None
    if re.fullmatch(r"\(?\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)?", text):
        return None
    range_match = re.fullmatch(r"(\d{1,3})\s*[-\u2013]\s*(\d{1,3})", text)
    if range_match and int(range_match.group(1)) < int(range_match.group(2)):
        return None
    text = text.replace("$", "").replace(",", "").replace("\u2212", "-")
    text = re.sub(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}", r"(\1)/(\2)", text)
    text = text.replace("\\pi", "pi")
    if re.search(r"(?i)(?<=\d)x|x(?=\s*[+\-])|(?<=[+\-])x|^x\b", text):
        return None
    if re.search(r"\d\s+\d", text) and not re.search(r"[xX*/+\-]|pi|\u03c0|%|\u00b0", text, re.I):
        return None
    pi_unit_match = re.fullmatch(
        r"\s*(-?\d+(?:\.\d+)?(?:\s*/\s*-?\d+(?:\.\d+)?)?)\s*(?:pi|\u03c0)(?:\s*[a-zA-Z0-9^\u00b2\u00b3/%\u00b0]+)?\s*",
        text,
        re.I,
    )
    if pi_unit_match:
        try:
            return float(Fraction(pi_unit_match.group(1).replace(" ", ""))) * math.pi
        except Exception:
            return None
    unit_match = re.fullmatch(
        r"\s*(-?\d+(?:\.\d+)?(?:\s*/\s*-?\d+(?:\.\d+)?)?)\s*(?:%|\u00b0|degrees?|feet|foot|inches?|inch|cm(?:\^?[23]|\u00b2|\u00b3)?|mm|m|meters?|dollars?|cents?|increase|decrease|units?|hours?|minutes?|seconds?)(?:\s+(?:increase|decrease))?\s*",
        text,
        re.I,
    )
    if unit_match:
        try:
            return float(Fraction(unit_match.group(1).replace(" ", "")))
        except Exception:
            return None
    if re.search(r"pi|\u03c0", text, flags=re.I) and re.search(r"[+\-*/()^]", text):
        expression_value = safe_eval_expression(text)
        if expression_value is not None:
            return expression_value
    pi_factor = 1.0
    if re.search(r"pi|\u03c0", text, flags=re.I):
        pi_factor = math.pi
        text = re.sub(r"pi|\u03c0", "", text, flags=re.I).strip()
        if text in {"", "+", "-"}:
            text = f"{text}1" if text in {"+", "-"} else "1"
    if re.fullmatch(r"-?\d+(?:\.\d+)?\s*/\s*-?\d+(?:\.\d+)?", text):
        try:
            return float(Fraction(text.replace(" ", ""))) * pi_factor
        except Exception:
            return None
    if re.fullmatch(r"-?\d+(?:\.\d+)?", text):
        try:
            return float(text) * pi_factor
        except ValueError:
            return None
    return safe_eval_expression(text)


def normalize_answer_text(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or "").strip().lower().replace("$", "").replace(",", "").replace("\u2212", "-"))


def values_equivalent(a: Any, b: Any, tolerance: float = TOLERANCE) -> bool:
    if normalize_answer_text(a) == normalize_answer_text(b):
        return True
    av = parse_numeric_value(a)
    bv = parse_numeric_value(b)
    if av is None or bv is None:
        return False
    return abs(av - bv) <= tolerance


def equivalent_to_any(value: Any, candidates: list[Any]) -> bool:
    return any(values_equivalent(value, candidate) for candidate in candidates)


def correct_answer_values(question: dict[str, Any]) -> list[str]:
    if is_grid_in(question):
        values = [question.get("correctAnswer")]
        values.extend(question.get("acceptableAnswers") or [])
        return [str(value) for value in values if str(value or "").strip()]
    choices = question.get("choices") or {}
    correct = question.get("correctAnswer")
    values = [correct]
    if isinstance(choices, dict) and correct in choices:
        values.append(choices.get(correct))
    return [str(value) for value in values if str(value or "").strip()]


def answer_letter_mentioned(text: str, letter: str) -> bool:
    escaped = re.escape(str(letter).upper())
    patterns = [
        rf"\bchoice\s+{escaped}\b",
        rf"\banswer\s+{escaped}\b",
        rf"\boption\s+{escaped}\b",
        rf"\({escaped}\)",
        rf"\b{escaped}\)",
    ]
    return any(re.search(pattern, str(text), re.I) for pattern in patterns)


def significant_answer_tokens(value: Any) -> set[str]:
    tokens = re.findall(r"[a-z0-9]+", str(value or "").lower())
    return {token for token in tokens if len(token) >= 4 and token not in ANSWER_TOKEN_STOPWORDS}


def answer_text_mentioned(text: str, answer: Any) -> bool:
    normalized_answer = normalize_answer_text(answer)
    normalized_text = normalize_answer_text(text)
    if normalized_answer and normalized_answer in normalized_text:
        return True
    tokens = significant_answer_tokens(answer)
    if not tokens:
        return False
    text_tokens = significant_answer_tokens(text)
    found = len(tokens & text_tokens)
    needed = min(3, max(1, math.ceil(len(tokens) * 0.55)))
    return found >= needed


def explanation_mentions_correct_answer(question: dict[str, Any]) -> bool:
    raw_text = explanation_text(question.get("explanation"))
    text = normalize_answer_text(raw_text)
    if not text:
        return False
    for answer in correct_answer_values(question):
        normalized = normalize_answer_text(answer)
        if normalized in {"a", "b", "c", "d"}:
            if answer_letter_mentioned(raw_text, normalized):
                return True
            continue
        if answer_text_mentioned(raw_text, answer):
            return True
        value = parse_numeric_value(answer)
        if value is not None:
            for token in extract_numeric_tokens(explanation_text(question.get("explanation"))):
                if values_equivalent(token, answer):
                    return True
    return False


def extract_numeric_tokens(text: str) -> list[str]:
    return re.findall(r"-?\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*/\s*-?\d+(?:\.\d+)?)?(?:\s*(?:\\?pi|\u03c0))?", str(text), re.I)


def extract_final_equals_value(text: str) -> str | None:
    explicit = re.findall(r"Final answer\s*=\s*([^\n]+?)(?=\.(?:\s|$)|$)", str(text), re.I)
    if explicit:
        return explicit[-1].strip()
    matches = re.findall(
        r"=\s*([\-\u2212]?\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*/\s*[\-\u2212]?\d+(?:\.\d+)?)?(?:\s*(?:\\?pi|\u03c0))?)",
        str(text),
        re.I,
    )
    return matches[-1].strip() if matches else None


def has_ambiguous_unparenthesized_denominator(expr: str) -> bool:
    # In prose explanations, "\pi(2^2) / \pi(10^2)" normally means
    # (pi * 2^2) / (pi * 10^2). Python would read the normalized form
    # left-to-right as ((pi * 2^2) / pi) * 10^2, so skip these pairs.
    return bool(re.search(r"/\s*(?:\\?pi|\u03c0|\d+(?:\.\d+)?)\s*(?:\\?\(|\()", str(expr), re.I))


def equation_mismatches(text: str) -> list[dict[str, Any]]:
    mismatches: list[dict[str, Any]] = []
    for sentence in re.split(r"[\n;]|(?<!\d)\.(?!\d)", str(text)):
        if "=" not in sentence:
            continue
        parts = [part.strip() for part in sentence.split("=") if part.strip()]
        if len(parts) < 2:
            continue
        for left, right in zip(parts, parts[1:]):
            if has_ambiguous_unparenthesized_denominator(left) or has_ambiguous_unparenthesized_denominator(right):
                continue
            left_value = safe_eval_expression(left)
            right_value = safe_eval_expression(right)
            if left_value is None or right_value is None:
                continue
            if abs(left_value - right_value) > TOLERANCE:
                mismatches.append(
                    {
                        "left": left,
                        "right": right,
                        "leftValue": round(left_value, 6),
                        "rightValue": round(right_value, 6),
                    }
                )
    return mismatches


def verify_acceptable_answers(question: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    if not is_grid_in(question):
        return issues
    correct = question.get("correctAnswer")
    acceptable = [str(value) for value in (question.get("acceptableAnswers") or []) if str(value or "").strip()]
    if not str(correct or "").strip():
        issues.append("grid_in_missing_correct_answer")
        return issues
    if not acceptable:
        issues.append("grid_in_missing_acceptable_answers")
        return issues
    if not equivalent_to_any(correct, acceptable):
        issues.append("grid_in_correct_answer_not_in_acceptable_answers")
    for value in acceptable:
        if not values_equivalent(value, correct):
            issues.append(f"grid_in_non_equivalent_acceptable_answer:{value}")
    return issues


def verify_math_answer(question: dict[str, Any]) -> dict[str, Any]:
    if question.get("section") != "Math":
        return {"status": "skipped", "issues": [], "warnings": [], "details": {}}

    issues: list[str] = []
    warnings: list[str] = []
    details: dict[str, Any] = {}
    explanation = explanation_text(question.get("explanation"))
    answer_values = correct_answer_values(question)
    mentions_answer = explanation_mentions_correct_answer(question)
    has_numeric_answer = any(parse_numeric_value(value) is not None for value in answer_values)

    expected = question.get("expectedAnswer")
    if expected not in (None, "") and answer_values and not equivalent_to_any(expected, answer_values):
        issues.append("expected_answer_mismatch")
        details["expectedAnswer"] = str(expected)

    issues.extend(verify_acceptable_answers(question))

    final_value = extract_final_equals_value(explanation)
    if final_value:
        details["finalEqualsValue"] = final_value
        if has_numeric_answer and answer_values and not equivalent_to_any(final_value, answer_values):
            if mentions_answer:
                warnings.append("final_equals_value_is_intermediate")
            else:
                issues.append("explanation_final_value_mismatch")
    elif answer_values and has_numeric_answer:
        warnings.append("no_final_equals_value_found")

    mismatches = equation_mismatches(explanation)
    if mismatches:
        issues.append("explanation_equation_mismatch")
        details["equationMismatches"] = mismatches[:3]

    if not mentions_answer:
        warnings.append("explanation_does_not_mention_correct_answer")

    status = "failed" if issues else "passed"
    if warnings and not issues:
        status = "warning"
    return {"status": status, "issues": issues, "warnings": warnings, "details": details}
