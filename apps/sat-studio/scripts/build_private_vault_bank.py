import json
import re
import sys
import zipfile
from collections import Counter
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "data" / "SAT-20260516T141004Z-3-001.zip"
OUT = ROOT / "data" / "private-vault-archive-bank.json"
REPORT_OUT = ROOT / "data" / "private-vault-import-report.json"
REGISTRY = ROOT / "data" / "private-source-registry-sat-archive.json"

SOURCE_NAME = "Private Family Vault"
LICENSE_NOTE = (
    "Private family study copy from a locally supplied archive. "
    "Do not publish, share, export to public accounts, or include in a public release."
)


PRINCETON_TESTS = [
    {
        "label": "Princeton Review Practice Test 5",
        "test": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Online_Practice_Test_5.pdf",
        "answers": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Online_Practice_Test_5_Answers.pdf",
    },
    {
        "label": "Princeton Review Practice Test 6",
        "test": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_6.pdf",
        "answers": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_6_Answers.pdf",
    },
    {
        "label": "Princeton Review Practice Test 7",
        "test": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_7.pdf",
        "answers": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_7_Answers.pdf",
    },
    {
        "label": "Princeton Review Practice Test 8",
        "test": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_8.pdf",
        "answers": "SAT/PRACTICE TESTS/Princeton review /Crack the new Sat online practice/Cracking_SAT_2020_Prem_Online_Practice_Test_8_Answers.pdf",
    },
]

COLLEGEBOARD_TESTS = [
    {
        "label": "College Board Practice Test 9",
        "test": "SAT/PRACTICE TESTS/CollegeBoard/Tests 9 + 10/Test 9/pdf_sat-practice-test-9.pdf",
        "answers": "SAT/PRACTICE TESTS/CollegeBoard/Tests 9 + 10/Test 9/Answers test 9.pdf",
    },
    {
        "label": "College Board Practice Test 10",
        "test": "SAT/PRACTICE TESTS/CollegeBoard/Tests 9 + 10/Test 10/pdf_sat-practice-test-10.pdf",
        "answers": "SAT/PRACTICE TESTS/CollegeBoard/Tests 9 + 10/Test 10/Answer test 10.pdf",
    },
]


SECTION_META = {
    3: ("Math", "Math - No Calculator", "Mixed SAT math no-calculator", 20),
    4: ("Math", "Math - Calculator", "Mixed SAT math calculator", 38),
}


def slugify(value):
    text = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return text or "vault"


def read_pdf_text_from_zip(zip_file, path):
    payload = zip_file.read(path)
    reader = PdfReader(BytesIO(payload))
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages), len(reader.pages)


def read_pdf_pages_from_zip(zip_file, path):
    payload = zip_file.read(path)
    reader = PdfReader(BytesIO(payload))
    return [page.extract_text() or "" for page in reader.pages], len(reader.pages)


def collect_section_lines(text, wanted_section):
    lines = [line.strip() for line in text.splitlines()]
    collected = []
    current = None
    header_re = re.compile(r"^([1-4])\s+\1$")
    for line in lines:
        match = header_re.match(line)
        if match:
            current = int(match.group(1))
            continue
        if current == wanted_section:
            collected.append(line)
    return collected


def is_question_line(line, max_question):
    if not re.fullmatch(r"\d{1,2}", line):
        return False
    value = int(line)
    return 1 <= value <= max_question


def parse_choice_block(lines):
    option_positions = {}
    for index, line in enumerate(lines):
        match = re.match(r"^([A-D])\)\s*(.*)$", line)
        if match and match.group(1) not in option_positions:
            option_positions[match.group(1)] = index
    if set(option_positions) != {"A", "B", "C", "D"}:
        return None

    positions = [option_positions[key] for key in "ABCD"]
    if positions != sorted(positions):
        return None

    prompt_lines = lines[: positions[0]]
    choices = {}
    for idx, key in enumerate("ABCD"):
        start = option_positions[key]
        end = positions[idx + 1] if idx < 3 else len(lines)
        first = re.sub(r"^[A-D]\)\s*", "", lines[start]).strip()
        rest = [line for line in lines[start + 1 : end] if line]
        choices[key] = clean_text(" ".join([first, *rest]))

    prompt = clean_text(" ".join(line for line in prompt_lines if line))
    if len(prompt) < 20 or any(not choices[key] for key in "ABCD"):
        return None
    return prompt, choices


def parse_section_questions(text, section_number):
    section, domain, skill, max_question = SECTION_META[section_number]
    lines = collect_section_lines(text, section_number)
    question_starts = []
    seen = set()
    for index, line in enumerate(lines):
        if is_question_line(line, max_question):
            number = int(line)
            if number not in seen:
                question_starts.append((index, number))
                seen.add(number)

    questions = []
    for idx, (start, number) in enumerate(question_starts):
        end = question_starts[idx + 1][0] if idx + 1 < len(question_starts) else len(lines)
        block = lines[start + 1 : end]
        parsed = parse_choice_block(block)
        if not parsed:
            continue
        prompt, choices = parsed
        questions.append(
            {
                "questionNumber": number,
                "sectionNumber": section_number,
                "section": section,
                "domain": domain,
                "skill": skill,
                "difficulty": infer_difficulty(section_number, number),
                "prompt": prompt,
                "choices": choices,
            }
        )
    return questions


def has_no_calculator_header(page_text):
    return bool(re.search(r"Math Test\W+No Calculator", page_text, re.IGNORECASE))


def has_calculator_header(page_text):
    return bool(re.search(r"Math Test\W+Calculator", page_text, re.IGNORECASE)) and not has_no_calculator_header(page_text)


def clean_pdf_lines(page_text):
    lines = []
    for raw_line in page_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if re.search(
            r"Unauthorized copying|CONTINUE|Practice Tests|Practice Test|Question-and-Answer|"
            r"GO ON TO THE NEXT PAGE|Scoring Your|PART\s+\d+",
            line,
            re.IGNORECASE,
        ):
            continue
        lines.append(line)
    return lines


def collect_college_board_math_lines(pages, section_number):
    start = None
    for index, page_text in enumerate(pages):
        if section_number == 3 and has_no_calculator_header(page_text):
            start = index
            break
        if section_number == 4 and has_calculator_header(page_text):
            start = index
            break
    if start is None:
        return []

    if section_number == 3:
        end = next((idx for idx in range(start + 1, len(pages)) if has_calculator_header(pages[idx])), len(pages))
        grid_marker = "For questions 16"
    else:
        end = next(
            (
                idx + 1
                for idx in range(start + 1, len(pages))
                if re.search(r"IF YOU FINISH BEFORE TIME IS CALLED.*STOP", pages[idx], re.IGNORECASE | re.DOTALL)
            ),
            len(pages),
        )
        grid_marker = "For questions 31"

    lines = []
    for page_text in pages[start + 1 : end]:
        lines.extend(clean_pdf_lines(page_text))

    for index, line in enumerate(lines):
        if grid_marker in line:
            return lines[:index]
    return lines


def find_ordered_question_starts(lines, section_number):
    max_multiple_choice = 15 if section_number == 3 else 30
    starts = []
    expected = 1
    option_started = False
    d_seen = True

    for index, line in enumerate(lines):
        if re.match(r"^[A-D]\)", line):
            option_started = True
            if line.startswith("D)"):
                d_seen = True
            continue

        match = re.fullmatch(r"(\d{1,2})\.?", line)
        if not match:
            continue

        number = int(match.group(1))
        if number == expected and number <= max_multiple_choice and (not option_started or d_seen):
            starts.append((index, number))
            expected += 1
            option_started = False
            d_seen = False

    return starts


def parse_college_board_math_questions(pages, section_number):
    section, domain, skill, _ = SECTION_META[section_number]
    lines = collect_college_board_math_lines(pages, section_number)
    question_starts = find_ordered_question_starts(lines, section_number)

    questions = []
    for idx, (start, number) in enumerate(question_starts):
        end = question_starts[idx + 1][0] if idx + 1 < len(question_starts) else len(lines)
        parsed = parse_choice_block(lines[start + 1 : end])
        if not parsed:
            continue
        prompt, choices = parsed
        questions.append(
            {
                "questionNumber": number,
                "sectionNumber": section_number,
                "section": section,
                "domain": domain,
                "skill": skill,
                "difficulty": infer_difficulty(section_number, number),
                "prompt": prompt,
                "choices": choices,
            }
        )
    return questions


def parse_answer_sections(answer_text):
    answer_key_page = ""
    pages = answer_text.split("\f")
    for page in pages:
        if "ANSWER KEY" in page.upper() and re.search(r"\b1\.\s*[A-D]\b", page):
            answer_key_page = page
            break
    if not answer_key_page:
        answer_key_page = answer_text[:10000]

    matches = [
        (int(match.group(1)), match.group(2))
        for match in re.finditer(r"\b(\d{1,2})\.\s*([A-D])\b", answer_key_page)
    ]
    groups = []
    current = []
    previous = 0
    for number, answer in matches:
        if current and number <= previous:
            groups.append(current)
            current = []
        current.append((number, answer))
        previous = number
    if current:
        groups.append(current)

    answer_sections = {}
    for index, group in enumerate(groups[:4], start=1):
        answer_sections[index] = {number: answer for number, answer in group}
    return answer_sections


def parse_college_board_answer_explanations(answer_text):
    section_matches = list(re.finditer(r"Section\s+([1-4])\s*:", answer_text, re.IGNORECASE))
    answer_sections = {}

    for index, match in enumerate(section_matches):
        section_number = int(match.group(1))
        start = match.end()
        end = section_matches[index + 1].start() if index + 1 < len(section_matches) else len(answer_text)
        section_text = answer_text[start:end]
        answers = {}
        for answer_match in re.finditer(
            r"QUESTION\s+(\d{1,2})\s+Choice\s+([A-D])\s+is\s+"
            r"(?:the\s+)?(?:best\s+answer|correct\s+answer|correct)",
            section_text,
            re.IGNORECASE,
        ):
            answers[int(answer_match.group(1))] = answer_match.group(2).upper()
        answer_sections[section_number] = answers

    return answer_sections


def clean_text(value):
    text = re.sub(r"\s+", " ", value).strip()
    text = text.replace(" ,", ",").replace(" .", ".")
    replacements = {
        "â‰¥": ">=",
        "â‰¤": "<=",
        "â€“": "-",
        "â€”": "-",
        "â€™": "'",
        "â€œ": '"',
        "â€": '"',
        "Â°": " degrees",
        "Ï€": "pi",
        "Î¸": "theta",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text


def infer_difficulty(section_number, question_number):
    if section_number == 3:
        if question_number <= 5:
            return "Easy"
        if question_number <= 12:
            return "Medium"
        return "Hard"
    if question_number <= 10:
        return "Easy"
    if question_number <= 23:
        return "Medium"
    return "Hard"


def make_vault_question(question_id, parsed_question, item, correct, source_question_index=None):
    return {
        "id": question_id,
        "section": parsed_question["section"],
        "domain": parsed_question["domain"],
        "skill": parsed_question["skill"],
        "difficulty": parsed_question["difficulty"],
        "sourceType": "private_vault",
        "sourceName": SOURCE_NAME,
        "sourceReference": item["test"],
        "sourceQuestionIndex": source_question_index or parsed_question["questionNumber"],
        "licenseNote": LICENSE_NOTE,
        "visibility": "private_family",
        "neverPublic": True,
        "reviewStatus": "needs_review",
        "publicationStatus": "private_family_only",
        "prompt": parsed_question["prompt"],
        "choices": parsed_question["choices"],
        "correctAnswer": correct,
        "explanation": (
            f"Answer key marks choice {correct}. This private-vault item was extracted for family study; "
            "admin should verify the answer and explanation against the source before marking reviewed."
        ),
        "contentAudit": {
            "version": "private-vault-extract-v2",
            "verdict": "needs_review",
            "checks": [
                "private_family_visibility",
                "public_export_blocked",
                "answer_key_attached",
                "admin_verification_required",
            ],
        },
    }


def summarize_source_counts(questions, source_reference):
    return dict(Counter(q["domain"] for q in questions if q["sourceReference"] == source_reference))


def skip_reason_for_document(document):
    role = document.get("role")
    sample_characters = document.get("sampleCharacters") or 0
    read_error = document.get("readError") or ""

    if role == "answer_key_or_scoring":
        return "Answer/scoring file only; paired where a matching parseable test exists."
    if role in {"guide", "reference"}:
        return "Reference/guide material, not a complete question bank with A-D answers."
    if read_error:
        return f"PDF text extraction failed: {read_error}"
    if sample_characters < 500:
        return "No reliable extractable text or likely scanned/encoded PDF."
    return "No reliable A-D question parser plus answer key pair was available."


def build_bank():
    questions = []
    report = []
    with zipfile.ZipFile(ARCHIVE) as zip_file:
        names = set(zip_file.namelist())
        for test_index, item in enumerate(PRINCETON_TESTS, start=1):
            if item["test"] not in names or item["answers"] not in names:
                report.append({**item, "status": "missing_file", "imported": 0})
                continue

            try:
                test_text, page_count = read_pdf_text_from_zip(zip_file, item["test"])
                answer_text, _ = read_pdf_text_from_zip(zip_file, item["answers"])
                answer_sections = parse_answer_sections(answer_text)
            except Exception as error:
                report.append({**item, "status": "read_failed", "error": str(error), "imported": 0})
                continue

            imported_for_source = 0
            for section_number in (3, 4):
                parsed = parse_section_questions(test_text, section_number)
                answers = answer_sections.get(section_number, {})
                for parsed_question in parsed:
                    qn = parsed_question["questionNumber"]
                    correct = answers.get(qn)
                    if correct not in {"A", "B", "C", "D"}:
                        continue
                    question_id = f"vault-princeton-{test_index}-s{section_number}-q{qn:02d}"
                    questions.append(make_vault_question(question_id, parsed_question, item, correct, qn))
                    imported_for_source += 1

            report.append(
                {
                    **item,
                    "status": "parsed",
                    "pageCount": page_count,
                    "imported": imported_for_source,
                    "sectionCounts": summarize_source_counts(questions, item["test"]),
                    "parser": "princeton_line_parser",
                }
            )

        for test_index, item in enumerate(COLLEGEBOARD_TESTS, start=9):
            if item["test"] not in names or item["answers"] not in names:
                report.append({**item, "status": "missing_file", "imported": 0, "parser": "college_board_math_parser"})
                continue

            try:
                test_pages, page_count = read_pdf_pages_from_zip(zip_file, item["test"])
                answer_text, _ = read_pdf_text_from_zip(zip_file, item["answers"])
                answer_sections = parse_college_board_answer_explanations(answer_text)
            except Exception as error:
                report.append(
                    {
                        **item,
                        "status": "read_failed",
                        "error": str(error),
                        "imported": 0,
                        "parser": "college_board_math_parser",
                    }
                )
                continue

            imported_for_source = 0
            for section_number in (3, 4):
                parsed = parse_college_board_math_questions(test_pages, section_number)
                answers = answer_sections.get(section_number, {})
                for parsed_question in parsed:
                    qn = parsed_question["questionNumber"]
                    correct = answers.get(qn)
                    if correct not in {"A", "B", "C", "D"}:
                        continue
                    question_id = f"vault-college-board-{test_index}-s{section_number}-q{qn:02d}"
                    questions.append(make_vault_question(question_id, parsed_question, item, correct, qn))
                    imported_for_source += 1

            report.append(
                {
                    **item,
                    "status": "parsed",
                    "pageCount": page_count,
                    "imported": imported_for_source,
                    "sectionCounts": summarize_source_counts(questions, item["test"]),
                    "parser": "college_board_math_parser",
                    "note": "Imported Math multiple-choice only; grid-in items are skipped because the app bank expects A-D choices.",
                }
            )

        imported_paths = {row["test"] for row in report if row.get("imported", 0) > 0}
        answer_paths = {item["answers"] for item in [*PRINCETON_TESTS, *COLLEGEBOARD_TESTS]}
        if REGISTRY.exists():
            registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
            for document in registry.get("documents", []):
                path = document.get("path")
                if not path or path in imported_paths or path in answer_paths:
                    continue
                report.append(
                    {
                        "label": document.get("title") or Path(path).stem,
                        "test": path,
                        "answers": "",
                        "status": "skipped",
                        "imported": 0,
                        "role": document.get("role"),
                        "sourceType": document.get("sourceType"),
                        "risk": document.get("risk"),
                        "reason": skip_reason_for_document(document),
                    }
                )

    return questions, report


def main():
    if not ARCHIVE.exists():
        raise SystemExit(f"Archive not found: {ARCHIVE}")
    questions, report = build_bank()
    payload = {
        "summary": {
            "generatedAt": "2026-05-17",
            "sourceArchive": str(ARCHIVE),
            "questionCount": len(questions),
            "sourceCount": len([row for row in report if row.get("imported", 0) > 0]),
            "policy": [
                "Private family study only.",
                "Do not publish, share, or export these items to public accounts.",
                "Items are extracted from user-supplied local files and require admin verification.",
            ],
        },
        "questions": questions,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_OUT.write_text(
        json.dumps({"summary": payload["summary"], "sources": report}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"out": str(OUT), "report": str(REPORT_OUT), **payload["summary"]}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
