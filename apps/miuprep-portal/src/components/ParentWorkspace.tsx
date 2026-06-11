import type { JSX } from 'react';
import React, { Suspense } from 'react';
import type { LocalUser } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import { loadStudentProgressSnapshot } from '../lib/studentProgress';
import type { PortalTrackInfo } from './UnifiedLearnerDashboard';

const ParentLearningOverview = React.lazy(() => import('./ParentLearningOverview'));
const ParentActionSummary = React.lazy(() => import('./ParentActionSummary'));

function DeferredPanel({ children, label = 'Loading parent workspace' }: { children: React.ReactNode; label?: string }): JSX.Element {
  return (
    <Suspense
      fallback={
        <section className="max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}...
        </section>
      }
    >
      {children}
    </Suspense>
  );
}

interface ParentWorkspaceProps {
  currentUser: LocalUser;
  linkedStudents: LocalUser[];
  tracks: PortalTrackInfo[];
  learningEvents: LearningEventRecord[];
  selectedStudent: string;
  setSelectedStudent: React.Dispatch<React.SetStateAction<string>>;
  weeklyTargetValue: number;
  setWeeklyTargetValue: React.Dispatch<React.SetStateAction<number>>;
  rewardAmount: number;
  setRewardAmount: React.Dispatch<React.SetStateAction<number>>;
  handleUpdateStudentTarget: () => void | Promise<void>;
  handleRewardCoins: () => void | Promise<void>;
}

export default function ParentWorkspace({
  currentUser,
  linkedStudents,
  tracks,
  learningEvents,
  selectedStudent,
  setSelectedStudent,
  weeklyTargetValue,
  setWeeklyTargetValue,
  rewardAmount,
  setRewardAmount,
  handleUpdateStudentTarget,
  handleRewardCoins,
}: ParentWorkspaceProps): JSX.Element {
  const updateSelectedStudent = (username: string): void => {
    setSelectedStudent(username);
    const selected = linkedStudents.find((student) => student.username === username);
    if (selected) setWeeklyTargetValue(selected.studyPlan?.weeklyTarget || 4);
  };

  return (
    <div className="space-y-12">
      <DeferredPanel label="Loading parent summary">
        <ParentActionSummary
          linkedStudents={linkedStudents}
          tracks={tracks}
          learningEvents={learningEvents}
          rewardsAllocated={currentUser.rewardsAllocated || 0}
        />
      </DeferredPanel>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between bg-gradient-to-tr from-slate-900 to-orange-950/20">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Số con liên kết</span>
            <span className="text-3xl font-black text-orange-400 font-mono">{linkedStudents.length} Học Sinh 🎒</span>
          </div>
          <span className="text-4xl">🏠</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between bg-gradient-to-tr from-slate-900 to-amber-950/20">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Đã khen thưởng Xu Cá Hồi</span>
            <span className="text-3xl font-black text-amber-400 font-mono">🐟 {currentUser.rewardsAllocated || 0} Xu</span>
          </div>
          <span className="text-4xl">🎁</span>
        </div>
      </section>

      <DeferredPanel label="Loading parent overview">
        <ParentLearningOverview
          linkedStudents={linkedStudents}
          tracks={tracks}
          learningEvents={learningEvents}
        />
      </DeferredPanel>

      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl">
        <h2 className="text-xl font-black mb-6 text-slate-200 uppercase tracking-widest text-left flex items-center gap-2">
          <span>📊 BẢNG THEO DÕI TIẾN TRÌNH CỦA CON (SAT STYLE)</span>
        </h2>

        {linkedStudents.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-medium">
            Chưa liên kết học sinh nào meow! Hãy liên hệ admin hoặc chỉnh sửa profile meow! 😿
          </div>
        ) : (
          <div className="space-y-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-black uppercase text-xs">
                    <th className="p-4">Tên con (Username)</th>
                    <th className="p-4">Ví Xu Cá Hồi tích lũy</th>
                    <th className="p-4">Số Bẫy Chuột sai sót</th>
                    <th className="p-4">Phân quyền học</th>
                    <th className="p-4">Mục tiêu học tuần</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedStudents.map((student) => {
                    const studentProgress = loadStudentProgressSnapshot(localStorage, student.username);

                    return (
                      <tr key={student.id} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                            {student.displayName?.slice(0, 2) || student.username.slice(0, 2)}
                          </span>
                          <div className="flex flex-col text-left">
                            <span>{student.displayName || student.username}</span>
                            <span className="text-[10px] text-slate-500 font-mono">@{student.username}</span>
                          </div>
                        </td>
                        <td className="p-4 font-black text-emerald-400 font-mono">🐟 {studentProgress.coins} Xu</td>
                        <td className="p-4 font-bold text-rose-400 font-mono">😼 {studentProgress.traps} bẫy chuột</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5 w-40 text-left">
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                              <span>Toán 9 (MiuMath)</span>
                              <span className="text-emerald-450 font-mono font-bold">85%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-850">
                              <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                              <span>IELTS Academy</span>
                              <span className="text-indigo-455 font-mono font-bold">68%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-850">
                              <div className="bg-indigo-500 h-full rounded-full animate-pulse" style={{ width: '68%' }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-orange-400 font-mono">{student.studyPlan?.weeklyTarget || 4} buổi/tuần</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800">
              <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 text-left">
                <h3 className="text-sm font-black uppercase text-orange-400 tracking-wider">🛠️ CÀI ĐẶT LỘ TRÌNH CHO CON</h3>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Chọn tài khoản con</label>
                  <select
                    value={selectedStudent}
                    onChange={(event) => updateSelectedStudent(event.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    {linkedStudents.map((student) => (
                      <option key={student.id} value={student.username}>
                        {student.displayName || student.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mục tiêu số buổi học / tuần</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={weeklyTargetValue}
                    onChange={(event) => setWeeklyTargetValue(parseInt(event.target.value) || 4)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleUpdateStudentTarget}
                  className="py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs uppercase tracking-widest text-white shadow transition-all border-0 cursor-pointer"
                >
                  Cập nhật lộ trình
                </button>
              </div>

              <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 text-left">
                <h3 className="text-sm font-black uppercase text-orange-400 tracking-wider">🎁 KHEN THƯỞNG XU CÁ HỒI</h3>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Chọn tài khoản con</label>
                  <select
                    value={selectedStudent}
                    onChange={(event) => setSelectedStudent(event.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    {linkedStudents.map((student) => (
                      <option key={student.id} value={student.username}>
                        {student.displayName || student.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mức Khen Thưởng</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setRewardAmount(amount)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          rewardAmount === amount
                            ? 'bg-amber-600 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        🐟 Thưởng {amount} Xu
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRewardCoins}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-xs uppercase tracking-widest text-white shadow border-0 cursor-pointer"
                >
                  Gửi Tặng Xu Khen Thưởng ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
