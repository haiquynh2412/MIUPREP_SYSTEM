import argparse
import json
import os
import sys
import urllib.error
import urllib.request


DEFAULT_BASE_URL = "http://127.0.0.1:8765/api/public"


def normalize_base_url(value):
    return str(value or DEFAULT_BASE_URL).rstrip("/")


def endpoint_url(base_url, path):
    return f"{normalize_base_url(base_url)}/{str(path).lstrip('/')}"


def fetch_json(url, token="", timeout=10, opener=urllib.request.urlopen):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers)
    with opener(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8") or "{}")


def post_webhook(url, payload, timeout=10, opener=urllib.request.urlopen):
    if not url:
        return False
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with opener(request, timeout=timeout):
        return True


def evaluate_report(report, thresholds):
    issues = []
    health = report.get("health") or {}
    monitoring = report.get("monitoring") or {}
    counts = monitoring.get("counts") or {}
    database = monitoring.get("database") or {}

    if not health.get("ok"):
        issues.append("health_not_ok")
    if int(health.get("adminCount") or 0) < thresholds["min_admins"]:
        issues.append(f"admin_count_below_{thresholds['min_admins']}")
    if monitoring:
        if int(counts.get("openQuestionAudits") or 0) > thresholds["max_open_audits"]:
            issues.append(f"open_audits_above_{thresholds['max_open_audits']}")
        max_bytes = thresholds["max_db_mb"] * 1024 * 1024
        if int(database.get("sizeBytes") or 0) > max_bytes:
            issues.append(f"db_size_above_{thresholds['max_db_mb']}mb")

    report["ok"] = not issues
    report["issues"] = issues
    return report


def build_report(base_url, token="", timeout=10, thresholds=None, opener=urllib.request.urlopen):
    thresholds = thresholds or {"min_admins": 1, "max_open_audits": 100, "max_db_mb": 256}
    report = {
        "baseUrl": normalize_base_url(base_url),
        "health": fetch_json(endpoint_url(base_url, "/health"), timeout=timeout, opener=opener),
        "monitoring": None,
    }
    if token:
        report["monitoring"] = fetch_json(endpoint_url(base_url, "/monitoring"), token=token, timeout=timeout, opener=opener)
    return evaluate_report(report, thresholds)


def parse_args(argv):
    parser = argparse.ArgumentParser(description="Check SAT Studio public backend health for CI or scheduled monitoring.")
    parser.add_argument("--base-url", default=os.environ.get("SAT_PUBLIC_BACKEND_URL", DEFAULT_BASE_URL))
    parser.add_argument("--token", default=os.environ.get("SAT_PUBLIC_BACKEND_TOKEN", ""))
    parser.add_argument("--timeout", type=int, default=10)
    parser.add_argument("--min-admins", type=int, default=1)
    parser.add_argument("--max-open-audits", type=int, default=100)
    parser.add_argument("--max-db-mb", type=int, default=256)
    parser.add_argument("--webhook-url", default=os.environ.get("SAT_PUBLIC_HEALTH_WEBHOOK", ""))
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv or sys.argv[1:])
    thresholds = {
        "min_admins": args.min_admins,
        "max_open_audits": args.max_open_audits,
        "max_db_mb": args.max_db_mb,
    }
    try:
        report = build_report(args.base_url, token=args.token, timeout=args.timeout, thresholds=thresholds)
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as error:
        report = {
            "ok": False,
            "baseUrl": normalize_base_url(args.base_url),
            "issues": ["backend_unreachable"],
            "error": str(error),
        }

    if not report.get("ok") and args.webhook_url:
        try:
            post_webhook(args.webhook_url, report, timeout=args.timeout)
            report["webhookSent"] = True
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            report["webhookSent"] = False
            report["webhookError"] = str(error)

    print(json.dumps(report, indent=2, ensure_ascii=True))
    return 0 if report.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
