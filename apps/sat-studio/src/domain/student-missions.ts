import { ensureAccountProfile, type AccountState } from "./account-ops";
import type { LearnerState } from "./student-learning";

export type TodayMissionKind = "diagnostic" | "proof_review" | "focused_sprint" | "vocab" | "bluebook";

export interface TodayMission {
  id: TodayMissionKind;
  title: string;
  detail: string;
  actionLabel: string;
  rewardPoints: number;
  skill?: string;
}

export interface MissionRewardResult {
  ok: boolean;
  reason: string;
  state: AccountState;
  alreadyClaimed: boolean;
}

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function dateIndex(dateKey: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const time = Date.parse(`${dateKey}T00:00:00.000Z`);
  return Number.isFinite(time) ? Math.floor(time / 86_400_000) : null;
}

function nextStreak(
  current: { count: number; lastPracticeDate: string; freezeCredits: number; lastFreezeUsedAt: string },
  now: Date,
): { count: number; lastPracticeDate: string; freezeCredits: number; lastFreezeUsedAt: string; usedFreezeCredits: number; freezeGranted: boolean } {
  const currentDate = todayKey(now);
  const lastDate = current.lastPracticeDate;
  const currentIndex = dateIndex(currentDate);
  const lastIndex = dateIndex(lastDate);
  let count = Math.max(0, Number(current.count || 0));
  let freezeCredits = Math.max(0, Number(current.freezeCredits || 0));
  let lastFreezeUsedAt = current.lastFreezeUsedAt || "";
  let usedFreezeCredits = 0;

  if (lastDate === currentDate) {
    return { count: Math.max(1, count), lastPracticeDate: currentDate, freezeCredits, lastFreezeUsedAt, usedFreezeCredits, freezeGranted: false };
  }

  if (currentIndex !== null && lastIndex !== null) {
    const gapDays = currentIndex - lastIndex;
    if (gapDays === 1) {
      count += 1;
    } else if (gapDays > 1) {
      const requiredFreezes = gapDays - 1;
      if (freezeCredits >= requiredFreezes) {
        freezeCredits -= requiredFreezes;
        usedFreezeCredits = requiredFreezes;
        lastFreezeUsedAt = now.toISOString();
        count += 1;
      } else {
        count = 1;
      }
    } else {
      count = Math.max(1, count);
    }
  } else {
    count = 1;
  }

  const freezeGranted = count > 0 && count % 5 === 0;
  if (freezeGranted) freezeCredits += 1;
  return { count, lastPracticeDate: currentDate, freezeCredits, lastFreezeUsedAt, usedFreezeCredits, freezeGranted };
}

function wrongCount(state: LearnerState): number {
  return state.attempts.filter((attempt) => !attempt.correct).length;
}

function weakestSkill(state: LearnerState): string {
  const counts = new Map<string, { attempts: number; correct: number }>();
  for (const attempt of state.attempts) {
    const skill = String(attempt.skill || "Mixed SAT");
    const current = counts.get(skill) || { attempts: 0, correct: 0 };
    current.attempts += 1;
    if (attempt.correct) current.correct += 1;
    counts.set(skill, current);
  }
  return [...counts.entries()]
    .map(([skill, row]) => ({ skill, accuracy: row.attempts ? row.correct / row.attempts : 0, attempts: row.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0]?.skill || "Mixed SAT";
}

export function buildTodayMission(state: LearnerState, options: { vocabLearning?: number } = {}): TodayMission {
  if (state.attempts.length < 8) {
    return {
      id: "diagnostic",
      title: "Hoàn tất baseline 20 câu",
      detail: "Cần đủ dữ liệu ban đầu để SAT Studio route đúng điểm yếu và band hiện tại.",
      actionLabel: "Làm diagnostic",
      rewardPoints: 30,
    };
  }
  if (wrongCount(state) > 0) {
    return {
      id: "proof_review",
      title: "Tiêu diệt 3 lỗi sai",
      detail: "Sửa lỗi bằng proof item mới trước khi tăng khối lượng luyện.",
      actionLabel: "Vào sổ lỗi",
      rewardPoints: 25,
    };
  }
  const weak = weakestSkill(state);
  const hardAttempts = state.attempts.filter((attempt) => attempt.difficulty === "Hard").length;
  if (hardAttempts < 3) {
    return {
      id: "focused_sprint",
      title: "Vượt 5 câu trọng tâm",
      detail: `Luyện skill ${weak} bằng sprint Medium/Hard để chứng minh transfer.`,
      actionLabel: "Làm sprint",
      rewardPoints: 20,
      skill: weak,
    };
  }
  if ((options.vocabLearning || 0) > 0) {
    return {
      id: "vocab",
      title: "Khóa 10 từ vựng SAT",
      detail: "Giữ nhịp daily habit bằng flashcard và quiz nhanh.",
      actionLabel: "Ôn từ vựng",
      rewardPoints: 15,
    };
  }
  return {
    id: "bluebook",
    title: "Hoàn thành 1 module Bluebook",
    detail: "Tập áp lực thời gian và nhận báo cáo pacing sau module.",
    actionLabel: "Vào Bluebook",
    rewardPoints: 35,
  };
}

export function missionCompleted(mission: TodayMission, state: LearnerState): boolean {
  if (mission.id === "diagnostic") return state.attempts.filter((attempt) => attempt.mode === "diagnostic").length >= 8;
  if (mission.id === "proof_review") return state.attempts.filter((attempt) => attempt.mode === "review" && attempt.correct).length >= 3;
  if (mission.id === "focused_sprint") {
    return state.attempts.filter((attempt) => attempt.mode === "practice" && attempt.correct && (!mission.skill || attempt.skill === mission.skill)).length >= 5;
  }
  if (mission.id === "vocab") return state.vocabQuizAttempts.length >= 1 || state.knownVocabIds.length >= 10;
  return state.attempts.filter((attempt) => attempt.mode === "bluebook").length >= 5;
}

export function missionClaimKey(mission: TodayMission, now = new Date()): string {
  return `${todayKey(now)}:${mission.id}`;
}

export function applyMissionReward(state: AccountState, studentId: string, mission: TodayMission, now = new Date()): MissionRewardResult {
  const profile = ensureAccountProfile(state.profiles, studentId);
  const key = missionClaimKey(mission, now);
  if (profile.attendance.questRewardsClaimed.map(String).includes(key)) {
    return { ok: false, reason: "Nhiệm vụ hôm nay đã nhận thưởng.", state, alreadyClaimed: true };
  }
  const streak = nextStreak(profile.streak, now);
  profile.attendance.points += mission.rewardPoints;
  profile.attendance.lastRewardAt = now.toISOString();
  const freezeClaimKey = streak.freezeGranted ? `${todayKey(now)}:streak-freeze:${streak.count}` : "";
  profile.attendance.questRewardsClaimed = [key, ...(freezeClaimKey ? [freezeClaimKey] : []), ...profile.attendance.questRewardsClaimed];
  profile.streak = {
    count: streak.count,
    lastPracticeDate: streak.lastPracticeDate,
    freezeCredits: streak.freezeCredits,
    lastFreezeUsedAt: streak.lastFreezeUsedAt,
  };
  const freezeUseText = streak.usedFreezeCredits ? ` Đã dùng ${streak.usedFreezeCredits} streak-freeze để giữ chuỗi.` : "";
  const freezeGrantText = streak.freezeGranted ? " Tặng thêm 1 streak-freeze vì đạt mốc 5 ngày." : "";
  return { ok: true, reason: `Đã cộng ${mission.rewardPoints} điểm thưởng. Streak hiện tại: ${streak.count} ngày.${freezeUseText}${freezeGrantText}`, state, alreadyClaimed: false };
}
