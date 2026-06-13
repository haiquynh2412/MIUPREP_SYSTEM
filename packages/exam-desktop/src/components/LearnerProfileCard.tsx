import { useState } from 'react';
import type { LearnerProfile } from '@miuprep/db';
import { generateStudyPlannerAdvice } from '@miuprep/core';

interface Weakness {
  questionType: string;
  correct: number;
  total: number;
  accuracy: number;
  status: 'proficient' | 'needs_improvement' | 'critical';
}

interface MicroSkill {
  skillName: string;
  description: string;
  score: number;
  status: 'proficient' | 'needs_improvement' | 'critical';
}

interface LearnerProfileCardProps {
  learnerProfile: LearnerProfile | null;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  targetBandInput: number;
  setTargetBandInput: (val: number) => void;
  examDateInput: string;
  setExamDateInput: (val: string) => void;
  saveLearnerProfile: () => Promise<void>;
  getDaysRemaining: () => number | null;
  getGlobalWeaknessAnalysis: () => Weakness[];
  getMicroSkillsAnalysis: () => MicroSkill[];
  onNavigateTab?: (
    tab: 'dashboard' | 'exam' | 'writing_ai' | 'error_notebook' | 'speaking_ai' | 'adaptive_room',
  ) => void;
  activeTrack?: 'ielts' | 'cpe' | 'cae';
}

export default function LearnerProfileCard({
  learnerProfile,
  isEditingProfile,
  setIsEditingProfile,
  targetBandInput,
  setTargetBandInput,
  examDateInput,
  setExamDateInput,
  saveLearnerProfile,
  getDaysRemaining,
  getGlobalWeaknessAnalysis,
  getMicroSkillsAnalysis,
  onNavigateTab,
  activeTrack,
}: LearnerProfileCardProps) {
  const weaknesses = getGlobalWeaknessAnalysis();
  const microSkills = getMicroSkillsAnalysis();

  const [activeMapTab, setActiveMapTab] = useState<'question_types' | 'micro_skills'>('question_types');

  const track = activeTrack || 'ielts';
  const isCpe = track === 'cpe';
  const isCae = track === 'cae';
  const examNameLabel = isCpe ? 'CPE C2' : isCae ? 'CAE C1' : 'IELTS';
  const targetLabel = isCpe ? 'Điểm CPE mục tiêu' : isCae ? 'Điểm CAE mục tiêu' : 'Điểm IELTS mục tiêu';
  const formattedTarget =
    isCpe || isCae
      ? learnerProfile?.targetBand?.toFixed(0) || (isCpe ? '200' : '180')
      : learnerProfile?.targetBand?.toFixed(1) || '7.0';

  const themeColors = {
    ielts: {
      primaryColor: 'blue',
      textClass: 'text-blue-650',
      textPrimary: 'text-blue-600',
      borderClass: 'border-blue-100',
      bgClass: 'from-blue-50 to-indigo-50',
      btnClass: 'bg-blue-600 hover:bg-blue-700',
      backupTitle: 'IELTS Local Backup Simulator',
      localStorageKey: 'ielts_app_last_cloud_sync',
    },
    cpe: {
      primaryColor: 'emerald',
      textClass: 'text-emerald-705',
      textPrimary: 'text-emerald-600',
      borderClass: 'border-emerald-100',
      bgClass: 'from-emerald-50 to-emerald-50',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700',
      backupTitle: 'CPE C2 Local Backup Simulator',
      localStorageKey: 'cpe_app_last_cloud_sync',
    },
    cae: {
      primaryColor: 'violet',
      textClass: 'text-violet-650',
      textPrimary: 'text-violet-600',
      borderClass: 'border-violet-100',
      bgClass: 'from-violet-50 to-indigo-50',
      btnClass: 'bg-violet-600 hover:bg-violet-700',
      backupTitle: 'CAE C1 Local Backup Simulator',
      localStorageKey: 'cae_app_last_cloud_sync',
    },
  }[track];

  // Cloud Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return localStorage.getItem(themeColors.localStorageKey);
  });

  const getStatusColor = (status: string) => {
    if (status === 'proficient') return 'bg-green-500';
    if (status === 'needs_improvement') return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getBadgeStyle = (status: string) => {
    if (status === 'proficient') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'needs_improvement') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatTypeName = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Generate dynamic, pedagogically driven planner advice in Vietnamese
  const plannerAdvice = generateStudyPlannerAdvice({
    targetBand: learnerProfile?.targetBand || (isCpe ? 200 : isCae ? 180 : 7.0),
    examDate: learnerProfile?.examDate || null,
    weaknesses: weaknesses,
  });

  // Simulated Encrypted Secure Local Backup
  const handleCloudSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncMessage('Đang thu thập và nén dữ liệu thi thử & hồ sơ học viên...');

    const steps = [
      { progress: 25, message: 'Đang mã hóa nhị phân dữ liệu cục bộ (Base64 Encryption)...' },
      { progress: 60, message: 'Đang tạo checkpoint an toàn chống trùng lặp dữ liệu...' },
      { progress: 85, message: 'Đang mô phỏng lưu trữ tệp tin sao lưu bảo mật cục bộ...' },
      { progress: 100, message: 'Mô phỏng sao lưu cục bộ hoàn tất thành công!' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(
        () => {
          setSyncProgress(step.progress);
          setSyncMessage(step.message);
          if (step.progress === 100) {
            const timestamp = new Date().toLocaleString('vi-VN');
            localStorage.setItem(themeColors.localStorageKey, timestamp);
            setLastSynced(timestamp);
            setTimeout(() => {
              setIsSyncing(false);
            }, 1500);
          }
        },
        (idx + 1) * 600,
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <svg className={`w-6 h-6 ${themeColors.textPrimary} fill-current`} viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Hồ sơ học tập thích ứng của tôi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cá nhân hóa lộ trình dựa trên ngày thi thực tế và điểm số mục tiêu.
            </p>
          </div>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded shadow-sm border transition-all cursor-pointer text-center outline-none"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveLearnerProfile}
                className={`${themeColors.btnClass} text-white font-bold text-xs py-1.5 px-3 rounded shadow-sm transition-all cursor-pointer border-0 outline-none`}
              >
                Lưu hồ sơ
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs py-1.5 px-3 rounded shadow-sm border transition-all cursor-pointer outline-none"
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-lg mb-4 text-sm">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">
                Target {examNameLabel} {isCpe || isCae ? 'Score (180-230)' : 'Band'}:
              </label>
              <input
                type="number"
                min={isCpe || isCae ? '180' : '1'}
                max={isCpe || isCae ? '230' : '9'}
                step={isCpe || isCae ? '1' : '0.5'}
                value={targetBandInput}
                onChange={(e) => setTargetBandInput(parseFloat(e.target.value))}
                className={`border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white focus:outline-none focus:border-${themeColors.primaryColor}-500 font-medium`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">Ngày thi thực tế:</label>
              <input
                type="date"
                value={examDateInput}
                onChange={(e) => setExamDateInput(e.target.value)}
                className={`border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white focus:outline-none focus:border-${themeColors.primaryColor}-500 font-medium`}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div
              className={`bg-gradient-to-r ${themeColors.bgClass} border ${themeColors.borderClass} rounded-lg p-4 flex flex-col justify-center items-center text-center shadow-sm`}
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{targetLabel}</span>
              <span className={`text-3xl font-black ${themeColors.textPrimary} mt-1`}>{formattedTarget}</span>
            </div>

            <div
              className={`bg-gradient-to-r ${themeColors.bgClass} border ${themeColors.borderClass} rounded-lg p-4 flex flex-col justify-center items-center text-center shadow-sm`}
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ngày thi dự kiến</span>
              <span className="text-sm font-bold text-slate-800 mt-2">
                {learnerProfile?.examDate
                  ? new Date(learnerProfile.examDate).toLocaleDateString('vi-VN')
                  : 'Chưa thiết lập'}
              </span>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-lg p-4 flex flex-col justify-center items-center text-center shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thời gian còn lại</span>
              <span className="text-2xl font-black text-rose-600 mt-1">
                {getDaysRemaining() !== null ? `${getDaysRemaining()} ngày` : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Global Weakness & Micro-Skills Map */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
              <svg className={`w-4 h-4 ${themeColors.textPrimary} fill-current`} viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Chẩn đoán Bản đồ năng lực cá nhân
            </h3>

            {weaknesses.length > 0 && (
              <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveMapTab('question_types')}
                  className={`py-1 px-2.5 rounded-md text-[10px] font-black transition-all border-0 outline-none cursor-pointer uppercase tracking-wider ${
                    activeMapTab === 'question_types'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 bg-transparent'
                  }`}
                >
                  Dạng bài thi
                </button>
                <button
                  onClick={() => setActiveMapTab('micro_skills')}
                  className={`py-1 px-2.5 rounded-md text-[10px] font-black transition-all border-0 outline-none cursor-pointer uppercase tracking-wider ${
                    activeMapTab === 'micro_skills'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 bg-transparent'
                  }`}
                >
                  Kỹ năng gốc bổ trợ
                </button>
              </div>
            )}
          </div>

          {weaknesses.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed rounded bg-slate-50/50">
              Chưa có dữ liệu bài thi. Hãy hoàn thành các lượt thi thử để kích hoạt chẩn đoán điểm yếu tự động.
            </p>
          ) : activeMapTab === 'question_types' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              {weaknesses.map((weak) => (
                <div
                  key={weak.questionType}
                  className="border border-slate-100 bg-slate-50/50 rounded-lg p-3 flex flex-col justify-between gap-2 shadow-inner"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs text-slate-800">{formatTypeName(weak.questionType)}</span>
                      <span className="text-[10px] text-slate-500">
                        Đúng: {weak.correct}/{weak.total} câu
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 border rounded uppercase ${getBadgeStyle(
                        weak.status,
                      )}`}
                    >
                      {weak.status === 'proficient'
                        ? 'Thành thạo'
                        : weak.status === 'needs_improvement'
                          ? 'Cần cải thiện'
                          : 'Nguy cấp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(weak.status)}`}
                        style={{ width: `${weak.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-600 w-8 text-right">{weak.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 animate-fadeIn">
              {microSkills.map((skill) => (
                <div
                  key={skill.skillName}
                  className="border border-slate-150 bg-slate-50/20 rounded-lg p-4 flex flex-col justify-between gap-2.5 shadow-sm transition-all hover:shadow-md hover:bg-slate-50/40"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-sm text-slate-850 tracking-tight flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${getStatusColor(skill.status)} animate-pulse`}
                        ></span>
                        {skill.skillName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">{skill.description}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 border rounded-full uppercase tracking-wider self-start sm:self-auto ${getBadgeStyle(
                        skill.status,
                      )}`}
                    >
                      {skill.status === 'proficient'
                        ? 'Thành thạo'
                        : skill.status === 'needs_improvement'
                          ? 'Cần cải thiện'
                          : 'Nguy cấp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          skill.status === 'proficient'
                            ? 'from-green-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : skill.status === 'needs_improvement'
                              ? 'from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                              : 'from-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        }`}
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                    <span className="font-mono font-black text-sm text-slate-700 w-12 text-right">{skill.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Premium AI Study Planner Advice Box */}
      <div
        className={`bg-gradient-to-r ${track === 'cpe' ? 'from-emerald-600 to-emerald-600' : track === 'cae' ? 'from-violet-600 to-violet-650' : 'from-blue-600 to-indigo-600'} text-white rounded-lg p-6 shadow-md relative overflow-hidden flex flex-col gap-4`}
      >
        {/* Subtle decorative glass circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2.5 rounded-lg text-white">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] bg-white/20 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start">
              AI Adaptive Study Planner
            </span>
            <p className="text-sm font-semibold leading-relaxed mt-2 text-white opacity-95">
              {plannerAdvice.adviceText}
            </p>
          </div>
        </div>

        {plannerAdvice.status !== 'new' && onNavigateTab && (
          <button
            onClick={() => onNavigateTab('adaptive_room')}
            className={`self-start mt-1 bg-white hover:bg-slate-50 ${themeColors.textPrimary} text-xs font-black py-2.5 px-5 rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider border-0 outline-none`}
          >
            {plannerAdvice.recommendedAction}
          </button>
        )}
      </div>

      {/* 3. Encrypted Local Backup Sync Widget */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-6 shadow-md flex flex-col gap-4 relative text-left">
        <h3 className="text-base font-bold text-white flex items-center gap-2 m-0 text-left">
          <svg
            className={`w-5 h-5 ${track === 'cpe' ? 'text-emerald-400' : track === 'cae' ? 'text-violet-400' : 'text-blue-400'} fill-current`}
            viewBox="0 0 24 24"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>
          {themeColors.backupTitle}
        </h3>
        <p className="text-xs text-slate-400 leading-normal m-0 text-left">
          Chạy mô phỏng sao lưu lịch sử làm bài, hồ sơ chẩn đoán điểm yếu và Sổ tay lỗi sai dưới dạng mã hóa dữ liệu cục
          bộ an toàn chuẩn Base64.
        </p>

        {isSyncing ? (
          <div className="flex flex-col gap-2 mt-2 bg-slate-850 p-4 rounded border border-slate-800">
            <div
              className={`flex justify-between items-center text-xs font-bold ${track === 'cpe' ? 'text-emerald-400' : track === 'cae' ? 'text-violet-400' : 'text-blue-400'}`}
            >
              <span className="animate-pulse">{syncMessage}</span>
              <span className="font-mono">{syncProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${track === 'cpe' ? 'bg-emerald-500' : track === 'cae' ? 'bg-violet-500' : 'bg-blue-500'} transition-all duration-300`}
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Trạng thái sao lưu
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5">
                {lastSynced ? `✓ Lần sao lưu giả lập cuối: ${lastSynced}` : 'Chưa chạy sao lưu giả lập'}
              </span>
            </div>
            <button
              onClick={handleCloudSync}
              className={`${themeColors.btnClass} text-white font-bold text-xs py-2.5 px-4 rounded shadow transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center border-0 outline-none`}
            >
              Mô phỏng Sao lưu (Simulation)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
