import type { LocalUser } from '@miuprep/db';
import { loadStudentProgressSnapshot } from '../lib/studentProgress';

type TrackId = 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';

interface AdminUserDetailModalProps {
  user: LocalUser;
  onClose: () => void;
  onAdjustCoins: (username: string, amount: number) => void;
  onUpdateUserTracks: (username: string, tracks: TrackId[]) => void | Promise<void>;
}

export default function AdminUserDetailModal({
  user,
  onClose,
  onAdjustCoins,
  onUpdateUserTracks,
}: AdminUserDetailModalProps) {
  const studentProgress = user.role === 'student' ? loadStudentProgressSnapshot(localStorage, user.username) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-left space-y-6 transform scale-98 transition-transform duration-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-850 text-slate-500 hover:text-slate-200 border border-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-805">
          <span className="text-3xl">👤</span>
          <div>
            <h3 className="text-lg font-black text-slate-100">Chi Tiết Học Viên @{user.username}</h3>
            <p className="text-[10px] text-slate-500">
              Đăng ký lúc: {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'Không rõ'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tên hiển thị</span>
            <span className="font-extrabold text-slate-200">{user.displayName || user.username}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Vai Trò</span>
            <span className="font-extrabold text-orange-400 capitalize">
              {user.role === 'admin' ? 'Quản trị viên' : user.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Mục tiêu</span>
            <span className="font-extrabold text-slate-200">{user.role === 'student' ? `Band ${user.targetBand}` : '-'}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ví Xu Cá Hồi</span>
            <span className="font-extrabold text-orange-400 font-mono">
              {studentProgress ? `${studentProgress.coins} 🐟` : '-'}
            </span>
          </div>
        </div>

        {user.role === 'student' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Bơm / Trừ Ví Xu Cá Hồi
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustCoins(user.username, 50)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-900 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-all"
                >
                  🐟 +50 Xu
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustCoins(user.username, 100)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-900 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-all"
                >
                  🐟 +100 Xu
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustCoins(user.username, -50)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-900 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 cursor-pointer transition-all"
                >
                  🪓 -50 Xu
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Phân Quyền Các Khoá Học Assigned
              </span>
              <div className="flex flex-wrap gap-2">
                {(['math', 'sat', 'ielts', 'cae', 'cpe'] as const).map((track) => {
                  const isAssigned = (user.assignedTracks || []).includes(track);

                  return (
                    <button
                      type="button"
                      key={track}
                      onClick={() => {
                        let nextTracks = [...(user.assignedTracks || [])];
                        if (nextTracks.includes(track)) {
                          nextTracks = nextTracks.filter((assignedTrack) => assignedTrack !== track);
                        } else {
                          nextTracks.push(track);
                        }
                        onUpdateUserTracks(user.username, nextTracks);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                        isAssigned
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {track.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-800 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-extrabold uppercase rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
