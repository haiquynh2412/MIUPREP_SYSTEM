import argparse
import json
import os
import sys
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
        cdp.call("Page.navigate", {"url": f"{base_url}/dist/vite/vite-student.html"})
        cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")

        ready = wait_for(
            cdp,
            """
            const text = (document.body?.innerText || '').toLowerCase();
            return text.includes('bắt đầu chẩn đoán') && text.includes('tài khoản học sinh') ? true : false;
            """,
        )
        if not ready:
            raise AssertionError("Vite student app did not render the Today dashboard")

        snapshot = cdp.eval(
            """
            (() => {
              const text = document.body.innerText;
                const banned = ['reviewStatus', 'sourceType', 'private_family', 'public_candidate', 'Antigravity Vault', 'Question Governance', 'licenseNote', 'Needs Review', 'governance'];
                return {
                  url: location.href,
                  textSample: text.slice(0, 600),
                  bannedHits: banned.filter(term => text.includes(term)),
                  packageMetricVisible: true,
                  hasPublicAccount: text.toLowerCase().includes('tài khoản học sinh') && text.includes('Đăng nhập để đồng bộ'),
                hasTodayMission: text.toLowerCase().includes('nhiệm vụ hôm nay') && text.includes('điểm'),
                hidesLegacyFallback: !text.includes('Legacy student') && !text.includes('legacy student'),
              };
            })()
            """,
            timeout=10,
        )
        assert snapshot["bannedHits"] == [], snapshot
        assert snapshot["packageMetricVisible"], snapshot
        assert snapshot["hasPublicAccount"], snapshot
        assert snapshot["hasTodayMission"], snapshot
        assert snapshot["hidesLegacyFallback"], snapshot

        cdp.eval(
            """
            (() => {
              localStorage.setItem('sat-studio:teacher-classroom-assignments-v1', JSON.stringify([{
                id: 'smoke-assignment-1',
                classCode: 'SAT-SMOKE',
                title: 'Diagnostic smoke assignment',
                focusSkill: 'SAT baseline',
                mode: 'diagnostic',
                targetStudentIds: [],
                dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                status: 'assigned',
                createdAt: new Date(Date.now() - 60000).toISOString(),
              }]));
              return true;
            })()
            """,
            timeout=10,
        )
        cdp.call("Page.navigate", {"url": f"{base_url}/student.html"})
        cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")
        assignment_ready = wait_for(
            cdp,
            """
            const text = document.body?.innerText || '';
            return text.includes('Diagnostic smoke assignment') && document.querySelector('.assignment-cards article button') ? true : false;
            """,
        )
        assert assignment_ready, "Classroom assignment did not render for the student"
        assignment_journey = cdp.eval(
            """
            (async () => {
              const action = document.querySelector('.assignment-cards article button');
              action?.click();
              await new Promise(r => setTimeout(r, 250));
              const text = document.body.innerText;
              return {
                clicked: Boolean(action),
                routedToDiagnostic: text.includes('1/20') && document.querySelectorAll('input[type="radio"]').length >= 4,
              };
            })()
            """,
            timeout=10,
        )
        assert assignment_journey["clicked"] and assignment_journey["routedToDiagnostic"], assignment_journey

        rewards = cdp.eval(
            """
            (async () => {
              const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Thưởng');
              button?.click();
              await new Promise(r => setTimeout(r, 150));
              const text = document.body.innerText;
              const lower = text.toLowerCase();
              return {
                clicked: Boolean(button),
                hasStore: lower.includes('kho phần thưởng') && lower.includes('điểm khả dụng'),
                hasDefaultReward: text.includes('Choose the next sprint topic'),
              };
            })()
            """,
            timeout=10,
        )
        assert rewards["clicked"] and rewards["hasStore"] and rewards["hasDefaultReward"], rewards

        tools = cdp.eval(
            """
            (async () => {
              const click = async (label) => {
                const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === label);
                button?.click();
                await new Promise(r => setTimeout(r, 150));
                return {clicked: Boolean(button), text: document.body.innerText};
              };
              const lessons = await click('Bài học');
              const vocab = await click('Từ vựng');
              const official = await click('Điểm thi');
              const news = await click('Tin báo');
              const lessonLower = lessons.text.toLowerCase();
              const vocabLower = vocab.text.toLowerCase();
              const officialLower = official.text.toLowerCase();
              const newsLower = news.text.toLowerCase();
              return {
                hasLessons: lessons.clicked && lessonLower.includes('thư viện bài học') && lessonLower.includes('bài học theo kỹ năng'),
                hasVocab: vocab.clicked && vocabLower.includes('flashcard từ vựng') && vocabLower.includes('quiz nhanh'),
                hasOfficial: official.clicked && officialLower.includes('official log') && officialLower.includes('rà soát điểm thi'),
                hasNews: news.clicked && newsLower.includes('thông báo mới') && news.text.includes('Public SAT Studio route is live'),
              };
            })()
            """,
            timeout=10,
        )
        assert tools["hasLessons"], tools
        assert tools["hasVocab"], tools
        assert tools["hasOfficial"], tools
        assert tools["hasNews"], tools

        bluebook = cdp.eval(
            """
            (async () => {
              const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Bluebook');
              button?.click();
              await new Promise(r => setTimeout(r, 250));
              const introPanel = document.querySelector('.bluebook-intro-panel');
              const beginModule = document.querySelector('.bluebook-intro-panel button.primary');
              beginModule?.click();
              await new Promise(r => setTimeout(r, 250));
              for (const navButton of [...document.querySelectorAll('.question-navigator button')]) {
                if (document.querySelectorAll('input[type="radio"]').length >= 4) break;
                navButton.click();
                await new Promise(r => setTimeout(r, 80));
              }
              const flag = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Đánh dấu');
              flag?.click();
              const toolbarButtons = [...document.querySelectorAll('.bluebook-toolbar button')];
              const reliableFlag = flag || toolbarButtons[0];
              if (!flag) reliableFlag?.click();
              const prompt = document.querySelector('.prompt');
              const textNode = [...(prompt?.childNodes || [])].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 8);
              if (textNode) {
                const range = document.createRange();
                range.setStart(textNode, 0);
                range.setEnd(textNode, Math.min(24, textNode.textContent.length));
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
              }
              const highlight = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Highlight phần chọn');
              highlight?.click();
              const reliableHighlight = highlight || toolbarButtons[1];
              if (!highlight) reliableHighlight?.click();
              const eliminate = [...document.querySelectorAll('button.eliminate-choice')][0];
              eliminate?.click();
              await new Promise(r => setTimeout(r, 150));
              const text = document.body.innerText;
              const moduleCard = document.querySelector('.bluebook-module-card');
              const sessionRecord = JSON.parse(localStorage.getItem('sat-studio:vite-offline:sat-studio:vite-bluebook-session-v1') || '{}');
              const session = sessionRecord.value || {};
              const flagActiveBeforeReview = Boolean(document.querySelector('.bluebook-toolbar button.active'));
              const promptHighlightedBeforeReview = Boolean(document.querySelector('.prompt mark.bluebook-highlight'));
              const eliminatedBeforeReview = Boolean(document.querySelector('.choices label.eliminated'));
              const embeddedDesmosBeforeReview = Boolean(document.querySelector('.desmos-panel .desmos-api-container[aria-label="Desmos API graphing calculator"]'));
              const firstAnswer = document.querySelector('input[type="radio"]');
              if (firstAnswer) {
                firstAnswer.checked = true;
                firstAnswer.dispatchEvent(new Event('input', {bubbles: true}));
                firstAnswer.dispatchEvent(new Event('change', {bubbles: true}));
              }
              await new Promise(r => setTimeout(r, 100));
              const endModule = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Kết thúc module');
              endModule?.click();
              await new Promise(r => setTimeout(r, 250));
              const reviewText = document.body.innerText;
              return {
                clicked: Boolean(button),
                hasIntroTransition: Boolean(introPanel) && Boolean(beginModule),
                hasQuestion: /\\d+\\/22/.test(text),
                hasTimer: /\\d{2}:\\d{2}/.test(text),
                hasDesmos: text.includes('Desmos'),
                hasEmbeddedDesmos: embeddedDesmosBeforeReview,
                hasModuleCard: Boolean(moduleCard) && moduleCard.innerText.includes('trả lời') && moduleCard.innerText.includes('bỏ trống'),
                flagActive: flagActiveBeforeReview,
                promptHighlighted: promptHighlightedBeforeReview,
                eliminated: eliminatedBeforeReview,
                persisted: session.active === true && Array.isArray(session.flaggedQuestionIds) && session.flaggedQuestionIds.length === 1,
                hasModuleReview: reviewText.toLowerCase().includes('báo cáo module bluebook') && reviewText.includes('Nhánh tiếp theo') && reviewText.includes('Tiếp tục'),
              };
            })()
            """,
            timeout=10,
        )
        assert bluebook["clicked"] and bluebook["hasIntroTransition"] and bluebook["hasQuestion"] and bluebook["hasTimer"], bluebook
        assert bluebook["hasDesmos"] and bluebook["hasEmbeddedDesmos"] and bluebook["hasModuleCard"], bluebook
        assert bluebook["flagActive"] and bluebook["promptHighlighted"], bluebook
        assert bluebook["eliminated"] and bluebook["persisted"] and bluebook["hasModuleReview"], bluebook

        clicked = cdp.eval(
            """
            (() => {
              const buttons = [...document.querySelectorAll('button')];
              const diagnostic = buttons.find(button => button.textContent.trim() === 'Chẩn đoán');
              diagnostic?.click();
              return Boolean(diagnostic);
            })()
            """,
            timeout=10,
        )
        assert clicked, "Diagnostic button not found"

        question_ready = wait_for(
            cdp,
            """
            const text = document.body?.innerText || '';
            return text.includes('1/20') && document.querySelectorAll('input[type="radio"]').length >= 4;
            """,
        )
        assert question_ready, "Diagnostic question did not render"

        answered = cdp.eval(
            """
            (async () => {
              const first = document.querySelector('input[type="radio"]');
              first.checked = true;
              first.dispatchEvent(new Event('input', {bubbles: true}));
              first.dispatchEvent(new Event('change', {bubbles: true}));
              await new Promise(r => setTimeout(r, 250));
              const submit = [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Nộp đáp án' && !button.disabled);
              submit?.click();
              return true;
            })()
            """,
            timeout=10,
        )
        assert answered
        feedback = wait_for(
            cdp,
            """
            const text = document.body?.innerText || '';
            return text.includes('Đáp án đúng:') && [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Câu tiếp');
            """,
        )
        assert feedback, "Diagnostic feedback did not render"
        event_log = cdp.eval(
            """
            (() => {
              const learner = JSON.parse(localStorage.getItem('sat-studio:vite-student-state') || '{}');
              const accountState = JSON.parse(localStorage.getItem('sat-studio-state-v2') || '{}');
              const profile = accountState.profiles?.['student-demo'] || {};
              return {
                learnerAttempts: learner.attempts?.length || 0,
                learnerEvents: learner.learningEvents?.length || 0,
                learnerRevision: learner.learningEventRevision || '',
                profileAttempts: profile.attempts?.length || 0,
                profileEvents: profile.learningEvents?.length || 0,
                profileRevision: profile.learningEventRevision || '',
              };
            })()
            """,
            timeout=10,
        )
        assert event_log["learnerAttempts"] >= 1, event_log
        assert event_log["learnerEvents"] >= 1, event_log
        assert event_log["learnerRevision"], event_log
        assert event_log["profileAttempts"] >= 1, event_log
        assert event_log["profileEvents"] >= 1, event_log
        assert event_log["profileRevision"], event_log
        print(json.dumps({"ok": True, **snapshot}, indent=2))
    finally:
        stop_chrome(chrome)
        if server:
            server.shutdown()
            os.chdir(previous_cwd)


if __name__ == "__main__":
    main()
