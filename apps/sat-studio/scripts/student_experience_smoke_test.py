import argparse
import json
from pathlib import Path

from browser_smoke_test import CdpClient, ROOT_URL, find_free_port, get_page_tab, start_chrome, stop_chrome


ROOT = Path(__file__).resolve().parents[1]
FILE_URL = ROOT.joinpath("index.html").resolve().as_uri() + "?"


def wait_for_ready(cdp):
    cdp.eval(
        "new Promise(r => document.readyState === 'complete' ? r(true) : window.addEventListener('load', () => r(true), {once:true}))",
        timeout=60,
    )
    return cdp.eval(
        """
        (async () => {
          for (let i = 0; i < 300; i++) {
            if (window.SAT_STUDIO_READY === true || document.body?.dataset?.satStudioReady === 'true') return true;
            await new Promise(r => setTimeout(r, 100));
          }
          return false;
        })()
        """,
        timeout=90,
    )


def student_snapshot(cdp):
    return cdp.eval(
        """
        (async () => {
          const demoButton = document.querySelector('.demo-login-button[data-demo-account="student-demo"]');
          if (demoButton) {
            demoButton.click();
          } else {
            document.querySelector('#login-account').value = 'student-demo';
            document.querySelector('#login-passcode').value = '1111';
            document.querySelector('#login-form').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
          }
          for (let i = 0; i < 160; i++) {
            if (!document.querySelector('#app-shell')?.hidden && currentAccount()?.id === 'student-demo') break;
            await new Promise(r => setTimeout(r, 100));
          }
          state.language = 'vi';
          const p = profile();
          const today = todayKey();
          const questions = state.questions.filter(q => q.section && q.domain && q.skill).slice(0, 8);
          p.pretests = [{
            id: 'student-smoke',
            label: 'Smoke diagnostic',
            scoreEstimate: 1320,
            correct: 4,
            total: 8,
            endedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            scoreScope: 'full',
            reviewItems: questions.map((q, index) => ({
              questionId: q.id,
              correct: index % 3 === 0,
              selectedAnswer: index % 3 === 0 ? q.correctAnswer : '',
              correctAnswer: q.correctAnswer || '',
              timedOut: false
            }))
          }];
          p.attempts = questions.map((q, index) => ({
            id: `student-smoke-${index}`,
            questionId: q.id,
            correct: index % 3 === 0,
            errorType: index % 3 === 0 ? '' : 'concept_gap',
            timeSpentSeconds: 82,
            at: new Date().toISOString(),
            dueAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            fromPretest: false
          }));
          p.attendance = p.attendance || { points: 0, daily: {}, questRewardsClaimed: [], stickers: [] };
          p.attendance.daily = p.attendance.daily || {};
          p.attendance.questRewardsClaimed = [];
          p.attendance.daily[today] = {
            attempts: 8,
            correct: 4,
            reviews: 3,
            pretests: 1,
            externalMinutes: 15,
            points: 0,
            sprintsCompleted: 1,
            hardSprintsCompleted: 0,
            examDrillsCompleted: 0,
            proofsPassed: 1,
            hardCorrect: 2,
            notesSaved: 1,
            vocabKnown: 5
          };
          p.officialLogs = [
            {
              id: 'official-smoke-latest',
              source: 'Bluebook',
              section: 'Full test',
              totalScore: 1320,
              rwScore: 650,
              mathScore: 670,
              skill: 'Full test pacing',
              reference: 'Bluebook Test 5',
              result: 'uncertain',
              note: 'Timing issue in module 2.',
              at: new Date().toISOString()
            },
            {
              id: 'official-smoke-previous',
              source: 'Bluebook',
              section: 'Full test',
              totalScore: 1280,
              rwScore: 620,
              mathScore: 660,
              skill: 'Full test pacing',
              reference: 'Bluebook Test 4',
              result: 'uncertain',
              note: 'Baseline score.',
              at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          renderDashboard();
          renderRewards();
          switchView('dashboard');
          switchStudentDashboardTab('today');
          await new Promise(r => setTimeout(r, 300));
          const questText = document.querySelector('#daily-quests')?.textContent || '';
          const focusText = document.querySelector('#student-focus-card')?.textContent || '';
          const priorityPlanVisible = Boolean(document.querySelector('.student-priority-plan'));
          const priorityPlanTaskCount = document.querySelectorAll('.student-priority-grid article').length;
          activeStudentRoadmapTab = 'today';
          switchView('roadmap');
          renderRoadmap();
          await new Promise(r => setTimeout(r, 250));
          const roadmapTodayText = document.querySelector('#view-roadmap')?.textContent || '';
          const has1600Path = (roadmapTodayText.includes('1600 Path') || roadmapTodayText.includes('Đường lên 1600')) && roadmapTodayText.includes('1550+');
          activeStudentRoadmapTab = 'skills';
          renderRoadmap();
          await new Promise(r => setTimeout(r, 250));
          const roadmapText = document.querySelector('#view-roadmap')?.textContent || '';
          const microCardCount = document.querySelectorAll('.math-micro-card').length;
          const microHasAlgebra = roadmapText.includes('Linear equations') || roadmapText.includes('Linear functions');
          const microHasAdvanced = roadmapText.includes('Nonlinear') || roadmapText.includes('Advanced Math');
          const hasMasteryGate = Boolean(document.querySelector('.mastery-gate-panel'));
          switchView('pretest');
          renderPretestResults();
          await new Promise(r => setTimeout(r, 150));
          const pretestText = document.querySelector('#pretest-results')?.textContent || '';
          switchView('review');
          renderReview();
          await new Promise(r => setTimeout(r, 150));
          const reviewText = document.querySelector('#view-review')?.textContent || '';
          const mathQuestion = state.questions.find(q => q.section === 'Math' && q.difficulty === 'Hard') || state.questions.find(q => q.section === 'Math');
          renderStudentPracticeCoach(mathQuestion);
          const practiceCoachText = document.querySelector('#student-practice-coach')?.textContent || '';
          switchView('news');
          renderNews();
          await new Promise(r => setTimeout(r, 150));
          const newsText = document.querySelector('#news-list')?.textContent || '';
          switchView('guide');
          await new Promise(r => setTimeout(r, 150));
          const guideText = document.querySelector('#view-guide')?.textContent || '';
          switchView('official');
          renderOfficialLogs();
          await new Promise(r => setTimeout(r, 150));
          const officialText = document.querySelector('#view-official')?.textContent || '';
          const isVisible = (selector) => {
            const node = document.querySelector(selector);
            if (!node || node.hidden) return false;
            const style = window.getComputedStyle(node);
            return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
          };
          return {
            loggedIn: currentAccount()?.id === 'student-demo' && !document.querySelector('#app-shell')?.hidden,
            progressNode: Boolean(document.querySelector('.student-mission-progress .student-progress-ring')),
            ladderNode: Boolean(document.querySelector('.student-stage-ladder')),
            priorityPlanVisible,
            priorityPlanTaskCount,
            microCardCount,
            microHasAlgebra,
            microHasAdvanced,
            has1600Path,
            hasMasteryGate,
            pretestHasNextBest: pretestText.includes('Next Best Action') || pretestText.includes('Việc cần làm'),
            pretestHasConfidenceBand: pretestText.includes('Confidence band') || pretestText.includes('Độ tin cậy'),
            reviewHasFixNow: reviewText.includes('Sửa ngay') || reviewText.includes('Fix now'),
            reviewHasWhyWrong: reviewText.includes('Sai vì gì') || reviewText.includes('Why wrong'),
            reviewHasSelfExplain: reviewText.includes('Name the mistake') || reviewText.includes('tự gọi tên lỗi'),
            practiceHasDesmosMove: practiceCoachText.includes('Desmos move') || practiceCoachText.includes('Cách dùng Desmos') || practiceCoachText.includes('Tool choice'),
            focusHas1550: focusText.includes('1550+'),
            skillBadgeCount: document.querySelectorAll('.student-skill-badge').length,
            questCount: document.querySelectorAll('#daily-quests .quest-item').length,
            questHasFix: questText.includes('Sửa 3 câu sai') || questText.includes('Fix 3 missed questions'),
            questHasNote: questText.includes('Viết 1 ghi chú lỗi') || questText.includes('Write 1 mistake note'),
            questHasOldVolume: questText.includes('Answer 10 questions') || questText.includes('Trả lời 10 câu') || questText.includes('Get 7 correct') || questText.includes('Đúng 7 câu'),
            questMetaCount: document.querySelectorAll('.quest-meta-pill').length,
            coachNewsCount: document.querySelectorAll('.news-card.coach-news').length,
            newsHasWeeklyFocus: newsText.includes('Trọng tâm tuần') || newsText.includes('Weekly focus'),
            newsHasAchievement: newsText.includes('Tiến độ học hôm nay') || newsText.includes('Achievement') || newsText.includes('Thành tích'),
            guideHidesParentAdmin: !isVisible('#view-guide .parent-guide-card') && !isVisible('#view-guide .admin-guide-card') && !isVisible('#view-guide .warning-guide'),
            guideHasStudentFlow: guideText.includes('Hướng dẫn nhanh cho học sinh') || guideText.includes('Student quick guide'),
            officialScoreFields: Boolean(document.querySelector('#official-total-score') && document.querySelector('#official-rw-score') && document.querySelector('#official-math-score')),
            officialTrendVisible: officialText.includes('1320') && officialText.includes('+40'),
            officialScoreLineVisible: officialText.includes('Total 1320') && officialText.includes('RW 650') && officialText.includes('Math 670')
          };
        })()
        """,
        timeout=300,
    )


def main():
    parser = argparse.ArgumentParser(description="Smoke-test student P2/P3 experience affordances.")
    parser.add_argument("--url", default=ROOT_URL)
    parser.add_argument("--file", action="store_true")
    args = parser.parse_args()
    target_url = FILE_URL if args.file else args.url

    port = find_free_port()
    process = start_chrome(port)
    try:
        tab = get_page_tab(port)
        cdp = CdpClient(port)
        cdp.connect(tab["webSocketDebuggerUrl"])
        cdp.call("Runtime.enable")
        cdp.call("Page.enable")
        cdp.call("Page.navigate", {"url": target_url})
        ready = wait_for_ready(cdp)
        if not ready:
            raise AssertionError("SAT Studio app did not finish initialization")
        result = student_snapshot(cdp)
        print(json.dumps(result, ensure_ascii=True, indent=2))
        assert result["loggedIn"]
        assert result["progressNode"]
        assert result["ladderNode"] and result["focusHas1550"]
        assert result["priorityPlanVisible"] and result["priorityPlanTaskCount"] >= 3
        assert result["microCardCount"] >= 8
        assert result["microHasAlgebra"] and result["microHasAdvanced"]
        assert result["has1600Path"] and result["hasMasteryGate"]
        assert result["pretestHasNextBest"] and result["pretestHasConfidenceBand"]
        assert result["reviewHasFixNow"] and result["reviewHasWhyWrong"] and result["reviewHasSelfExplain"]
        assert result["practiceHasDesmosMove"]
        assert result["skillBadgeCount"] >= 1
        assert result["questCount"] >= 5
        assert result["questHasFix"] and result["questHasNote"]
        assert not result["questHasOldVolume"]
        assert result["questMetaCount"] >= 5
        assert result["coachNewsCount"] >= 2
        assert result["newsHasWeeklyFocus"] and result["newsHasAchievement"]
        assert result["guideHidesParentAdmin"] and result["guideHasStudentFlow"]
        assert result["officialScoreFields"]
        assert result["officialTrendVisible"] and result["officialScoreLineVisible"]
    finally:
        stop_chrome(process)


if __name__ == "__main__":
    main()
