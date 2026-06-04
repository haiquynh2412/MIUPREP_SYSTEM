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
        cdp.call("Page.navigate", {"url": f"{base_url}/admin.html"})
        cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")

        ready = wait_for(
            cdp,
            """
            const text = (document.body?.innerText || '').toLowerCase();
            return text.includes('content review') && text.includes('total items') && text.includes('action queue') ? true : false;
            """,
        )
        if not ready:
            raise AssertionError("Vite admin app did not render the content review dashboard")

        snapshot = cdp.eval(
            """
            (() => {
              const text = document.body.innerText;
              const lower = text.toLowerCase();
              return {
                url: location.href,
                textSample: text.slice(0, 800),
                totalVisible: text.includes('10523'),
                hidesLegacyFallback: !text.includes('Legacy admin'),
                hasQueueRows: document.querySelectorAll('.queue-row').length > 0,
                hasAnswerReview: lower.includes('answer review'),
                hasSourceRouting: lower.includes('source and routing'),
              };
            })()
            """,
            timeout=10,
        )
        assert snapshot["url"].endswith("/dist/vite/vite-admin.html"), snapshot
        assert snapshot["totalVisible"], snapshot
        assert snapshot["hidesLegacyFallback"], snapshot
        assert snapshot["hasQueueRows"], snapshot
        assert snapshot["hasAnswerReview"], snapshot
        assert snapshot["hasSourceRouting"], snapshot

        tab_snapshot = cdp.eval(
            """
            (async () => {
              const clickTab = async (label) => {
                const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label);
                button?.click();
                await new Promise(r => setTimeout(r, 150));
                return Boolean(button);
              };
              const release = await clickTab('Release gate');
              const releaseText = document.body.innerText;
              const readiness = await clickTab('SAT readiness');
              const readinessText = document.body.innerText;
              const sources = await clickTab('Source governance');
              const sourcesText = document.body.innerText;
              const expert = await clickTab('Expert gate');
              const expertText = document.body.innerText;
              const expertLower = expertText.toLowerCase();
              const authoring = await clickTab('Authoring checks');
              const authoringText = document.body.innerText;
              const accounts = await clickTab('Accounts');
              const accountsText = document.body.innerText;
              const accountsLower = accountsText.toLowerCase();
              const rewards = await clickTab('Rewards');
              const rewardsText = document.body.innerText;
              const rewardsLower = rewardsText.toLowerCase();
              const news = await clickTab('News');
              const newsText = document.body.innerText;
              const newsLower = newsText.toLowerCase();
              const backend = await clickTab('Backend sync');
              const backendText = document.body.innerText;
              const backendLower = backendText.toLowerCase();
              return {
                release,
                readiness,
                sources,
                expert,
                authoring,
                accounts,
                rewards,
                news,
                backend,
                hasReleasePackage: releaseText.includes('learner-safe public items') && releaseText.includes('Internal field hits'),
                hasReadiness: readinessText.includes('Blueprint balance') && readinessText.includes('Core-ready reviewed'),
                hasSources: sourcesText.includes('Unified pool, protected boundaries') && sourcesText.includes('private_vault'),
                hasExpertGate: expertLower.includes('expert gate web ui') && expertLower.includes('version note') && expertText.includes('Submit backend ledger'),
                hasAuthoring: authoringText.includes('Pre-save contract') && authoringText.includes('Guarded write paths') && authoringText.includes('admin:promote-public'),
                hasAccounts: accountsLower.includes('local account operations') && accountsLower.includes('account register') && accountsLower.includes('content admin'),
                hasRewards: rewardsLower.includes('reward operations') && rewardsLower.includes('reward programs') && rewardsText.includes('Choose the next sprint topic'),
                hasNews: newsLower.includes('announcement publishing') && newsLower.includes('announcement feed') && newsText.includes('Public SAT Studio route is live'),
                hasBackend: backendLower.includes('backend sync') && backendLower.includes('health check') && backendLower.includes('no backend session') && backendLower.includes('profile conflict review') && backendLower.includes('sync local profile'),
              };
            })()
            """,
            timeout=10,
        )
        assert tab_snapshot["release"] and tab_snapshot["hasReleasePackage"], tab_snapshot
        assert tab_snapshot["readiness"] and tab_snapshot["hasReadiness"], tab_snapshot
        assert tab_snapshot["sources"] and tab_snapshot["hasSources"], tab_snapshot
        assert tab_snapshot["expert"] and tab_snapshot["hasExpertGate"], tab_snapshot
        assert tab_snapshot["authoring"] and tab_snapshot["hasAuthoring"], tab_snapshot
        assert tab_snapshot["accounts"] and tab_snapshot["hasAccounts"], tab_snapshot
        assert tab_snapshot["rewards"] and tab_snapshot["hasRewards"], tab_snapshot
        assert tab_snapshot["news"] and tab_snapshot["hasNews"], tab_snapshot
        assert tab_snapshot["backend"] and tab_snapshot["hasBackend"], tab_snapshot

        filtered = cdp.eval(
            """
            (async () => {
              const review = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Review queue');
              review?.click();
              await new Promise(r => setTimeout(r, 150));
              const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim().startsWith('Warnings'));
              button?.click();
              await new Promise(r => setTimeout(r, 150));
              return {
                clicked: Boolean(button),
                text: document.body.innerText.slice(0, 800),
              };
            })()
            """,
            timeout=10,
        )
        assert filtered["clicked"], filtered
        assert "items" in filtered["text"], filtered
        print(json.dumps({"ok": True, **snapshot}, indent=2))
    finally:
        stop_chrome(chrome)
        if server:
            server.shutdown()
            os.chdir(previous_cwd)


if __name__ == "__main__":
    main()
