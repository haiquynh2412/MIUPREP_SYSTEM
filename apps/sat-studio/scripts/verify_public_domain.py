import argparse
import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlparse


def fetch_json(url, timeout=10):
    request = urllib.request.Request(url, headers={"User-Agent": "SAT-Studio-Deploy-Verify/1.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.status, dict(response.headers), json.loads(response.read().decode("utf-8"))


def verify_public_domain(base_url, allow_http=False, timeout=10):
    parsed = urlparse(base_url)
    issues = []
    if parsed.scheme != "https" and not allow_http:
        issues.append("public domain must use HTTPS; pass --allow-http only for local verification")
    health_url = urljoin(base_url.rstrip("/") + "/", "api/public/health")
    status = 0
    headers = {}
    health = {}
    try:
        status, headers, health = fetch_json(health_url, timeout=timeout)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        issues.append(f"health fetch failed: {error}")
    if status and status != 200:
        issues.append(f"health returned HTTP {status}")
    features = health.get("features") or {}
    migration = health.get("migrationReadiness") or {}
    required_features = ["httpOnlyCookieAuth", "csrfProtection", "rbac", "contentPackageApi", "postgresqlUpgradeGuard"]
    missing = [feature for feature in required_features if not features.get(feature)]
    if missing:
        issues.append(f"health missing required features: {', '.join(missing)}")
    if not migration.get("ok"):
        issues.append(f"migration readiness is not ok: {migration.get('blockers')}")
    return {
        "ok": not issues,
        "baseUrl": base_url,
        "healthUrl": health_url,
        "status": status,
        "server": headers.get("server", ""),
        "features": features,
        "migrationReadiness": migration,
        "issues": issues,
    }


def main():
    parser = argparse.ArgumentParser(description="Verify a deployed SAT Studio public domain.")
    parser.add_argument("--base-url", required=True, help="Public base URL, for example https://sat.example.com/")
    parser.add_argument("--allow-http", action="store_true", help="Allow http:// for local verification only.")
    parser.add_argument("--timeout", type=int, default=10)
    args = parser.parse_args()
    report = verify_public_domain(args.base_url, allow_http=args.allow_http, timeout=args.timeout)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
