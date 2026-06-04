import json
import re
import zipfile
from collections import Counter
from io import BytesIO
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARCHIVE = ROOT / "data" / "SAT-20260516T141004Z-3-001.zip"
REGISTRY_OUT = ROOT / "data" / "private-source-registry-sat-archive.json"
SIGNALS_OUT = ROOT / "data" / "private-source-signals-from-archive.json"


DOMAIN_KEYWORDS = [
    ("Reading and Writing", "Standard English Conventions", "Boundaries", ["grammar", "writing", "sentence", "punctuation", "comma", "semicolon"]),
    ("Reading and Writing", "Information and Ideas", "Central Ideas and Details", ["reading", "passage", "evidence", "main idea", "inference"]),
    ("Reading and Writing", "Craft and Structure", "Words in Context", ["vocabulary", "word", "context"]),
    ("Reading and Writing", "Expression of Ideas", "Transitions", ["transition", "rhetorical", "expression"]),
    ("Math", "Algebra", "Linear equations in one variable", ["algebra", "linear", "equation", "inequality"]),
    ("Math", "Advanced Math", "Quadratic equations", ["quadratic", "advanced math", "polynomial", "function"]),
    ("Math", "Problem-Solving and Data Analysis", "Data interpretation", ["data", "statistics", "probability", "percent", "rate"]),
    ("Math", "Geometry and Trigonometry", "Geometry mixed", ["geometry", "triangle", "circle", "trigonometry", "volume", "area"]),
]


def classify_source(name):
    lower = name.lower()
    if "collegeboard" in lower or "/real tests/" in lower or "qas" in lower or "student guide" in lower:
        return {
            "sourceType": "college_board",
            "risk": "High",
            "recommendation": "metadata_only",
            "publicUse": "Do not copy question text. Link/log only unless written permission is granted.",
        }
    if "khan" in lower:
        return {
            "sourceType": "khan_college_board",
            "risk": "High",
            "recommendation": "link_only_or_source_signal",
            "publicUse": "Prefer link-out to Khan. Do not copy lesson/question text into the public bank.",
        }
    if any(term in lower for term in ["princeton", "kaplan", "erica meltzer", "panda", "pwn", "ivy global", "tutorverse"]):
        return {
            "sourceType": "commercial_prep",
            "risk": "High",
            "recommendation": "private_reference_or_source_signal",
            "publicUse": "Use only as private reference/source signal. Do not publish copied wording.",
        }
    if "ies" in lower:
        return {
            "sourceType": "third_party_prep",
            "risk": "High",
            "recommendation": "private_reference_or_source_signal",
            "publicUse": "Treat as third-party prep material until license is verified.",
        }
    return {
        "sourceType": "unknown_archive_doc",
        "risk": "Medium",
        "recommendation": "inspect_then_review",
        "publicUse": "Manual license review required before reuse.",
    }


def infer_scope(name, sample_text):
    lower = f"{name} {sample_text}".lower()
    for section, domain, skill, needles in DOMAIN_KEYWORDS:
        if any(needle in lower for needle in needles):
            return section, domain, skill
    if "math" in lower:
        return "Math", "Algebra", "Math mixed"
    if "reading" in lower:
        return "Reading and Writing", "Information and Ideas", "Reading mixed"
    if "writing" in lower or "grammar" in lower:
        return "Reading and Writing", "Standard English Conventions", "Writing mixed"
    return "All", "All", "Full practice test"


def infer_doc_role(name):
    lower = name.lower()
    if any(term in lower for term in ["answer", "answers", "scoring", "đáp án"]):
        return "answer_key_or_scoring"
    if "student guide" in lower:
        return "guide"
    if any(term in lower for term in ["practice", "test", "qas", "real tests"]):
        return "practice_test"
    return "reference"


def safe_extract_pdf_meta(zip_file, info):
    result = {
        "pageCount": None,
        "extractablePagesSampled": 0,
        "sampleCharacters": 0,
        "title": "",
        "creator": "",
        "producer": "",
        "sampleTextForInference": "",
        "readError": "",
    }
    try:
        from pypdf import PdfReader
    except ImportError as error:
        result["readError"] = f"pypdf unavailable: {error}"
        return result

    try:
        payload = zip_file.read(info)
        reader = PdfReader(BytesIO(payload))
        result["pageCount"] = len(reader.pages)
        metadata = reader.metadata or {}
        result["title"] = clean_pdf_value(metadata.get("/Title"))
        result["creator"] = clean_pdf_value(metadata.get("/Creator"))
        result["producer"] = clean_pdf_value(metadata.get("/Producer"))
        samples = []
        for page in reader.pages[: min(4, len(reader.pages))]:
            text = page.extract_text() or ""
            text = " ".join(text.split())
            if text:
                result["extractablePagesSampled"] += 1
                samples.append(text[:2000])
        sample = " ".join(samples)
        result["sampleCharacters"] = len(sample)
        result["sampleTextForInference"] = sample[:2500]
    except Exception as error:
        result["readError"] = str(error)
    return result


def clean_pdf_value(value):
    if value is None:
        return ""
    text = str(value)
    return re.sub(r"\s+", " ", text).strip()


def build_signal(doc):
    section, domain, skill = infer_scope(doc["path"], doc.get("_sampleTextForInference", ""))
    return {
        "id": f"archive-signal-{slugify(Path(doc['path']).stem)}",
        "sourceKind": doc["sourceType"],
        "sourceReference": doc["path"],
        "section": section,
        "domain": domain,
        "skill": skill,
        "difficulty": "Medium",
        "mistakePattern": f"Use this document only to identify SAT {domain} patterns and common traps; do not copy wording.",
        "learningGoal": f"Generate original {skill} practice inspired by the skill signal, with unrelated scenarios and fresh wording.",
        "copyrightRisk": doc["risk"],
        "visibility": "admin_only",
        "protectedTextExcluded": True,
        "needsReview": True,
        "recommendedUse": doc["recommendation"],
    }


def slugify(value):
    text = value.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:70] or "source"


def main():
    archive_path = DEFAULT_ARCHIVE
    if not archive_path.exists():
        raise SystemExit(f"Archive not found: {archive_path}")

    docs = []
    with zipfile.ZipFile(archive_path) as zip_file:
        for info in zip_file.infolist():
            if info.is_dir():
                continue
            suffix = Path(info.filename).suffix.lower()
            classification = classify_source(info.filename)
            pdf_meta = safe_extract_pdf_meta(zip_file, info) if suffix == ".pdf" else {}
            sample_for_inference = pdf_meta.pop("sampleTextForInference", "")
            doc = {
                "path": info.filename,
                "fileType": suffix.lstrip(".") or "unknown",
                "sizeBytes": info.file_size,
                "sourceType": classification["sourceType"],
                "risk": classification["risk"],
                "recommendation": classification["recommendation"],
                "publicUse": classification["publicUse"],
                "role": infer_doc_role(info.filename),
                **pdf_meta,
            }
            doc["_sampleTextForInference"] = sample_for_inference
            docs.append(doc)

    signals = [build_signal(doc) for doc in docs if doc["fileType"] in {"pdf", "docx"}]
    registry_docs = [{k: v for k, v in doc.items() if not k.startswith("_")} for doc in docs]
    summary = {
        "archive": str(archive_path),
        "generatedAt": "2026-05-16",
        "totalFiles": len(docs),
        "fileTypes": dict(Counter(doc["fileType"] for doc in docs)),
        "sourceTypes": dict(Counter(doc["sourceType"] for doc in docs)),
        "riskCounts": dict(Counter(doc["risk"] for doc in docs)),
        "recommendations": dict(Counter(doc["recommendation"] for doc in docs)),
        "policy": [
            "No verbatim questions were imported from this archive.",
            "Official and commercial prep documents are high-risk for public reuse.",
            "Use the exported source signals to generate original questions, then admin review before public use.",
            "For private family study, keep any direct use local and hidden from public accounts.",
        ],
    }
    REGISTRY_OUT.write_text(json.dumps({"summary": summary, "documents": registry_docs}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    SIGNALS_OUT.write_text(json.dumps({"summary": summary, "signals": signals}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"registry": str(REGISTRY_OUT), "signals": str(SIGNALS_OUT), **summary}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
