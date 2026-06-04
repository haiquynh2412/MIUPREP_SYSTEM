import argparse
import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from browser_smoke_test import CdpClient, find_free_port, get_page_tab, start_chrome, stop_chrome

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class QuietHandler(SimpleHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            return

    def log_message(self, format, *args):
        return


def start_static_server():
    port = find_free_port()
    previous = os.getcwd()
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, previous, f"http://127.0.0.1:{port}"


def wait_for(cdp, expression, timeout=30):
    return cdp.eval(
        f"""
        (async () => {{
          for (let i = 0; i < {int(timeout * 10)}; i++) {{
            const result = (() => {{ {expression} }})();
            if (result) return result;
            await new Promise(r => setTimeout(r, 100));
          }}
          return null;
        }})()
        """,
        timeout=timeout + 5,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="")
    args = parser.parse_args()

    server = None
    previous_cwd = None
    base_url = args.url.rstrip("/")
    if not base_url:
        server, previous_cwd, base_url = start_static_server()

    chrome_port = find_free_port()
    chrome = start_chrome(chrome_port)
    try:
        tab = get_page_tab(chrome_port)
        cdp = CdpClient(chrome_port)
        cdp.connect(tab["webSocketDebuggerUrl"])
        cdp.call("Runtime.enable")
        cdp.call("Page.enable")
        cdp.call("Page.navigate", {"url": f"{base_url}/parent.html"})
        cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")
        redirected = wait_for(
            cdp,
            """
            return location.href.includes('/dist/vite/vite-parent.html') ? true : false;
            """,
            timeout=5,
        )
        if not redirected:
            cdp.call("Page.navigate", {"url": f"{base_url}/dist/vite/vite-parent.html"})
            cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")

        ready = wait_for(
            cdp,
            """
            const text = document.body?.innerText || '';
            const lower = text.toLowerCase();
            return (text.includes('Bảng điều khiển phụ huynh') || text.includes('Parent Coach Dashboard')) && lower.includes('việc nên làm tiếp theo') ? true : false;
            """,
        )
        if not ready:
            debug = cdp.eval(
                """
                (() => ({
                  url: location.href,
                  readyState: document.readyState,
                  text: (document.body?.innerText || '').slice(0, 800),
                  html: document.documentElement.outerHTML.slice(0, 800)
                }))()
                """,
                timeout=10,
            )
            raise AssertionError({"message": "Vite parent app did not render the coach dashboard", **debug})

        snapshot = cdp.eval(
            """
            (() => {
              const text = document.body.innerText;
              const lower = text.toLowerCase();
              return {
                url: location.href,
                textSample: text.slice(0, 800),
                hidesLegacyFallback: !text.includes('Legacy parent'),
                hasRewardBuilder: text.includes('Tạo phần thưởng') && text.includes('yêu cầu chờ duyệt'),
                hasMetrics: text.includes('Band ước tính') && text.includes('Lỗi cần sửa') && text.includes('Kho public-safe'),
                hasBaselineAction: text.includes('Cho con làm baseline chẩn đoán'),
                hasClassroomCockpit: lower.includes('bảng lớp học') && text.includes('Hàng đợi ưu tiên của lớp'),
                hasAssignmentBuilder: lower.includes('assignment builder') && text.includes('Tạo bài giao') && text.includes('SAT-'),
                hasSignals: lower.includes('sức khỏe lộ trình') && text.includes('Tín hiệu can thiệp'),
                hasExamReview: lower.includes('rà soát điểm thi') && text.includes('Số log official'),
              };
            })()
            """,
            timeout=10,
        )
        assert snapshot["url"].endswith("/dist/vite/vite-parent.html"), snapshot
        assert snapshot["hidesLegacyFallback"], snapshot
        assert snapshot["hasMetrics"], snapshot
        assert snapshot["hasBaselineAction"], snapshot
        assert snapshot["hasClassroomCockpit"], snapshot
        assert snapshot["hasAssignmentBuilder"], snapshot
        assert snapshot["hasRewardBuilder"], snapshot
        assert snapshot["hasSignals"], snapshot
        assert snapshot["hasExamReview"], snapshot
        print(json.dumps({"ok": True, **snapshot}, indent=2))
    finally:
        stop_chrome(chrome)
        if server:
            server.shutdown()
            os.chdir(previous_cwd)


if __name__ == "__main__":
    main()
