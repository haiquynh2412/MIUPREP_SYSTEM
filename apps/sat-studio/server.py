from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
import os
import urllib.parse
import urllib.error
import urllib.request

from sat_public_backend import PublicBackendError, SatPublicBackend


PORT = 8765
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
OPEN_SAT_API = "https://pinesat.com/api/questions"
LOCAL_OPEN_SAT_FILE = os.path.join(ROOT_DIR, "data", "opensat-pinesat.json")
PUBLIC_BACKEND_DB = os.environ.get("SAT_STUDIO_PUBLIC_DB", os.path.join(ROOT_DIR, "data", "sat_studio_public.sqlite3"))
PUBLIC_BACKEND = SatPublicBackend(PUBLIC_BACKEND_DB)
ALLOWED_ORIGINS = {
    "http://127.0.0.1:8765",
    "http://localhost:8765",
}


class SatStudioHandler(SimpleHTTPRequestHandler):
    server_version = "SATStudioLocal/1.1"

    def end_headers(self):
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Filename, Authorization, X-CSRF-Token")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/public/"):
            self.route_public_backend("GET")
            return
        if self.path == "/api/opensat":
            self.proxy_opensat()
            return
        if self.path == "/api/health":
            self.write_json(
                {
                    "ok": True,
                    "service": "SAT Studio local server",
                    "root": ROOT_DIR,
                    "features": {
                        "staticFiles": True,
                        "pdfInspect": True,
                        "opensatProxy": True,
                        "publicBackend": True,
                    },
                }
            )
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/public/"):
            self.route_public_backend("POST")
            return
        if self.path == "/api/pdf-inspect":
            self.inspect_pdf()
            return
        self.send_error(404, "Not found")

    def route_public_backend(self, method):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        body = self.rfile.read(content_length) if content_length > 0 else b""
        headers = {key: value for key, value in self.headers.items()}
        try:
            status, payload = PUBLIC_BACKEND.handle_http(method, self.path, headers=headers, body=body)
            extra_headers = {}
            if isinstance(payload, dict):
                extra_headers = dict(payload.get("_headers") or {})
                payload = {key: value for key, value in payload.items() if key != "_headers"}
            self.write_json(payload, status=status, headers=extra_headers)
        except PublicBackendError as error:
            self.write_json({"error": error.message}, status=error.status)
        except Exception as error:
            self.write_json({"error": f"Public backend failed: {error}"}, status=500)

    def proxy_opensat(self):
        if os.path.exists(LOCAL_OPEN_SAT_FILE):
            with open(LOCAL_OPEN_SAT_FILE, "rb") as file:
                payload = file.read()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)
            return

        try:
            request = urllib.request.Request(
                OPEN_SAT_API,
                headers={"User-Agent": "SAT-Studio-Local-MVP/1.0"},
            )
            with urllib.request.urlopen(request, timeout=25) as response:
                payload = response.read()

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)
        except (urllib.error.URLError, TimeoutError) as error:
            body = json.dumps({"error": str(error)}).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(body)

    def inspect_pdf(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        if content_length <= 0:
            self.write_json({"error": "No PDF payload received."}, status=400)
            return
        if content_length > 30 * 1024 * 1024:
            self.write_json({"error": "PDF is larger than the 30 MB local inspection limit."}, status=413)
            return

        filename = safe_display_filename(urllib.parse.unquote(self.headers.get("X-Filename", "uploaded.pdf")))
        payload = self.rfile.read(content_length)

        try:
            from pypdf import PdfReader
        except ImportError:
            self.write_json(
                {
                    "error": "The local server does not have pypdf installed, so it cannot inspect PDFs yet.",
                    "filename": filename,
                },
                status=501,
            )
            return

        try:
            reader = PdfReader(BytesIO(payload))
            metadata = reader.metadata or {}
            title = clean_pdf_value(metadata.get("/Title")) or filename
            creator = clean_pdf_value(metadata.get("/Creator"))
            producer = clean_pdf_value(metadata.get("/Producer"))
            sample_text = []
            extractable_pages = 0

            for page in reader.pages[: min(6, len(reader.pages))]:
                text = page.extract_text() or ""
                if text.strip():
                    extractable_pages += 1
                    sample_text.append(text)

            joined_sample = " ".join(" ".join(text.split()) for text in sample_text)
            lower_signal = " ".join([filename, title, creator or "", producer or "", joined_sample]).lower()
            official_like = any(
                term in lower_signal
                for term in [
                    "college board",
                    "the sat practice test",
                    "sat practice test #",
                    "bluebook",
                    "sat suite",
                    "sat.org",
                ]
            )
            mirror_like = any(term in lower_signal for term in ["cracksat", "satpanda"])
            scanned_like = extractable_pages == 0
            risk = "High" if official_like or mirror_like else "Medium" if scanned_like else "Low"
            recommendation = "metadata_only" if official_like or mirror_like else "extract_then_review"

            self.write_json(
                {
                    "filename": filename,
                    "sizeBytes": content_length,
                    "pageCount": len(reader.pages),
                    "title": title,
                    "creator": creator,
                    "producer": producer,
                    "extractablePagesSampled": extractable_pages,
                    "sampleCharacters": len(joined_sample),
                    "officialLike": official_like,
                    "mirrorLike": mirror_like,
                    "scannedLike": scanned_like,
                    "risk": risk,
                    "recommendation": recommendation,
                    "warnings": build_pdf_warnings(official_like, mirror_like, scanned_like),
                }
            )
        except Exception as error:
            self.write_json({"error": f"PDF inspection failed: {error}", "filename": filename}, status=422)

    def write_json(self, payload, status=200, headers=None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        for key, value in (headers or {}).items():
            if isinstance(value, (list, tuple)):
                for child in value:
                    self.send_header(key, str(child))
            else:
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def translate_path(self, path):
        translated = os.path.abspath(super().translate_path(path))
        if os.path.commonpath([ROOT_DIR, translated]) != ROOT_DIR:
            return os.path.join(ROOT_DIR, "__not_found__")
        return translated


def clean_pdf_value(value):
    if value is None:
        return ""
    return str(value).replace("\x00", "").strip()


def safe_display_filename(value):
    cleaned = clean_pdf_value(value) or "uploaded.pdf"
    cleaned = os.path.basename(cleaned).strip()
    return cleaned or "uploaded.pdf"


def build_pdf_warnings(official_like, mirror_like, scanned_like):
    warnings = []
    if official_like:
        warnings.append("Looks like official SAT material. Store metadata only unless you have written permission.")
    if mirror_like:
        warnings.append("Looks like a mirrored/reposted source. Verify rights before importing any question text.")
    if scanned_like:
        warnings.append("No extractable text found in sampled pages. OCR is needed before conversion.")
    if not warnings:
        warnings.append("Text is extractable, but question boundaries, answer keys, and explanations still need review.")
    return warnings


if __name__ == "__main__":
    os.chdir(ROOT_DIR)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), SatStudioHandler)
    print(f"SAT Studio running at http://127.0.0.1:{PORT}/")
    server.serve_forever()
