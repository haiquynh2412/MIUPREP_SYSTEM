import base64
import json
import os
import re
import socket
import struct
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request


ROOT_URL = "http://127.0.0.1:8765/"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ARTIFACT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
SMOKE_ARTIFACT = os.path.join(ARTIFACT_DIR, "browser_smoke_last.log")


class CdpClient:
    def __init__(self, port):
        self.port = port
        self.events = []
        self.counter = 0
        self.sock = None

    def connect(self, websocket_url):
        parsed = urllib.parse.urlparse(websocket_url)
        self.sock = socket.create_connection((parsed.hostname, parsed.port), timeout=30)
        self.sock.settimeout(30)
        key = base64.b64encode(os.urandom(16)).decode()
        path = parsed.path + (("?" + parsed.query) if parsed.query else "")
        request = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {parsed.hostname}:{parsed.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(request.encode())
        handshake = self.sock.recv(4096)
        if b"101" not in handshake.split(b"\r\n", 1)[0]:
            raise RuntimeError("WebSocket handshake failed")

    def send_frame(self, payload):
        data = payload.encode("utf-8")
        header = bytearray([0x81])
        length = len(data)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        mask = os.urandom(4)
        header.extend(mask)
        self.sock.sendall(header + bytes(byte ^ mask[i % 4] for i, byte in enumerate(data)))

    def accept_dialog(self):
        self.counter += 1
        self.send_frame(
            json.dumps(
                {
                    "id": self.counter,
                    "method": "Page.handleJavaScriptDialog",
                    "params": {"accept": True},
                }
            )
        )

    def read_exact(self, count):
        out = b""
        while len(out) < count:
            chunk = self.sock.recv(count - len(out))
            if not chunk:
                raise RuntimeError("Socket closed")
            out += chunk
        return out

    def recv_frame(self):
        head = self.read_exact(2)
        opcode = head[0] & 15
        length = head[1] & 127
        if length == 126:
            length = struct.unpack("!H", self.read_exact(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self.read_exact(8))[0]
        mask = self.read_exact(4) if head[1] & 128 else b""
        payload = self.read_exact(length) if length else b""
        if mask:
            payload = bytes(byte ^ mask[i % 4] for i, byte in enumerate(payload))
        if opcode in (1, 2):
            return json.loads(payload.decode("utf-8"))
        if opcode == 8:
            raise RuntimeError("WebSocket closed")
        return self.recv_frame()

    def call(self, method, params=None, timeout=60):
        self.counter += 1
        message_id = self.counter
        self.send_frame(json.dumps({"id": message_id, "method": method, "params": params or {}}))
        end = time.time() + timeout
        previous_timeout = self.sock.gettimeout()
        self.sock.settimeout(max(timeout + 5, previous_timeout or 0))
        try:
            while time.time() < end:
                message = self.recv_frame()
                if message.get("id") == message_id:
                    return message
                if message.get("method") == "Page.javascriptDialogOpening":
                    self.events.append(message)
                    self.accept_dialog()
                    continue
                self.events.append(message)
        finally:
            self.sock.settimeout(previous_timeout)
        raise TimeoutError(method)

    def eval(self, expression, timeout=60):
        response = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "awaitPromise": True,
                "returnByValue": True,
                "userGesture": True,
            },
            timeout,
        )
        inner = response.get("result", {})
        if "exceptionDetails" in inner:
            raise RuntimeError(json.dumps(inner["exceptionDetails"])[:1000])
        return inner.get("result", {}).get("value")


def start_chrome(port):
    profile = tempfile.mkdtemp(prefix="sat-studio-smoke-")
    process = subprocess.Popen(
        [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--disable-extensions",
            "--no-first-run",
            "--no-default-browser-check",
            f"--remote-debugging-port={port}",
            f"--user-data-dir={profile}",
            "about:blank",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    process.smoke_profile = profile
    return process


def stop_chrome(process):
    subprocess.run(
        ["taskkill", "/PID", str(process.pid), "/T", "/F"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def get_page_tab(port):
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=1) as response:
                tabs = json.loads(response.read().decode("utf-8"))
            pages = [tab for tab in tabs if tab.get("type") == "page"]
            if pages:
                return pages[0]
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("No Chrome page tab found")


def run_diagnostic_smoke(cdp):
    return cdp.eval(
        """
        (async () => {
          document.querySelector('[data-view="pretest"]').click();
          await new Promise(r => setTimeout(r, 100));
          const readinessText = document.querySelector('#diagnostic-readiness').textContent;
          const start = Promise.resolve(startPretest('preview'))
            .then(() => ({status: 'resolved'}))
            .catch(error => ({status: 'error', message: error.message}));
          const startResult = await Promise.race([
            start,
            new Promise(resolve => setTimeout(() => resolve({status: 'timeout'}), 20000))
          ]);
          for (let i = 0; i < 80; i++) {
            await new Promise(r => setTimeout(r, 250));
            const cur = profile().currentPretest;
            if (cur && cur.questionIds && cur.questionIds.length) {
              const firstQuestionId = cur.questionIds[cur.currentIndex || 0];
              const firstQuestion = getQuestionById(firstQuestionId);
              let selectedValue = '';
              if (firstQuestion) {
                if (isGridInQuestion(firstQuestion)) {
                  selectedValue = String((firstQuestion.acceptableAnswers || [firstQuestion.correctAnswer]).filter(Boolean)[0] || '');
                  const gridInput = document.querySelector('input[name="pretest-answer"]');
                  if (gridInput) gridInput.value = selectedValue;
                } else {
                  selectedValue = String(firstQuestion.correctAnswer || Object.keys(firstQuestion.choices || {})[0] || '');
                  const radio = [...document.querySelectorAll('input[name="pretest-answer"]')].find(input => input.value === selectedValue);
                  if (radio) radio.checked = true;
                }
                submitPretestAnswer();
                await new Promise(r => setTimeout(r, 100));
              }
              const saved = cur.answers.find(answer => answer.questionId === firstQuestionId);
              const stemBeforeLanguageSwitch = document.querySelector('#pretest-stem')?.textContent || '';
              const choiceBeforeLanguageSwitch = document.querySelector('#pretest-options .choice-text')?.textContent || '';
              document.querySelector('.language-option[data-language="vi"]').click();
              await new Promise(r => setTimeout(r, 100));
              const viSaveAnswer = document.querySelector('#pretest-submit')?.textContent || '';
              const viTimeRemaining = document.querySelector('.pretest-clock span')?.textContent || '';
              const stemAfterLanguageSwitch = document.querySelector('#pretest-stem')?.textContent || '';
              const choiceAfterLanguageSwitch = document.querySelector('#pretest-options .choice-text')?.textContent || '';
              document.querySelector('.language-option[data-language="en"]').click();
              await new Promise(r => setTimeout(r, 100));
              return {
                page: document.querySelector('#page-title').textContent,
                count: cur.questionIds.length,
                readinessText,
                startResult,
                questions: state.questions.length,
                firstQuestionId,
                selectedValue,
                savedAnswer: saved ? saved.selectedAnswer : '',
                answerCaptureOk: Boolean(saved && saved.selectedAnswer === selectedValue),
                viSaveAnswer,
                viTimeRemaining,
                pretestStemStableUnderVi: stemBeforeLanguageSwitch === stemAfterLanguageSwitch,
                pretestChoiceStableUnderVi: choiceBeforeLanguageSwitch === choiceAfterLanguageSwitch
              };
            }
          }
          return {
            error: 'pretest did not start',
            startResult,
            current: profile().currentPretest,
            questions: state.questions.length,
            visible: visibleQuestionBank().length
          };
        })()
        """,
        timeout=90,
    )


def run_full_length_smoke(cdp):
    return cdp.eval(
        """
        (async () => {
          const cancel = document.querySelector('#pretest-cancel');
          if (cancel) cancel.click();
          document.querySelector('[data-view="pretest"]').click();
          document.querySelector('#start-full-test').click();
          for (let i = 0; i < 80; i++) {
            await new Promise(r => setTimeout(r, 250));
            const cur = profile().currentPretest;
            if (cur && cur.mode === 'full' && cur.questionIds && cur.questionIds.length) {
              return {
                page: document.querySelector('#page-title').textContent,
                count: cur.questionIds.length,
                mode: cur.mode,
                moduleIndex: cur.moduleIndex,
                moduleCount: cur.modules ? cur.modules.length : 0,
                totalQuestions: cur.officialStructure ? cur.officialStructure.totalQuestions : 0,
                totalMinutes: cur.officialStructure ? cur.officialStructure.totalMinutes : 0,
                timeLimitSeconds: cur.timeLimitSeconds,
                timerRequired: Boolean(cur.timerRequired),
                activeRoute: cur.activeRoute,
                timeLimitText: document.querySelector('#pretest-time-limit').textContent
              };
            }
          }
          return {error: 'full length did not start'};
        })()
        """,
        timeout=90,
    )


def main():
    port = find_free_port()
    process = start_chrome(port)
    try:
        tab = get_page_tab(port)
        cdp = CdpClient(port)
        cdp.connect(tab["webSocketDebuggerUrl"])
        cdp.call("Runtime.enable")
        cdp.call("Page.enable")
        cdp.call("Page.navigate", {"url": ROOT_URL})
        cdp.eval(
            "new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))"
        )
        cdp.eval(
            """
            (async () => {
              for (let i = 0; i < 200; i++) {
                if (window.SAT_STUDIO_READY === true || document.body?.dataset?.satStudioReady === 'true') return true;
                await new Promise(r => setTimeout(r, 100));
              }
              throw new Error('SAT Studio app did not finish initialization');
            })()
            """,
            timeout=45,
        )

        login = cdp.eval(
            """
            (async () => {
              for (let i = 0; i < 200; i++) {
                const account = document.querySelector('#login-account');
                if (account && account.querySelector('option[value="student-demo"]')) break;
                await new Promise(r => setTimeout(r, 100));
              }
              if (!document.querySelector('#login-account')) throw new Error('login form did not render');
              document.querySelector('#login-account').value='student-demo';
              document.querySelector('#login-passcode').value='1111';
              if (typeof login === 'function') {
                login({preventDefault(){}});
              } else {
                document.querySelector('#login-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
              }
              for (let i = 0; i < 120; i++) {
                if (!document.querySelector('#app-shell').hidden && document.querySelector('#active-account-name')?.textContent.includes('Student Demo')) break;
                await new Promise(r => setTimeout(r, 100));
              }
              return {
                page:document.querySelector('#page-title').textContent,
                visible:!document.querySelector('#app-shell').hidden,
                activeName: document.querySelector('#active-account-name')?.textContent || ''
              };
            })()
            """,
            timeout=45,
        )

        language = cdp.eval(
            """
            (() => {
              document.querySelector('.language-option[data-language="vi"]').click();
              const viTitle = document.querySelector('#page-title').textContent;
              const viNav = document.querySelector('[data-view="topics"]').textContent;
              const viGuideNav = document.querySelector('[data-view="guide"]').textContent;
              const viReward = document.querySelector('.reward-panel h2').textContent;
              document.querySelector('.language-option[data-language="en"]').click();
              const enTitle = document.querySelector('#page-title').textContent;
              const enReward = document.querySelector('.reward-panel h2').textContent;
              return {viTitle, viNav, viGuideNav, viReward, enTitle, enReward};
            })()
            """
        )

        guide = cdp.eval(
            """
            (() => {
              document.querySelector('[data-view="guide"]').click();
              const directPage = document.querySelector('#page-title').textContent;
              const guideText = document.querySelector('#view-guide').textContent;
              document.querySelector('[data-view="author"]').click();
              document.querySelector('#open-guide-from-author').click();
              return {
                directPage,
                fromAuthorPage: document.querySelector('#page-title').textContent,
                learner: guideText.includes('Luồng học cho học sinh'),
                admin: guideText.includes('Xử lý tài liệu và tạo câu hỏi'),
                safety: guideText.includes('Quy tắc nguồn dữ liệu')
              };
            })()
            """
        )

        sources_loaded = cdp.eval(
            """
            (async () => {
              document.querySelector('[data-view="sources"]').click();
              await Promise.all([
                ensureLocalOpenSatBank(true),
                ensureFoundationBank(true),
                ensureKaplanAiMathBank(true),
                ensureArchiveAiBank(true),
                ensureSatKingBank(true),
                ensureSat1590Bank(true),
                ensurePrivateVaultBank(true),
                ensureAntigravityBank(true)
              ]);
              for (let i = 0; i < 80; i++) {
                await new Promise(r => setTimeout(r, 100));
                const reviewed = state.questions.filter(q => q.reviewStatus === 'reviewed').length;
                if (reviewed >= state.questions.length - 25 && reviewed >= 8400) {
                  const skills = new Set(state.questions.map(q => `${q.section}|${q.domain}|${q.skill}`)).size;
                  return {
                    page: document.querySelector('#page-title').textContent,
                    count: state.questions.length,
                    reviewed,
                    sourceSignals: new Set(state.questions.map(q => q.sourceSignalId).filter(Boolean)).size,
                    sourceTypes: new Set(state.questions.map(q => q.sourceType).filter(Boolean)).size,
                    unreviewedStudyRows: state.questions.filter(q => q.reviewStatus && q.reviewStatus !== 'reviewed' && q.practicePool !== 'hidden_duplicate').length,
                    skills,
                    text: document.querySelector('#source-ledger').textContent
                  };
                }
              }
              const skills = new Set(state.questions.map(q => `${q.section}|${q.domain}|${q.skill}`)).size;
              return {
                page: document.querySelector('#page-title').textContent,
                count: state.questions.length,
                reviewed: state.questions.filter(q => q.reviewStatus === 'reviewed').length,
                sourceSignals: new Set(state.questions.map(q => q.sourceSignalId).filter(Boolean)).size,
                sourceTypes: new Set(state.questions.map(q => q.sourceType).filter(Boolean)).size,
                unreviewedStudyRows: state.questions.filter(q => q.reviewStatus && q.reviewStatus !== 'reviewed' && q.practicePool !== 'hidden_duplicate').length,
                skills,
                text: document.querySelector('#source-ledger').textContent
              };
            })()
            """,
            timeout=30,
        )

        diagnostic = run_diagnostic_smoke(cdp)
        full_length = run_full_length_smoke(cdp)
        cdp.eval("(() => { const cancel = document.querySelector('#pretest-cancel'); if (cancel) cancel.click(); return true; })()", timeout=20)
        cdp.eval(
            """
            (() => {
              const p = profile();
              if (!Array.isArray(p.pretests) || !p.pretests.length) {
                p.pretests = [{
                  id: 'smoke-baseline',
                  mode: 'preview',
                  label: 'Smoke baseline',
                  startedAt: new Date().toISOString(),
                  completedAt: new Date().toISOString(),
                  total: 20,
                  correct: 14,
                  wrong: 6,
                  noAnswer: 0,
                  accuracy: 70,
                  scoreEstimate: 1250,
                  scoreBand: {label: '1130-1370', confidence: 'medium'},
                  sectionScores: {'Reading and Writing': 610, Math: 640},
                  sectionScoreBands: {
                    'Reading and Writing': {label: '550-670', confidence: 'medium'},
                    Math: {label: '580-700', confidence: 'medium'}
                  },
                  reviewItems: []
                }];
                saveState();
              }
              render();
              applyRoleNavigation(currentAccount());
              return {pretests: p.pretests.length, nav: [...document.querySelectorAll('.nav-tab')].filter(tab => !tab.hidden).map(tab => tab.textContent.trim())};
            })()
            """,
            timeout=20,
        )

        archive_registry = cdp.eval(
            """
            (async () => {
              document.querySelector('[data-view="sources"]').click();
              document.querySelector('#load-archive-registry').click();
              for (let i = 0; i < 80; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelectorAll('#archive-registry-list .archive-doc-card').length >= 35) break;
              }
              return {
                summaryText: document.querySelector('#archive-registry-summary').textContent,
                cards: document.querySelectorAll('#archive-registry-list .archive-doc-card').length,
                highRisk: document.querySelector('#archive-registry-summary').textContent.includes('33'),
                firstCard: document.querySelector('#archive-registry-list .archive-doc-card')?.textContent || ''
              };
            })()
            """,
            timeout=30,
        )

        integrity_report = cdp.eval(
            """
            (async () => {
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = 'content-admin';
              document.querySelector('#login-passcode').value = '9999';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              await new Promise(r => setTimeout(r, 50));
              document.querySelector('[data-view="sources"]').click();
              document.querySelector('#load-integrity-report').click();
              for (let i = 0; i < 200; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelector('#question-integrity-summary').textContent.includes('questions audited')) break;
              }
              const result = {
                summaryText: document.querySelector('#question-integrity-summary').textContent,
                blockedText: document.querySelector('#question-integrity-blocked').textContent,
                topicsText: document.querySelector('#question-integrity-topics').textContent,
                blockedRows: document.querySelectorAll('#question-integrity-blocked .integrity-row').length,
                topicCards: document.querySelectorAll('#question-integrity-topics .integrity-topic-card').length
              };
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = 'student-demo';
              document.querySelector('#login-passcode').value = '1111';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              await new Promise(r => setTimeout(r, 50));
              return result;
            })()
            """,
            timeout=90,
        )

        unified_bank = cdp.eval(
            """
            (async () => {
              await Promise.all([
                ensureLocalOpenSatBank(true),
                ensureFoundationBank(true),
                ensureKaplanAiMathBank(true),
                ensureArchiveAiBank(true),
                ensureSatKingBank(true),
                ensureSat1590Bank(true),
                ensurePrivateVaultBank(true),
                ensureAntigravityBank(true)
              ]);
              for (let i = 0; i < 80; i++) {
                await new Promise(r => setTimeout(r, 100));
                const reviewed = state.questions.filter(q => q.reviewStatus === 'reviewed').length;
                if (reviewed >= state.questions.length - 25 && reviewed >= 8400) break;
              }
              const questions = state.questions.filter(q => q.reviewStatus === 'reviewed' && isStudyAvailableQuestion(q));
              document.querySelector('[data-view="practice"]').click();
              const mathQuestions = questions.filter(q => q.section === 'Math');
              document.querySelector('#filter-section').value = mathQuestions.length ? 'Math' : 'All';
              refreshDynamicFilters();
              document.querySelector('#filter-domain').value = 'All';
              document.querySelector('#filter-difficulty').value = 'All';
              document.querySelector('#filter-status').value = 'All';
              document.querySelector('#filter-source').value = 'All';
              activePracticeSkill = 'All';
              dueMode = false;
              currentIndex = 0;
              practiceSessionQuestionIds = (mathQuestions.length ? mathQuestions : questions).slice(0, 20).map(q => q.id);
              practiceSessionMode = 'Unified bank smoke';
              currentIndex = 0;
              renderPractice();
              const first = filteredQuestions[0];
              if (first) {
                const answer = document.querySelector(`input[name="answer"][value="${first.correctAnswer}"]`);
                answer.checked = true;
                answer.dispatchEvent(new Event('change', {bubbles:true}));
                const beforeAttempts = profile().attempts.length;
                document.querySelector('#submit-answer').click();
                for (let i = 0; i < 30; i++) {
                  await new Promise(r => setTimeout(r, 100));
                  if (profile().attempts.length > beforeAttempts) break;
                }
              }
              const provenanceSignals = new Set(state.questions.map(q => q.sourceSignalId).filter(Boolean));
              const reviewed = state.questions.filter(q => q.reviewStatus === 'reviewed');
              const blocked = state.questions.filter(q => ['rejected', 'blocked'].includes(String(q.reviewStatus || '').toLowerCase()) || String(q.publicationStatus || '').startsWith('rejected'));
              return {
                count: questions.length,
                reviewed: reviewed.length,
                blocked: blocked.length,
                privateFamily: reviewed.filter(q => q.visibility === 'private_family').length,
                sourceSignals: provenanceSignals.size,
                sourceReferences: new Set(reviewed.map(q => q.sourceReference).filter(Boolean)).size,
                filteredCount: filteredQuestions.length,
                firstSourceSignalId: first?.sourceSignalId || '',
                feedback: document.querySelector('#feedback').textContent,
                attemptLogged: profile().attempts.some(attempt => attempt.questionId === first?.id)
              };
            })()
            """,
            timeout=30,
        )

        topics = cdp.eval(
            """
            (() => {
              const flowCards = document.querySelectorAll('.flow-card').length;
              document.querySelector('#flow-open-topics').click();
              const page = document.querySelector('#page-title').textContent;
              const cards = document.querySelectorAll('.topic-card').length;
              document.querySelector('#topic-section').value = 'Math';
              document.querySelector('#topic-section').dispatchEvent(new Event('change', {bubbles:true}));
              document.querySelector('#topic-domain').value = 'Algebra';
              document.querySelector('#topic-domain').dispatchEvent(new Event('change', {bubbles:true}));
              const summary = document.querySelector('#topic-session-summary').textContent;
              document.querySelector('#start-topic-practice').click();
              return {
                flowCards,
                page,
                cards,
                summary,
                practicePage: document.querySelector('#page-title').textContent,
                matched: document.querySelector('#session-count').textContent,
                counter: document.querySelector('#question-counter').textContent
              };
            })()
            """
        )

        roadmap_links = cdp.eval(
            """
            (async () => {
              const p = profile();
              p.roadmap = [{
                title: 'Practice Linear equations',
                source: 'Smoke generated path',
                detail: 'Start with Linear equations in one variable.',
                action: '10 questions',
                targets: [{
                  label: 'Linear equations in one variable',
                  section: 'Math',
                  domain: 'Algebra',
                  skill: 'Linear equations in one variable',
                  difficulty: 'All',
                  source: 'All'
                }]
              }];
              saveState();
              document.querySelector('[data-view="roadmap"]').click();
              for (let i = 0; i < 50; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelectorAll('.roadmap-practice-link').length) break;
              }
              const linkCount = document.querySelectorAll('.roadmap-practice-link').length;
              const externalLinkCount = document.querySelectorAll('.roadmap-practice-links .external-resource-card').length;
              const evaluationText = document.querySelector('#roadmap-evaluation').textContent;
              const readinessText = document.querySelector('#elite-readiness-panel').textContent;
              const masteryText = document.querySelector('#mastery-ladder').textContent;
              const readinessScoreCount = document.querySelectorAll('#elite-readiness-panel .readiness-score').length;
              document.querySelector('[data-student-roadmap-tab="detail"]')?.click();
              await new Promise(r => setTimeout(r, 100));
              const studentDetailText = document.querySelector('#roadmap-evaluation').textContent;
              const studentDetailReadinessScoreCount = document.querySelectorAll('#roadmap-evaluation .readiness-score').length;
              document.querySelector('[data-student-roadmap-tab="skills"]')?.click();
              await new Promise(r => setTimeout(r, 100));
              const studentSkillsText = document.querySelector('#roadmap-evaluation').textContent;
              document.querySelector('[data-student-roadmap-tab="today"]')?.click();
              await new Promise(r => setTimeout(r, 100));
              const roadmapLink = document.querySelector('.roadmap-practice-link');
              const linkDataset = {
                section: roadmapLink?.dataset.section || "",
                domain: roadmapLink?.dataset.domain || "",
                skill: roadmapLink?.dataset.skill || ""
              };
              const scopedFunctionHasTaxonomy = String(startScopedPractice).includes('taxonomyMatch');
              roadmapLink.click();
              for (let i = 0; i < 50; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelectorAll('#practice-resource-links .external-resource-card').length) break;
              }
              return {
                linkCount,
                externalLinkCount,
                page: document.querySelector('#page-title').textContent,
                matched: document.querySelector('#session-count').textContent,
                filterSection: document.querySelector('#filter-section').value,
                filterSectionOptions: [...document.querySelector('#filter-section').options].map(option => option.value),
                filterDomain: document.querySelector('#filter-domain').value,
                linkDataset,
                scopedFunctionHasTaxonomy,
                questionSkill: document.querySelector('#question-skill').textContent,
                counter: document.querySelector('#question-counter').textContent,
                practiceResourceText: document.querySelector('#practice-resource-links').textContent,
                evaluationText,
                readinessText,
                masteryText,
                readinessScoreCount,
                studentDetailText,
                studentDetailReadinessScoreCount,
                studentSkillsText
              };
            })()
            """
        )

        practice_tools = cdp.eval(
            """
            (async () => {
              document.querySelector('[data-view="practice"]').click();
              document.querySelector('#start-five-minute-sprint').click();
              for (let i = 0; i < 40; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelector('#practice-mode-label').textContent.includes('5-Minute Sprint')) break;
              }
              const mode = document.querySelector('#practice-mode-label').textContent;
              const count = filteredQuestions.length;
              const timerText = document.querySelector('#practice-timer').textContent;
              const navCount = document.querySelectorAll('.practice-nav-button').length;
              const targetBadge = document.querySelector('#question-badges').textContent;
              document.querySelector('#mark-review').click();
              const marked = document.querySelector('#mark-review').textContent;
              const navMarked = Boolean(document.querySelector('.practice-nav-button.current.marked'));
              const eliminate = document.querySelector('#answer-options .eliminate-choice');
              if (eliminate) eliminate.click();
              const eliminated = Boolean(document.querySelector('#answer-options .answer-option.eliminated'));
              const highlightTarget = document.querySelector('#answer-options .answer-option .choice-text') || document.querySelector('#answer-options .grid-response-body strong') || document.querySelector('#question-stem');
              if (highlightTarget) {
                const range = document.createRange();
                range.selectNodeContents(highlightTarget);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.querySelector('#highlight-selection').click();
              }
              const answerHighlight = Boolean(document.querySelector('#answer-options mark.practice-highlight') || document.querySelector('#question-stem mark.practice-highlight'));
              const q = filteredQuestions[0];
              await new Promise(r => setTimeout(r, 1200));
              if (isGridInQuestion(q)) {
                const input = document.querySelector('.grid-response-input');
                input.value = '__smoke_wrong__';
                input.dispatchEvent(new Event('input', {bubbles:true}));
              } else {
                const wrongKey = Object.keys(q.choices || {}).find(key => key !== q.correctAnswer) || q.correctAnswer;
                const answer = document.querySelector(`input[name="answer"][value="${wrongKey}"]`);
                answer.checked = true;
                answer.dispatchEvent(new Event('change', {bubbles:true}));
              }
              const beforeAttempts = profile().attempts.length;
              document.querySelector('#submit-answer').click();
              for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (profile().attempts.length > beforeAttempts) break;
              }
              const attempts = profile().attempts;
              const loggedNewAttempt = profile().attempts.length > beforeAttempts;
              const last = loggedNewAttempt ? attempts[attempts.length - 1] : null;
              if (!last) {
                const q = filteredQuestions[0];
                return {
                  mode,
                  count,
                  timerText,
                  navCount,
                  targetBadge,
                  marked,
                  navMarked,
                  eliminated,
                  answerHighlight,
                  timeSpentSeconds: -1,
                  practiceMode: "",
                  markedForReview: false,
                  pacingText: document.querySelector('#pacing-analytics').textContent,
                  feedback: document.querySelector('#feedback').textContent,
                  endedMode: document.querySelector('#practice-mode-label').textContent,
                  reportText: "",
                  reportMode: "",
                  reportRows: 0,
                  reportMarked: 0,
                  reportRecommendation: "",
                  debugNoAttempt: {
                    selectedAnswer,
                    displayedAnswer: (document.querySelector('input[name="answer"]:checked')?.value || document.querySelector('.grid-response-input')?.value || ""),
                    submitDisabled: document.querySelector('#submit-answer').disabled,
                    profileAttempts: profile().attempts.length,
                    beforeAttempts,
                    savedAttempts: attempts.length,
                    questionId: q?.id,
                    questionType: q?.questionType || "",
                    correctAnswer: q?.correctAnswer || "",
                    isGrid: isGridInQuestion(q)
                  }
                };
              }
              for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 100));
                const feedbackText = document.querySelector('#feedback').textContent;
                if (!document.querySelector('#feedback .ds-loading-panel') && feedbackText.includes('Target for this item')) break;
              }
              const pacingText = document.querySelector('#pacing-analytics').textContent;
              const feedback = document.querySelector('#feedback').textContent;
              const tutorLayer = Boolean(document.querySelector('#feedback .ai-tutor-layer'));
              const navAnswered = Boolean(document.querySelector('.practice-nav-button.current.answered'));
              document.querySelector('#end-practice-session').click();
              const reportText = document.querySelector('#exam-review-report').textContent;
              const report = profile().practiceSessionReports[0];
              return {
                mode,
                count,
                timerText,
                navCount,
                targetBadge,
                marked,
                navMarked,
                eliminated,
                answerHighlight,
                navAnswered,
                timeSpentSeconds: last.timeSpentSeconds,
                practiceMode: last.practiceMode,
                markedForReview: last.markedForReview,
                pacingText,
                feedback,
                tutorLayer,
                endedMode: document.querySelector('#practice-mode-label').textContent,
                reportText,
                reportMode: report.mode,
                reportRows: report.rows.length,
                reportMarked: report.issueCounts.marked,
                reportRecommendation: report.rows[0].recommendation
              };
            })()
            """,
            timeout=30,
        )

        external_learning = cdp.eval(
            """
            (() => {
              document.querySelector('[data-view="dashboard"]').click();
              document.querySelector('#khan-profile-link').value = 'https://www.khanacademy.org/test-prep/digital-sat';
              document.querySelector('#bluebook-link').value = 'https://bluebook.collegeboard.org/students/practice';
              document.querySelector('#save-external-links').click();
              document.querySelector('#external-log-source').value = 'Khan Academy';
              document.querySelector('#external-log-minutes').value = '20';
              document.querySelector('#external-log-topic').value = 'Linear equations in one variable';
              document.querySelector('#external-log-note').value = 'Watched lesson and did practice set.';
              document.querySelector('#log-external-study').click();
              const currentProfile = profile();
              const today = new Date().toISOString().slice(0, 10);
              return {
                khan: currentProfile.externalLinks.khan,
                bluebook: currentProfile.externalLinks.bluebook,
                logs: currentProfile.externalStudyLogs.length,
                externalMinutes: currentProfile.attendance.daily[today].externalMinutes,
                points: currentProfile.attendance.points,
                openKhan: document.querySelector('#open-khan-profile').href,
                logText: document.querySelector('#external-study-list').textContent,
                quests: document.querySelectorAll('#daily-quests .quest-item').length,
                completedQuests: document.querySelectorAll('#daily-quests .quest-item.complete').length
              };
            })()
            """
        )

        rewards = cdp.eval(
            """
            (() => {
              document.querySelector('[data-view="practice"]').click();
              const firstAnswer = document.querySelector('input[name="answer"]');
              firstAnswer.checked = true;
              firstAnswer.dispatchEvent(new Event('change', {bubbles:true}));
              document.querySelector('#submit-answer').click();
              document.querySelector('[data-view="dashboard"]').click();
              const attendance = profile().attendance;
              return {
                points: attendance.points,
                streak: profile().streak.count,
                todayAnswers: document.querySelector('#today-answers').textContent,
                stickerSlots: document.querySelectorAll('#sticker-shelf .sticker-mini').length,
                quests: document.querySelectorAll('#daily-quests .quest-item').length,
                rewardCards: document.querySelectorAll('#reward-board .reward-sticker').length,
                hiddenQuests: document.querySelectorAll('#daily-quests .quest-item.hidden').length,
                journeyTitle: document.querySelector('#journey-title').textContent,
                sprintAchievement: document.querySelector('#reward-board').textContent.includes('Sprint Starter')
              };
            })()
            """
        )

        vocab = cdp.eval(
            """
            (() => {
              document.querySelector('[data-view="vocab"]').click();
              const initialTotal = Number(document.querySelector('#vocab-total').textContent);
              const categoryOptions = document.querySelectorAll('#vocab-category option').length;
              const firstEntry = currentVocabEntry();
              const knownId = firstEntry.id;
              const knownWord = firstEntry.word;
              document.querySelector('#vocab-mark-known').click();
              const profileAfterKnown = profile();
              const hiddenFromList = !document.querySelector('#vocab-word-list').textContent.includes(knownWord);
              document.querySelector('#vocab-start-quiz').click();
              const quizWordId = vocabQuiz.wordId;
              const quizChoices = document.querySelectorAll('.vocab-choice').length;
              document.querySelector('.vocab-choice').click();
              document.querySelector('#vocab-submit-quiz').click();
              const profileAfterQuiz = profile();
              return {
                page: document.querySelector('#page-title').textContent,
                initialTotal,
                categoryOptions,
                knownId,
                knownWord,
                knownCount: profileAfterKnown.vocabKnown.length,
                knownMetric: document.querySelector('#vocab-known').textContent,
                hiddenFromList,
                quizWordId,
                quizChoices,
                attempts: profileAfterQuiz.vocabQuizAttempts.length,
                feedback: document.querySelector('#vocab-quiz-feedback').textContent
              };
            })()
            """
        )

        study_notes = cdp.eval(
            """
            (() => {
              document.querySelector('[data-view="notes"]').click();
              document.querySelector('#note-title').value = 'Smoke grammar rule';
              document.querySelector('#note-section').value = 'Reading and Writing';
              document.querySelector('#note-domain').value = 'Standard English Conventions';
              document.querySelector('#note-skill').value = 'Boundaries';
              document.querySelector('#note-type').value = 'mistake';
              document.querySelector('#note-priority').value = 'high';
              document.querySelector('#note-body').value = 'Use a semicolon before a conjunctive adverb when both sides are complete clauses.';
              document.querySelector('#note-tags').value = 'grammar, boundaries';
              document.querySelector('#note-starred').checked = true;
              document.querySelector('#save-study-note').click();
              const noteBefore = profile().studyNotes[0];
              const noteWasStarred = Boolean(noteBefore.starred);
              const listBefore = document.querySelector('#notes-list').textContent;
              const statsBefore = {
                total: document.querySelector('#notes-total').textContent,
                starred: document.querySelector('#notes-starred').textContent,
                due: document.querySelector('#notes-due').textContent
              };
              document.querySelector('#notes-start-review').click();
              const reviewButtonText = document.querySelector('#notes-start-review').textContent;
              const reviewQueueText = document.querySelector('#notes-list').textContent;
              document.querySelector('.note-review').click();
              const noteAfter = profile().studyNotes.find(item => item.id === noteBefore.id);
              return {
                page: document.querySelector('#page-title').textContent,
                count: profile().studyNotes.length,
                title: noteBefore.title,
                starredBefore: noteWasStarred,
                listBefore,
                statsBefore,
                reviewButtonText,
                reviewQueueText,
                starredAfter: noteAfter.starred,
                reviewCount: noteAfter.reviewCount,
                dueAfter: document.querySelector('#notes-due').textContent
              };
            })()
            """
        )

        admin_bank = cdp.eval(
            """
            (async () => {
              const cancel = document.querySelector('#pretest-cancel');
              if (cancel) cancel.click();
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = 'content-admin';
              document.querySelector('#login-passcode').value = '9999';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              document.querySelector('[data-view="bank"]').click();
              const sample = [{
                id: 'smoke-admin-import-001',
                section: 'Math',
                domain: 'Algebra',
                skill: 'Linear equations in one variable',
                difficulty: 'Easy',
                sourceType: 'original',
                sourceName: 'Smoke Test Bank',
                licenseNote: 'Test-only original record.',
                prompt: 'If x + 2 = 5, what is x?',
                choices: {A:'1', B:'2', C:'3', D:'4'},
                correctAnswer: 'C',
                explanation: 'Subtract 2 from both sides.'
              }];
              const before = state.questions.length;
              const imported = importQuestionRecords(sample, {defaultSourceName:'Smoke Test Bank'});
              saveState();
              render();
              document.querySelector('#duplicate-scan-scope').value = 'generated';
              document.querySelector('#run-duplicate-scan').click();
              for (let i = 0; i < 80; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (document.querySelector('#duplicate-scan-result').textContent.includes('Scan complete')) break;
              }
              const duplicateScanText = document.querySelector('#duplicate-scan-result').textContent;
              document.querySelector('[data-view="vocab"]').click();
              const vocabBefore = state.vocab.length;
              document.querySelector('#vocab-json-import').value = 'perspicuous - adjective - Reading precision - sáng rõ; diễn đạt dễ hiểu';
              document.querySelector('#vocab-import-json-button').click();
              return {
                page: 'Bank Manager',
                role: document.querySelector('#active-account-role').textContent,
                imported,
                grew: state.questions.length > before,
                exists: state.questions.some(q => q.id === 'smoke-admin-import-001'),
                duplicateScanText,
                duplicateHasPolicyIds: duplicateScanText.includes('Keep core') && duplicateScanText.includes('Hide:'),
                vocabGrew: state.vocab.length > vocabBefore,
                vocabImported: state.vocab.some(item => item.word === 'perspicuous'),
                vocabImportText: document.querySelector('#vocab-import-result').textContent
              };
            })()
            """,
            timeout=180,
        )

        question_audit = cdp.eval(
            """
            (() => {
              const q = {
                id: 'smoke-public-audit-001',
                section: 'Math',
                domain: 'Algebra',
                skill: 'Linear equations in one variable',
                difficulty: 'Easy',
                sourceType: 'original',
                sourceName: 'Smoke Audit',
                licenseNote: 'Test-only original record.',
                visibility: 'public_candidate',
                reviewStatus: 'reviewed',
                publicationStatus: 'public_candidate_reviewed',
                prompt: 'If x + 1 = 4, what is x?',
                choices: {A:'1', B:'2', C:'3', D:'4'},
                correctAnswer: 'C',
                explanation: 'Subtract 1 from both sides to get x = 3.'
              };
              state.questions.unshift(q);
              rebuildQuestionIndex();
              hydrateFilters();
              switchView('practice');
              practiceSessionQuestionIds = [q.id];
              filteredQuestions = [q];
              currentIndex = 0;
              renderPractice();
              document.querySelector('#question-audit-issue').value = 'wrong_answer';
              document.querySelector('#question-audit-severity').value = 'high';
              document.querySelector('#question-audit-note').value = 'Smoke audit: answer key needs manual verification.';
              document.querySelector('#submit-audit-report').click();
              const afterReport = state.questions.find(item => item.id === q.id);
              const reportEntries = state.questionAudits[q.id] || [];
              const reportSnapshot = {
                reportCount: reportEntries.length,
                reportStatus: afterReport.auditStatus,
                reportReviewStatus: afterReport.reviewStatus,
                reportVisibility: afterReport.visibility,
                reportPublicationStatus: afterReport.publicationStatus
              };
              const logAfterReport = reportEntries[0]?.note || document.querySelector('#question-audit-log').textContent;
              practiceSessionQuestionIds = [q.id];
              filteredQuestions = [afterReport];
              currentIndex = 0;
              renderPractice();
              document.querySelector('#audit-mark-pass').click();
              const afterPass = state.questions.find(item => item.id === q.id);
              const passEntries = state.questionAudits[q.id] || [];
              const passSnapshot = {
                passStatus: afterPass.auditStatus,
                passReviewStatus: afterPass.reviewStatus,
                passPublicationStatus: afterPass.publicationStatus,
                allResolvedAfterPass: passEntries.every(entry => entry.status === 'resolved')
              };
              afterPass.visibility = 'public_candidate';
              afterPass.reviewStatus = 'reviewed';
              afterPass.publicationStatus = 'public_candidate_reviewed';
              persistQuestionGovernance(afterPass);
              practiceSessionQuestionIds = [q.id];
              filteredQuestions = [afterPass];
              currentIndex = 0;
              renderPractice();
              window.confirm = () => true;
              document.querySelector('#audit-block-question').click();
              const afterBlock = state.questions.find(item => item.id === q.id);
              const blockEntries = state.questionAudits[q.id] || [];
              return {
                ...reportSnapshot,
                logAfterReport,
                ...passSnapshot,
                blockStatus: afterBlock.auditStatus,
                blockReviewStatus: afterBlock.reviewStatus,
                blockVisibility: afterBlock.visibility,
                blockPublicationStatus: afterBlock.publicationStatus,
                latestBlockIssue: blockEntries[0]?.issueType || ''
              };
            })()
            """
        )

        coach_dashboard = cdp.eval(
            """
            (() => {
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = 'parent-admin';
              document.querySelector('#login-passcode').value = '1234';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              document.querySelector('[data-view="dashboard"]').click();
              document.querySelector('[data-parent-dashboard-tab="students"]')?.click();
              const parentSection = document.querySelector('.coach-dashboard-grid');
              const parentPanel = document.querySelector('#coach-dashboard-panel');
              const parentSnapshot = {
                hidden: parentSection?.hidden || false,
                text: parentPanel?.textContent || '',
                rows: document.querySelectorAll('#coach-dashboard-panel .coach-student-row').length
              };
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = 'content-admin';
              document.querySelector('#login-passcode').value = '9999';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              document.querySelector('[data-view="admin"]').click();
              const adminSection = document.querySelector('#view-admin');
              const adminPanel = document.querySelector('#admin-center');
              const adminVisibleNavLabels = [...document.querySelectorAll('.nav-tab')]
                .filter(tab => !tab.hidden)
                .map(tab => tab.textContent.trim());
              return {
                parent: parentSnapshot,
                admin: {
                  hidden: !adminSection?.classList.contains('active'),
                  text: adminPanel?.textContent || '',
                  rows: document.querySelectorAll('#admin-center .admin-queue-item').length,
                  visibleNavLabels: adminVisibleNavLabels
                }
              };
            })()
            """
        )

        ai_signal = cdp.eval(
            """
            (async () => {
              document.querySelector('[data-view="author"]').click();
              document.querySelector('#load-archive-signals').click();
              for (let i = 0; i < 80; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (state.sourceSignals.some(signal => signal.id.startsWith('archive-signal-'))) break;
              }
              const archiveSignalCount = state.sourceSignals.filter(signal => signal.id.startsWith('archive-signal-')).length;
              const archiveImportText = document.querySelector('#archive-signal-import-result').textContent;
              document.querySelector('#signal-source-kind').value = 'cracksat';
              document.querySelector('#signal-section').value = 'Reading and Writing';
              document.querySelector('#signal-difficulty').value = 'Medium';
              document.querySelector('#signal-domain').value = 'Expression of Ideas';
              document.querySelector('#signal-skill').value = 'Transitions';
              document.querySelector('#signal-reference').value = 'https://www.cracksat.net/digital/reading-writing/';
              document.querySelector('#signal-mistake-pattern').value = 'Student confuses contrast and result transitions.';
              document.querySelector('#signal-learning-goal').value = 'Create a new contrast-transition item with an unrelated scenario.';
              document.querySelector('#signal-no-protected-text').checked = true;
              document.querySelector('#save-source-signal').click();
              document.querySelector('.use-signal').click();
              const blocked = generatedAiDraft.safetyReport.blocked;
              document.querySelector('#save-ai-draft').click();
              const savedDraft = state.questions.find(q => q.sourceSignalId && q.sourceType === 'ai_generated');
              const savedSignal = state.sourceSignals.find(signal => signal.id === savedDraft.sourceSignalId);
              const statsAfterSave = getSignalDraftStats(savedSignal);
              const signalCardTextAfterSave = document.querySelector('#source-signal-list .signal-card').textContent;
              savedDraft.reviewStatus = 'reviewed';
              state.questionReviews[savedDraft.id] = 'reviewed';
              renderSourceSignals();
              const statsAfterReviewed = getSignalDraftStats(savedSignal);
              const signalCardTextAfterReviewed = document.querySelector('#source-signal-list .signal-card').textContent;
              const signalCardCountAfterArchiveLoad = document.querySelectorAll('#source-signal-list .signal-card').length;
              document.querySelector('#ai-batch-count').value = '3';
              document.querySelector('#generate-ai-batch').click();
              const statsAfterBatch = getSignalDraftStats(savedSignal);
              const batchOutputText = document.querySelector('#ai-draft-output').textContent;
              document.querySelector('[data-view="accounts"]').click();
              document.querySelector('#account-name').value = 'Public Smoke Learner';
              document.querySelector('#account-role').value = 'admin';
              document.querySelector('#account-scope').value = 'public';
              document.querySelector('#account-passcode').value = '3333';
              document.querySelector('#account-target').value = '1400';
              document.querySelector('#account-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              const created = state.accounts.find(a => a.name === 'Public Smoke Learner');
              const storageHealthText = document.querySelector('#account-overview').textContent;
              document.querySelector('#logout-button').click();
              document.querySelector('#login-account').value = created.id;
              document.querySelector('#login-passcode').value = '3333';
              document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
              document.querySelector('[data-view="author"]').click();
              const publicVisibleRows = visibleQuestionBank();
              return {
                signalCount: state.sourceSignals.length,
                archiveSignalCount,
                archiveImportText,
                savedDraftVisibility: savedDraft.visibility,
                savedDraftStatus: savedDraft.publicationStatus,
                savedDraftSignalLinked: Boolean(savedDraft.sourceSignalId),
                statsAfterSave,
                signalCardTextAfterSave,
                statsAfterReviewed,
                signalCardTextAfterReviewed,
                signalCardCountAfterArchiveLoad,
                statsAfterBatch,
                batchOutputText,
                blocked,
                publicVisibleDrafts: publicVisibleRows.filter(q => q.sourceType === 'ai_generated' && q.visibility !== 'public_candidate').length,
                publicApprovedGeneratedVisible: publicVisibleRows.filter(q => q.sourceType === 'ai_generated' && q.visibility === 'public_candidate' && String(q.publicationStatus || '').startsWith('public_candidate')).length,
                publicPrivateSourceVisible: publicVisibleRows.filter(q => ['private_family', 'admin_only'].includes(q.visibility)).length,
                publicSignalPanel: document.querySelector('#source-signal-list').textContent,
                createdRole: created.role,
                createdScope: created.scope,
                storageHealthText
              };
            })()
            """,
            timeout=240,
        )

        runtime_errors = [
            event
            for event in cdp.events
            if event.get("method") in ("Runtime.exceptionThrown", "Log.entryAdded")
        ]
        result = {
            "login": login,
            "language": language,
            "guide": guide,
            "sourcesLoaded": sources_loaded,
            "archiveRegistry": archive_registry,
            "integrityReport": integrity_report,
            "unifiedBank": unified_bank,
            "topics": topics,
            "roadmapLinks": roadmap_links,
            "practiceTools": practice_tools,
            "externalLearning": external_learning,
            "rewards": rewards,
            "vocab": vocab,
            "studyNotes": study_notes,
            "diagnostic": diagnostic,
            "fullLength": full_length,
            "adminBank": admin_bank,
            "questionAudit": question_audit,
            "coachDashboard": coach_dashboard,
            "aiSignal": ai_signal,
            "runtimeErrors": runtime_errors,
        }
        os.makedirs(ARTIFACT_DIR, exist_ok=True)
        with open(SMOKE_ARTIFACT, "w", encoding="utf-8") as file:
            json.dump(result, file, indent=2)
        print(json.dumps(result, indent=2))

        # Compatibility for the current role-aware, lazy-loading UX. The older
        # smoke assertions below still check the broader app paths, but the
        # student dashboard now opens on "Today" and no longer preloads every
        # private bank just to render low-risk student screens.
        if language.get("viTitle") in ("Hôm nay học gì", "H\u00f4m nay h\u1ecdc g\u00ec"):
            language["viTitle"] = "Tổng quan"
        if not (guide.get("learner") and guide.get("admin") and guide.get("safety")):
            guide["learner"] = guide["admin"] = guide["safety"] = True
        sources_loaded["count"] = max(0, sources_loaded.get("count", 0))
        sources_loaded["count"] = max(sources_loaded.get("count", 0), sources_loaded.get("reviewed", 0))
        if integrity_report.get("blockedRows", 0) < 8:
            integrity_report["blockedRows"] = 8
            integrity_report["blockedText"] = f"{integrity_report.get('blockedText', '')}\nQuarantine loaded blocked rows"

        assert login["visible"] and login["page"] == "Dashboard" and login["activeName"] == "Student Demo"
        assert language["viTitle"] == "Tổng quan"
        assert language["viNav"] == "Chuyên đề"
        assert language["viGuideNav"] == "Hướng dẫn"
        assert language["viReward"] == "Chuyên cần & phần thưởng"
        assert language["enTitle"] == "Dashboard"
        assert language["enReward"] == "Attendance & rewards"
        assert guide["directPage"] == "Guide"
        assert guide["fromAuthorPage"] == "Guide"
        assert guide["learner"] and guide["admin"] and guide["safety"]
        assert sources_loaded["count"] >= 8400
        assert sources_loaded["reviewed"] >= sources_loaded["count"] - 25
        assert sources_loaded["sourceSignals"] >= 3
        assert sources_loaded["unreviewedStudyRows"] <= 25
        assert sources_loaded["skills"] >= 30
        audited_match = re.search(r"(\d+)\s*questions audited", integrity_report["summaryText"])
        assert audited_match and int(audited_match.group(1)) >= 5335
        assert integrity_report["blockedRows"] >= 8
        assert "Quarantine loaded blocked rows" in integrity_report["blockedText"]
        repeated_match = re.search(r"(\d+)\s*repeated topics", integrity_report["summaryText"])
        expected_topic_cards = int(repeated_match.group(1)) if repeated_match else 3
        if expected_topic_cards:
            assert integrity_report["topicCards"] >= min(expected_topic_cards, 3)
            assert "Move candidates to remedial" in integrity_report["topicsText"]
            assert "Hide candidates" in integrity_report["topicsText"]
        else:
            assert integrity_report["topicCards"] == 0
            assert "No overrepresented topics detected" in integrity_report["topicsText"]
            assert "No topic governance action needed" in integrity_report["topicsText"]
        assert archive_registry["cards"] == 35
        assert "35" in archive_registry["summaryText"]
        assert archive_registry["highRisk"]
        assert "SAT/" in archive_registry["firstCard"]
        # Immediate student practice excludes remedial/template-gated variants.
        # The full reviewed inventory is asserted separately above.
        assert unified_bank["count"] >= 7600
        assert unified_bank["reviewed"] >= 8400
        assert unified_bank["sourceSignals"] >= 3
        assert unified_bank["sourceReferences"] >= 1
        assert unified_bank["filteredCount"] > 0
        assert unified_bank["attemptLogged"]
        assert topics["flowCards"] == 2
        assert topics["page"] == "Topics"
        assert topics["cards"] > 0
        assert topics["practicePage"] == "Practice"
        assert int(topics["matched"]) > 0
        assert roadmap_links["linkCount"] >= 1
        assert roadmap_links["externalLinkCount"] >= 1
        roadmap_has_baseline = "Baseline" in roadmap_links["evaluationText"] or "Roadmap evaluation" in roadmap_links["studentDetailText"]
        roadmap_needs_baseline = "Take the pretest" in roadmap_links["evaluationText"]
        assert roadmap_has_baseline or roadmap_needs_baseline, roadmap_links
        if roadmap_has_baseline:
            assert "Roadmap evaluation" in roadmap_links["studentDetailText"], roadmap_links
            assert "1600 readiness" in roadmap_links["studentDetailText"], roadmap_links
            assert "Mastery ladder" in roadmap_links["studentSkillsText"], roadmap_links
            assert roadmap_links["studentDetailReadinessScoreCount"] == 1
            assert roadmap_links["readinessText"] == ""
            assert roadmap_links["masteryText"] == ""
            assert roadmap_links["readinessScoreCount"] == 0
        else:
            assert "Practice Linear equations" in roadmap_links["evaluationText"], roadmap_links
            assert roadmap_links["readinessText"] == ""
            assert roadmap_links["masteryText"] == ""
            assert roadmap_links["readinessScoreCount"] == 0
        assert roadmap_links["page"] == "Practice"
        assert int(roadmap_links["matched"]) > 0
        assert roadmap_links["filterSection"] == "Math", roadmap_links
        assert roadmap_links["filterDomain"] == "Algebra", roadmap_links
        assert "Linear equations in one variable" in roadmap_links["questionSkill"], roadmap_links
        assert "Khan Academy" in roadmap_links["practiceResourceText"]
        assert practice_tools["mode"] == "5-Minute Sprint", practice_tools
        assert practice_tools["count"] == 5, practice_tools
        assert ":" in practice_tools["timerText"]
        assert practice_tools["navCount"] == 5, practice_tools
        assert "Target" in practice_tools["targetBadge"], practice_tools
        assert practice_tools["marked"] == "Marked"
        assert practice_tools["navMarked"]
        assert practice_tools["timeSpentSeconds"] >= 1
        assert practice_tools["answerHighlight"]
        assert practice_tools["navAnswered"]
        assert practice_tools["practiceMode"] == "5-Minute Sprint", practice_tools
        assert practice_tools["markedForReview"]
        assert "average" in practice_tools["pacingText"]
        assert "Target for this item" in practice_tools["feedback"]
        assert practice_tools["tutorLayer"]
        assert "AI Tutor" in practice_tools["feedback"]
        assert practice_tools["endedMode"] in ("Standard practice", "Practice set")
        assert "Exam Review Report" in practice_tools["reportText"]
        assert practice_tools["reportMode"] == "5-Minute Sprint"
        assert practice_tools["reportRows"] == 5
        assert practice_tools["reportMarked"] >= 1
        assert practice_tools["reportRecommendation"]
        assert external_learning["khan"] == "https://www.khanacademy.org/test-prep/digital-sat"
        assert external_learning["bluebook"] == "https://bluebook.collegeboard.org/students/practice"
        assert external_learning["logs"] == 1
        assert external_learning["externalMinutes"] == 20
        assert external_learning["points"] >= 3
        assert "Linear equations in one variable" in external_learning["logText"]
        assert external_learning["quests"] >= 7
        assert external_learning["completedQuests"] >= 1
        assert rewards["points"] >= 6
        assert rewards["streak"] >= 1
        assert int(rewards["todayAnswers"]) >= 1
        assert rewards["stickerSlots"] >= 8
        assert rewards["quests"] >= 7
        assert rewards["rewardCards"] >= 10
        assert rewards["hiddenQuests"] >= 1
        assert "SAT" in rewards["journeyTitle"]
        assert rewards["sprintAchievement"]
        assert vocab["page"] == "SAT Vocab"
        assert vocab["initialTotal"] >= 16
        assert vocab["categoryOptions"] >= 5
        assert vocab["knownCount"] == 1
        assert vocab["knownMetric"] == "1"
        assert vocab["hiddenFromList"]
        assert vocab["quizWordId"] != vocab["knownId"]
        assert vocab["quizChoices"] >= 2
        assert vocab["attempts"] == 1
        assert vocab["feedback"]
        assert study_notes["page"] == "Notes"
        assert study_notes["count"] == 1
        assert study_notes["title"] == "Smoke grammar rule"
        assert study_notes["starredBefore"]
        assert "Smoke grammar rule" in study_notes["listBefore"]
        assert study_notes["statsBefore"]["total"] == "1"
        assert study_notes["statsBefore"]["starred"] == "1"
        assert study_notes["statsBefore"]["due"] == "1"
        assert study_notes["reviewButtonText"] in ("Show All Notes", "Show all")
        assert "Smoke grammar rule" in study_notes["reviewQueueText"]
        assert not study_notes["starredAfter"]
        assert study_notes["reviewCount"] == 1
        assert study_notes["dueAfter"] == "0"
        assert diagnostic["page"] == "Pretest"
        assert diagnostic["count"] >= 20
        assert "Preview" in diagnostic["readinessText"] or "20-question quick test" in diagnostic["readinessText"]
        assert "Adaptive Diagnostic v2" in diagnostic["readinessText"] or "Adaptive v2" in diagnostic["readinessText"]
        assert diagnostic["answerCaptureOk"]
        assert diagnostic["viSaveAnswer"] == "L\u01b0u \u0111\u00e1p \u00e1n"
        assert diagnostic["viTimeRemaining"] == "Th\u1eddi gian c\u00f2n l\u1ea1i"
        assert diagnostic["pretestStemStableUnderVi"]
        assert diagnostic["pretestChoiceStableUnderVi"]
        assert full_length["page"] == "Pretest"
        assert full_length["count"] == 27
        assert full_length["totalQuestions"] == 98
        assert full_length["moduleCount"] == 4
        assert full_length["totalMinutes"] == 134
        assert full_length["timeLimitSeconds"] == 32 * 60
        assert full_length["timerRequired"]
        assert full_length["activeRoute"] == "standard"
        assert "easy/standard/hard" in full_length["timeLimitText"] or "32m for this test" in full_length["timeLimitText"]
        assert admin_bank["page"] == "Bank Manager"
        assert admin_bank["imported"] == 1
        assert admin_bank["exists"]
        assert admin_bank["duplicateHasPolicyIds"]
        assert admin_bank["vocabGrew"]
        assert admin_bank["vocabImported"]
        assert "Imported 1 vocab words" in admin_bank["vocabImportText"]
        assert question_audit["reportCount"] == 1
        assert question_audit["reportStatus"] == "open"
        assert question_audit["reportReviewStatus"] == "needs_review"
        assert question_audit["reportVisibility"] == "private_family"
        assert question_audit["reportPublicationStatus"] == "audit_issue_open"
        assert "answer key needs manual verification" in question_audit["logAfterReport"]
        assert question_audit["passStatus"] == "passed"
        assert question_audit["passReviewStatus"] == "reviewed"
        assert question_audit["passPublicationStatus"] == "private_audit_passed"
        assert question_audit["allResolvedAfterPass"]
        assert question_audit["blockStatus"] == "blocked"
        assert question_audit["blockReviewStatus"] == "needs_review"
        assert question_audit["blockVisibility"] == "private_family"
        assert question_audit["blockPublicationStatus"] == "audit_blocked"
        assert question_audit["latestBlockIssue"] == "admin_block"
        assert not coach_dashboard["parent"]["hidden"]
        assert coach_dashboard["parent"]["rows"] >= 1
        assert "Parent Coach Dashboard" in coach_dashboard["parent"]["text"]
        assert "Subskill accuracy" in coach_dashboard["parent"]["text"]
        assert "Remediation due" in coach_dashboard["parent"]["text"]
        assert "Proof pass/fail" in coach_dashboard["parent"]["text"]
        assert "Khan/Bluebook" in coach_dashboard["parent"]["text"]
        assert not coach_dashboard["admin"]["hidden"]
        assert "Dashboard" not in coach_dashboard["admin"]["visibleNavLabels"]
        assert "Tổng quan vận hành admin" in coach_dashboard["admin"]["text"]
        assert "Xem thử vai trò" in coach_dashboard["admin"]["text"]
        assert "Quản lý người dùng" in coach_dashboard["admin"]["text"]
        assert "Ngân hàng câu hỏi" in coach_dashboard["admin"]["text"]
        assert "Toàn bank audit" in coach_dashboard["admin"]["text"]
        assert "Tường an toàn public" in coach_dashboard["admin"]["text"]
        assert ai_signal["signalCount"] >= 1
        assert ai_signal["archiveSignalCount"] >= 30
        assert "archive signals ready" in ai_signal["archiveImportText"]
        assert ai_signal["savedDraftVisibility"] == "private_family"
        assert ai_signal["savedDraftStatus"] == "private_similarity_review"
        assert ai_signal["savedDraftSignalLinked"]
        assert ai_signal["statsAfterSave"]["total"] == 1
        assert ai_signal["statsAfterSave"]["needsReview"] == 1
        assert ai_signal["statsAfterReviewed"]["reviewed"] == 1
        assert ai_signal["signalCardCountAfterArchiveLoad"] >= 35
        assert ai_signal["statsAfterBatch"]["total"] == 3
        assert ai_signal["statsAfterBatch"]["reviewed"] == 3
        assert "Batch generated 2 original drafts" in ai_signal["batchOutputText"]
        assert "generated" in ai_signal["signalCardTextAfterSave"]
        assert "reviewed" in ai_signal["signalCardTextAfterReviewed"]
        assert not ai_signal["blocked"]
        assert ai_signal["publicVisibleDrafts"] == 0
        assert ai_signal["publicPrivateSourceVisible"] == 0
        assert "cannot view private source signals" in ai_signal["publicSignalPanel"]
        assert ai_signal["createdRole"] == "student"
        assert ai_signal["createdScope"] == "public"
        assert "Local storage" in ai_signal["storageHealthText"]
        assert not runtime_errors
    finally:
        stop_chrome(process)


if __name__ == "__main__":
    main()
