import argparse
import json
from pathlib import Path

from browser_smoke_test import CdpClient, ROOT_URL, find_free_port, get_page_tab, start_chrome, stop_chrome


ROOT = Path(__file__).resolve().parents[1]
FILE_URL = ROOT.joinpath("index.html").resolve().as_uri() + "?"

ROLES = [
    {"id": "content-admin", "passcode": "9999", "label": "content"},
    {"id": "parent-admin", "passcode": "1234", "label": "parent"},
    {"id": "student-demo", "passcode": "1111", "label": "student"},
]


def wait_for_login(cdp):
    return cdp.eval(
        """
        (async () => {
          for (let i = 0; i < 200; i++) {
            const account = document.querySelector('#login-account');
            const appReady = window.SAT_STUDIO_READY === true || document.body?.dataset?.satStudioReady === 'true';
            if (appReady && account && account.querySelector('option[value="student-demo"]')) return true;
            await new Promise(r => setTimeout(r, 100));
          }
          return false;
        })()
        """,
        timeout=45,
    )


def role_snapshot(cdp, role):
    payload = json.dumps(role)
    return cdp.eval(
        f"""
        (async () => {{
          const role = {payload};
          if (!document.querySelector('#app-shell').hidden) {{
            document.querySelector('#logout-button').click();
            for (let i = 0; i < 80; i++) {{
              if (!document.querySelector('#login-screen').hidden) break;
              await new Promise(r => setTimeout(r, 100));
            }}
          }}
          const accountOptions = [...document.querySelectorAll('#login-account option')].map(option => option.textContent.trim());
          const demoButton = document.querySelector(`.demo-login-button[data-demo-account="${{role.id}}"]`);
          if (demoButton) {{
            demoButton.click();
          }} else {{
            document.querySelector('#login-account').value = role.id;
            document.querySelector('#login-passcode').value = role.passcode;
            document.querySelector('#login-form').dispatchEvent(new Event('submit', {{bubbles:true, cancelable:true}}));
          }}
          for (let i = 0; i < 120; i++) {{
            if (!document.querySelector('#app-shell').hidden) break;
            await new Promise(r => setTimeout(r, 100));
          }}
          const openView = async (view) => {{
            const tab = document.querySelector(`[data-view="${{view}}"]`);
            if (!tab) return "";
            tab.click();
            await new Promise(r => setTimeout(r, 150));
            return document.querySelector(`#view-${{view}}`)?.textContent || "";
          }};
          const isVisible = (selector) => {{
            const node = document.querySelector(selector);
            if (!node || node.hidden) return false;
            const style = window.getComputedStyle(node);
            return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
          }};
          const isNodeVisible = (node) => {{
            const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
            if (!element || !element.closest || element.closest('[hidden], script, style, template')) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
          }};
          const visibleText = (root) => {{
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {{
              acceptNode(node) {{
                const text = String(node.nodeValue || '').trim();
                return text && isNodeVisible(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }}
            }});
            const parts = [];
            while (walker.nextNode()) parts.push(walker.currentNode.nodeValue.trim());
            return parts.join(' ');
          }};
          const initialPage = document.querySelector('#page-title')?.textContent || '';
          const adminText = role.id === 'content-admin' ? await openView('admin') : "";
          const dashboardText = await openView('dashboard');
          const dashboardVisibility = {{
            studentHomeVisible: isVisible('#student-home'),
            parentHomeVisible: isVisible('#parent-home'),
            metricsVisible: isVisible('.metrics-grid')
          }};
          const bankText = role.id === 'content-admin' ? await openView('bank') : "";
          const sourcesText = role.id === 'content-admin' ? await openView('sources') : "";
          const authorText = role.id === 'content-admin' ? await openView('author') : "";
          const accountsText = role.id !== 'student-demo' ? await openView('accounts') : "";
          const lessonsText = role.id === 'student-demo' ? await openView('lessons') : "";
          const practiceText = role.id === 'student-demo' ? await openView('practice') : "";
          return {{
            role: role.label,
            id: role.id,
            loggedIn: !document.querySelector('#app-shell').hidden,
            accountOptions,
            activeName: document.querySelector('#active-account-name')?.textContent || '',
            activeRole: document.querySelector('#active-account-role')?.textContent || '',
            initialPage,
            navCount: document.querySelectorAll('.nav-tab').length,
            visibleNavCount: [...document.querySelectorAll('.nav-tab')].filter(tab => !tab.hidden).length,
            visibleNavLabels: [...document.querySelectorAll('.nav-tab')].filter(tab => !tab.hidden).map(tab => tab.textContent.trim()),
            adminCenter: {{
              visible: adminText.includes('Tổng quan vận hành admin'),
              release: adminText.includes('Hệ thống sạch blocker') || adminText.includes('Cần xử lý blocker hệ thống') || adminText.includes('Đang tải report admin'),
              queue: adminText.includes('Hộp việc ưu tiên'),
              cockpit: adminText.includes('Bảng điều phối admin'),
              scopeLedger: adminText.includes('Scope số liệu'),
              reviewSop: adminText.includes('Review SOP') && adminText.includes('Chỉ duyệt khi qua đủ 6 cửa'),
              specificActions: adminText.includes('Mở Sources') || adminText.includes('Mở Bank') || adminText.includes('Mở tạo câu'),
              publicRelease: adminText.includes('Cổng phát hành public'),
              userOps: adminText.includes('Quản lý người dùng'),
              questionSystem: adminText.includes('Ngân hàng câu hỏi'),
              firewall: adminText.includes('Tường an toàn public'),
              previewParent: Boolean(document.querySelector('.admin-impersonate-button[data-admin-account-target="parent-admin"]')),
              previewStudent: Boolean(document.querySelector('.admin-impersonate-button[data-admin-account-target="student-demo"]')),
              auditedTotal: adminText.includes('7608') || adminText.includes('Toàn bank audit')
            }},
            dashboard: {{
              hasParentCoach: dashboardText.includes('Parent Coach Dashboard'),
              hasAdminCoach: dashboardText.includes('Admin Coach Dashboard'),
              hasStudentNextAction: dashboardText.includes('Next best action') || dashboardText.includes('Current focus'),
              textSample: dashboardText.slice(0, 500),
              ...dashboardVisibility
            }},
            content: {{
              bankManager: bankText.includes('Run Duplicate Scan') || bankText.includes('Import') || bankText.includes('duplicate'),
              sourceRegistry: sourcesText.includes('Source registry') || sourcesText.includes('Original Draft'),
              authoring: authorText.includes('Source signals') || authorText.includes('Generate')
            }},
            parent: {{
              accountsVisible: accountsText.includes('Family accounts'),
              coachVisible: dashboardText.includes('Parent Coach Dashboard')
            }},
            student: {{
              lessonsVisible: lessonsText.includes('Lesson') || lessonsText.includes('Concept'),
              practiceVisible: practiceText.includes('Standard practice') || practiceText.includes('Submit Answer') || practiceText.includes('Target time') || practiceText.includes('Luyện tập') || practiceText.includes('Kiểm tra') || practiceText.includes('Mốc thời gian'),
              visibleLeakage: role.id === 'student-demo' && window.SatRoleBoundaryEngine?.scanStudentUiLeakage
                ? window.SatRoleBoundaryEngine.scanStudentUiLeakage(visibleText(document.body))
                : []
            }}
          }};
        }})()
        """,
        timeout=120,
    )


def passcode_only_snapshot(cdp):
    return cdp.eval(
        """
        (async () => {
          if (!document.querySelector('#app-shell').hidden) {
            document.querySelector('#logout-button').click();
            for (let i = 0; i < 80; i++) {
              if (!document.querySelector('#login-screen').hidden) break;
              await new Promise(r => setTimeout(r, 100));
            }
          }
          document.querySelector('#login-account').value = '';
          document.querySelector('#login-passcode').value = '1111';
          document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
          for (let i = 0; i < 120; i++) {
            if (!document.querySelector('#app-shell').hidden) break;
            await new Promise(r => setTimeout(r, 100));
          }
          return {
            loggedIn: !document.querySelector('#app-shell').hidden,
            activeName: document.querySelector('#active-account-name')?.textContent || '',
            activeRole: document.querySelector('#active-account-role')?.textContent || ''
          };
        })()
        """,
        timeout=45,
    )


def admin_preview_snapshot(cdp):
    return cdp.eval(
        """
        (async () => {
          const loginAsAdmin = async () => {
            if (!document.querySelector('#app-shell').hidden) {
              document.querySelector('#logout-button').click();
              for (let i = 0; i < 80; i++) {
                if (!document.querySelector('#login-screen').hidden) break;
                await new Promise(r => setTimeout(r, 100));
              }
            }
            document.querySelector('#login-account').value = 'content-admin';
            document.querySelector('#login-passcode').value = '9999';
            document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
            for (let i = 0; i < 120; i++) {
              if (!document.querySelector('#app-shell').hidden && document.querySelector('#active-account-name')?.textContent === 'Content Admin') break;
              await new Promise(r => setTimeout(r, 100));
            }
            document.querySelector('[data-view="admin"]')?.click();
            await new Promise(r => setTimeout(r, 150));
          };
          await loginAsAdmin();
          const parentButton = document.querySelector('.admin-impersonate-button[data-admin-account-target="parent-admin"]');
          const studentButton = document.querySelector('.admin-impersonate-button[data-admin-account-target="student-demo"]');
          const hasTabs = Boolean(parentButton && studentButton);
          parentButton?.click();
          for (let i = 0; i < 80; i++) {
            if (document.querySelector('#active-account-name')?.textContent === 'Parent Admin') break;
            await new Promise(r => setTimeout(r, 100));
          }
          const parentName = document.querySelector('#active-account-name')?.textContent || '';
          const parentPage = document.querySelector('#page-title')?.textContent || '';
          await loginAsAdmin();
          document.querySelector('.admin-impersonate-button[data-admin-account-target="student-demo"]')?.click();
          for (let i = 0; i < 80; i++) {
            if (document.querySelector('#active-account-name')?.textContent === 'Student Demo') break;
            await new Promise(r => setTimeout(r, 100));
          }
          return {
            hasTabs,
            parentName,
            parentPage,
            studentName: document.querySelector('#active-account-name')?.textContent || '',
            studentPage: document.querySelector('#page-title')?.textContent || ''
          };
        })()
        """,
        timeout=120,
    )


def signup_snapshot(cdp):
    return cdp.eval(
        """
        (async () => {
          if (!document.querySelector('#app-shell').hidden) {
            document.querySelector('#logout-button').click();
            for (let i = 0; i < 80; i++) {
              if (!document.querySelector('#login-screen').hidden) break;
              await new Promise(r => setTimeout(r, 100));
            }
          }
          document.querySelector('#show-signup')?.click();
          for (let i = 0; i < 40; i++) {
            if (document.querySelector('#signup-form') && !document.querySelector('#signup-form').hidden) break;
            await new Promise(r => setTimeout(r, 50));
          }
          document.querySelector('#signup-name').value = 'New Learner';
          document.querySelector('#signup-email').value = 'new.learner@example.com';
          document.querySelector('#signup-grade').value = 'Grade 10';
          document.querySelector('#signup-passcode').value = '2468';
          document.querySelector('#signup-target').value = '1480';
          document.querySelector('#signup-avatar-initials').value = 'NL';
          document.querySelector('#signup-avatar-color').value = 'amber';
          document.querySelector('#signup-theme').value = 'teen_quest';
          document.querySelector('#signup-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
          for (let i = 0; i < 120; i++) {
            if (!document.querySelector('#app-shell').hidden && document.querySelector('#active-account-name')?.textContent === 'New Learner') break;
            await new Promise(r => setTimeout(r, 100));
          }
          const focusText = document.querySelector('#student-focus-card')?.textContent || '';
          return {
            loggedIn: !document.querySelector('#app-shell').hidden,
            activeName: document.querySelector('#active-account-name')?.textContent || '',
            activeRole: document.querySelector('#active-account-role')?.textContent || '',
            avatar: document.querySelector('#active-account-avatar')?.textContent || '',
            avatarClass: document.querySelector('#active-account-avatar')?.className || '',
            studentHomeVisible: Boolean(document.querySelector('#student-home') && !document.querySelector('#student-home').hidden),
            focusText,
            accountOption: [...document.querySelectorAll('#login-account option')].some(option => option.textContent.includes('New Learner')),
            storedAccount: Boolean(state.accounts.find(account => account.name === 'New Learner' && account.email === 'new.learner@example.com' && account.gradeLevel === 'Grade 10'))
          };
        })()
        """,
        timeout=60,
    )


def reward_snapshot(cdp):
    return cdp.eval(
        """
        (async () => {
          const sleep = (ms) => new Promise(r => setTimeout(r, ms));
          const isVisible = (selector) => {
            const node = document.querySelector(selector);
            if (!node || node.hidden) return false;
            const style = window.getComputedStyle(node);
            return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
          };
          const login = async (id, passcode) => {
            if (!document.querySelector('#app-shell').hidden) {
              document.querySelector('#logout-button').click();
              for (let i = 0; i < 80; i++) {
                if (!document.querySelector('#login-screen').hidden) break;
                await sleep(100);
              }
            }
            document.querySelector('#login-account').value = id;
            document.querySelector('#login-passcode').value = passcode;
            document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
            for (let i = 0; i < 120; i++) {
              if (!document.querySelector('#app-shell').hidden && document.querySelector('#active-account-name')?.textContent) break;
              await sleep(100);
            }
          };
          const openView = async (view) => {
            document.querySelector(`[data-view="${view}"]`)?.click();
            await sleep(200);
            return document.querySelector(`#view-${view}`)?.textContent || "";
          };
          const openAccountTab = async (tab) => {
            document.querySelector(`[data-account-tab="${tab}"]`)?.click();
            await sleep(100);
          };
          state.rewardPrograms = (state.rewardPrograms || []).filter(program => !String(program.title || '').startsWith('Smoke '));
          state.rewardClaims = (state.rewardClaims || []).filter(claim => !String(claim.programId || '').startsWith('reward-smoke'));
          saveState();

          await login('content-admin', '9999');
          await openView('accounts');
          await openAccountTab('rewards');
          const adminPanelVisible = isVisible('#reward-admin-panel');
          const adminPermissionsLine = document.querySelector('#account-list')?.textContent.includes('Full system permissions');
          document.querySelector('#reward-title').value = 'Smoke global reward';
          document.querySelector('#reward-cost').value = '5';
          document.querySelector('#reward-scope').value = 'global';
          document.querySelector('#reward-type').value = 'privilege';
          document.querySelector('#reward-status').value = 'active';
          document.querySelector('#reward-description').value = 'Pick the warm-up topic.';
          document.querySelector('#reward-program-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
          await sleep(250);
          const adminProgram = (state.rewardPrograms || []).find(program => program.title === 'Smoke global reward');
          const adminProgramListed = document.querySelector('#reward-admin-list')?.textContent.includes('Smoke global reward');

          await login('parent-admin', '1234');
          await openView('accounts');
          await openAccountTab('rewards');
          const parentPanelVisible = isVisible('#reward-admin-panel');
          const parentScopeDisabled = Boolean(document.querySelector('#reward-scope')?.disabled);
          const parentAuthoringVisible = [...document.querySelectorAll('.nav-tab')]
            .some(tab => tab.dataset.view === 'author' && !tab.hidden);
          document.querySelector('#reward-title').value = 'Smoke parent reward';
          document.querySelector('#reward-cost').value = '7';
          document.querySelector('#reward-target-student').value = 'student-demo';
          document.querySelector('#reward-type').value = 'parent_reward';
          document.querySelector('#reward-status').value = 'active';
          document.querySelector('#reward-description').value = 'Parent-visible voucher.';
          document.querySelector('#reward-program-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
          await sleep(250);
          const parentProgram = (state.rewardPrograms || []).find(program => program.title === 'Smoke parent reward');
          const parentProgramListed = document.querySelector('#reward-admin-list')?.textContent.includes('Smoke parent reward');

          await login('student-demo', '1111');
          const p = accountProfile('student-demo');
          p.attendance.points = Math.max(Number(p.attendance.points || 0), 100);
          p.attendance.spentPoints = 0;
          saveState();
          await openView('dashboard');
          renderRewards();
          await sleep(250);
          const storeText = document.querySelector('#student-reward-store')?.textContent || '';
          const parentRewardButton = document.querySelector(`[data-reward-action="redeem"][data-reward-id="${parentProgram?.id || ''}"]`);
          parentRewardButton?.click();
          await sleep(250);
          const claim = (state.rewardClaims || []).find(item => item.programId === parentProgram?.id && item.studentId === 'student-demo');
          const claimPending = claim?.status === 'pending';
          const spentAfterClaim = accountProfile('student-demo').attendance.spentPoints;

          await login('parent-admin', '1234');
          await openView('accounts');
          await openAccountTab('rewards');
          const claimVisibleToParent = document.querySelector('#reward-admin-list')?.textContent.includes('Smoke parent reward');
          document.querySelector(`[data-reward-admin-action="fulfill"][data-claim-id="${claim?.id || ''}"]`)?.click();
          await sleep(250);
          const fulfilledClaim = (state.rewardClaims || []).find(item => item.id === claim?.id);
          return {
            adminPanelVisible,
            adminPermissionsLine,
            adminProgramCreated: Boolean(adminProgram),
            adminProgramListed,
            parentPanelVisible,
            parentScopeDisabled,
            parentAuthoringVisible,
            parentProgramCreated: Boolean(parentProgram),
            parentProgramListed,
            storeShowsGlobal: storeText.includes('Smoke global reward'),
            storeShowsParent: storeText.includes('Smoke parent reward'),
            claimPending,
            spentAfterClaim,
            claimVisibleToParent,
            fulfilledStatus: fulfilledClaim?.status || ''
          };
        })()
        """,
        timeout=90,
    )


def main():
    parser = argparse.ArgumentParser(description="Smoke-test login and role-specific dashboard affordances.")
    parser.add_argument("--url", default=ROOT_URL, help="URL to test. Use --file to test index.html directly.")
    parser.add_argument("--file", action="store_true", help="Open local index.html via file:// instead of the dev server.")
    args = parser.parse_args()

    port = find_free_port()
    process = start_chrome(port)
    try:
        tab = get_page_tab(port)
        cdp = CdpClient(port)
        cdp.connect(tab["webSocketDebuggerUrl"])
        cdp.call("Runtime.enable")
        cdp.call("Page.enable")
        cdp.call("Page.navigate", {"url": FILE_URL if args.file else args.url})
        cdp.eval("new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))")
        assert wait_for_login(cdp), "login account options did not render"
        passcode_only = passcode_only_snapshot(cdp)
        snapshots = [role_snapshot(cdp, role) for role in ROLES]
        admin_preview = admin_preview_snapshot(cdp)
        signup = signup_snapshot(cdp)
        rewards = reward_snapshot(cdp)
        runtime_errors = [
            event
            for event in cdp.events
            if event.get("method") in ("Runtime.exceptionThrown", "Log.entryAdded")
        ]
        result = {
            "url": FILE_URL if args.file else args.url,
            "passcodeOnly": passcode_only,
            "roles": snapshots,
            "adminPreview": admin_preview,
            "signup": signup,
            "rewards": rewards,
            "runtimeErrors": runtime_errors,
        }
        print(json.dumps(result, indent=2))
        assert not runtime_errors
        assert passcode_only["loggedIn"] and passcode_only["activeName"] == "Student Demo", passcode_only
        for snapshot in snapshots:
            assert snapshot["loggedIn"], snapshot
            assert any("Student Demo" in option for option in snapshot["accountOptions"]), snapshot
        assert snapshots[0]["visibleNavCount"] < snapshots[0]["navCount"], snapshots[0]
        assert "Dashboard" not in snapshots[0]["visibleNavLabels"], snapshots[0]
        assert snapshots[0]["adminCenter"]["visible"] and snapshots[0]["adminCenter"]["queue"], snapshots[0]
        assert snapshots[0]["adminCenter"]["cockpit"] and snapshots[0]["adminCenter"]["scopeLedger"], snapshots[0]
        assert snapshots[0]["adminCenter"]["reviewSop"] and snapshots[0]["adminCenter"]["specificActions"], snapshots[0]
        assert snapshots[0]["adminCenter"]["userOps"] and snapshots[0]["adminCenter"]["questionSystem"], snapshots[0]
        assert snapshots[0]["adminCenter"]["firewall"] and snapshots[0]["content"]["bankManager"], snapshots[0]
        assert snapshots[0]["adminCenter"]["previewParent"] and snapshots[0]["adminCenter"]["previewStudent"], snapshots[0]
        assert snapshots[0]["adminCenter"]["auditedTotal"], snapshots[0]
        assert not snapshots[0]["dashboard"]["studentHomeVisible"] and not snapshots[0]["dashboard"]["parentHomeVisible"], snapshots[0]
        assert admin_preview["hasTabs"], admin_preview
        assert admin_preview["parentName"] == "Parent Admin" and admin_preview["parentPage"] == "Parent Coach", admin_preview
        assert admin_preview["studentName"] == "Student Demo" and admin_preview["studentPage"] == "Dashboard", admin_preview
        assert snapshots[1]["dashboard"]["hasParentCoach"] and snapshots[1]["parent"]["accountsVisible"], snapshots[1]
        assert snapshots[1]["dashboard"]["parentHomeVisible"] and not snapshots[1]["dashboard"]["studentHomeVisible"], snapshots[1]
        assert not snapshots[1]["dashboard"]["metricsVisible"], snapshots[1]
        student_nav = " ".join(snapshots[2]["visibleNavLabels"])
        assert "Today" in student_nav and "Pretest" in student_nav and "Guide" in student_nav, snapshots[2]
        assert "Lessons" not in student_nav and "Practice" not in student_nav and "Topics" not in student_nav, snapshots[2]
        assert snapshots[2]["student"]["visibleLeakage"] == [], snapshots[2]
        assert snapshots[2]["dashboard"]["studentHomeVisible"] and not snapshots[2]["dashboard"]["parentHomeVisible"], snapshots[2]
        assert snapshots[2]["dashboard"]["metricsVisible"], snapshots[2]
        assert signup["loggedIn"] and signup["activeName"] == "New Learner", signup
        assert signup["avatar"] == "NL" and "avatar-amber" in signup["avatarClass"], signup
        assert signup["studentHomeVisible"] and (
            "Today's mission" in signup["focusText"] or "First step" in signup["focusText"]
        ), signup
        assert signup["accountOption"] and signup["storedAccount"], signup
        assert rewards["adminPanelVisible"] and rewards["adminProgramCreated"] and rewards["adminProgramListed"], rewards
        assert rewards["adminPermissionsLine"], rewards
        assert rewards["parentPanelVisible"] and rewards["parentScopeDisabled"] and not rewards["parentAuthoringVisible"], rewards
        assert rewards["parentProgramCreated"] and rewards["parentProgramListed"], rewards
        assert rewards["storeShowsGlobal"] and rewards["storeShowsParent"], rewards
        assert rewards["claimPending"] and rewards["spentAfterClaim"] >= 7, rewards
        assert rewards["claimVisibleToParent"] and rewards["fulfilledStatus"] == "fulfilled", rewards
    finally:
        stop_chrome(process)


if __name__ == "__main__":
    main()
