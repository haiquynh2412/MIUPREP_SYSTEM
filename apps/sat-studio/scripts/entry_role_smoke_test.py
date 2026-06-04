import argparse
import json
import urllib.parse

from browser_smoke_test import CdpClient, find_free_port, get_page_tab, start_chrome, stop_chrome


def wait_ready(cdp):
    ready = cdp.eval(
        """
        (async () => {
          for (let i = 0; i < 300; i++) {
            if (window.SAT_STUDIO_READY === true || document.body?.dataset?.satStudioReady === 'true') return true;
            await new Promise(r => setTimeout(r, 100));
          }
          return false;
        })()
        """,
        timeout=45,
    )
    if not ready:
        raise AssertionError("SAT Studio app did not finish initialization")


def run_entry(cdp, base_url, entry):
    clean_base = base_url.rstrip("/")
    if clean_base.endswith("index.html"):
        url = f"{clean_base}?entry={urllib.parse.quote(entry)}"
    else:
        url = f"{clean_base}/?entry={urllib.parse.quote(entry)}"
    cdp.call("Page.navigate", {"url": url})
    cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")
    wait_ready(cdp)
    return cdp.eval(
        """
        (() => {
          const options = [...document.querySelectorAll('#login-account option')].map(option => option.textContent.trim()).filter(Boolean);
          const visibleDemoButtons = [...document.querySelectorAll('.demo-login-button')].filter(button => !button.hidden).map(button => button.dataset.demoAccount);
          return {
            entryRole: document.body.dataset.entryRole || document.documentElement.dataset.satEntryRole || '',
            entryBundle: document.body.dataset.entryBundle || document.documentElement.dataset.satEntryBundle || '',
            scriptBudget: window.SAT_STUDIO_SCRIPT_BUDGET || null,
            activeRole: currentAccount()?.role || '',
            loginVisible: !document.querySelector('#login-screen').hidden,
            appVisible: !document.querySelector('#app-shell').hidden,
            options,
            visibleDemoButtons,
            navLabels: [...document.querySelectorAll('.nav-tab')].filter(button => !button.hidden).map(button => button.textContent.trim())
          };
        })()
        """,
        timeout=30,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8765/")
    args = parser.parse_args()

    port = find_free_port()
    process = start_chrome(port)
    try:
      tab = get_page_tab(port)
      cdp = CdpClient(port)
      cdp.connect(tab["webSocketDebuggerUrl"])
      cdp.call("Runtime.enable")
      cdp.call("Page.enable")

      cdp.call("Page.navigate", {"url": args.url})
      cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")
      cdp.eval(
          """
          localStorage.setItem('sat-studio-state-v2', JSON.stringify({
            version: 2,
            language: 'en',
            activeAccountId: 'content-admin',
            accounts: [],
            profiles: {},
            questions: [],
            questionReviews: {},
            questionGovernance: {},
            questionAudits: {},
            qualityIntake: {},
            sourceSignals: [],
            rewardPrograms: [],
            rewardClaims: [],
            newsPosts: [],
            vocab: []
          }));
          true;
          """
      )

      results = {
          "student": run_entry(cdp, args.url, "student"),
          "parent": run_entry(cdp, args.url, "parent"),
          "admin": run_entry(cdp, args.url, "admin"),
      }
      print(json.dumps(results, indent=2))

      assert results["student"]["entryRole"] == "student"
      assert results["student"]["scriptBudget"]["ok"]
      assert results["student"]["scriptBudget"]["adminOnlyLoaded"] == []
      assert results["student"]["activeRole"] == ""
      assert results["student"]["loginVisible"]
      assert results["student"]["visibleDemoButtons"] == ["student-demo"]
      assert all("admin" not in option.lower() for option in results["student"]["options"])

      assert results["parent"]["entryRole"] == "parent"
      assert results["parent"]["scriptBudget"]["ok"]
      assert results["parent"]["scriptBudget"]["adminOnlyLoaded"] == []
      assert results["parent"]["visibleDemoButtons"] == ["parent-admin"]
      assert all("student" not in option.lower() and "content admin" not in option.lower() for option in results["parent"]["options"])

      assert results["admin"]["entryRole"] == "admin"
      assert results["admin"]["scriptBudget"]["ok"]
      assert results["admin"]["scriptBudget"]["adminOnlyLoaded"]
      assert results["admin"]["visibleDemoButtons"] == ["content-admin"]
      assert any("content admin" in option.lower() for option in results["admin"]["options"])
    finally:
      stop_chrome(process)


if __name__ == "__main__":
    main()
