import json
import os
import urllib.request
from datetime import datetime, timezone


SOURCES = [
    ("english", "https://pinesat.com/api/questions?section=english"),
    ("math", "https://pinesat.com/api/questions?section=math"),
]
DATA_DIR = os.path.join(os.getcwd(), "data")
DATA_FILE = os.path.join(DATA_DIR, "opensat-pinesat.json")
MANIFEST_FILE = os.path.join(DATA_DIR, "opensat-pinesat-manifest.json")


def fetch_json(url):
    request = urllib.request.Request(url, headers={"User-Agent": "SAT-Studio-Data-Sync/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    combined = []
    counts = {}

    for section, url in SOURCES:
      data = fetch_json(url)
      if not isinstance(data, list):
          raise SystemExit(f"Expected a JSON array from {url}")
      counts[section] = len(data)
      for item in data:
          item["_satStudioSourceSection"] = section
          item["_satStudioSourceUrl"] = url
          combined.append(item)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
        f.write("\n")

    manifest = {
        "sourceName": "OpenSAT / PineSAT",
        "sourceUrls": [url for _, url in SOURCES],
        "syncedAt": datetime.now(timezone.utc).isoformat(),
        "recordCount": len(combined),
        "counts": counts,
        "notes": [
            "Local snapshot for SAT Studio MVP.",
            "Imported questions should remain needs_review until checked.",
            "Do not treat this as official College Board content.",
        ],
    }
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
