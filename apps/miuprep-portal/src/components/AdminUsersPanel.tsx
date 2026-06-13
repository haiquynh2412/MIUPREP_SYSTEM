import type { Dispatch, SetStateAction } from 'react';
import type { LocalUser } from '@miuprep/db';
import { useTranslation } from '@miuprep/i18n/src/react';

type UserSummary = Omit<LocalUser, 'passwordHash'>;
type RoleFilter = 'all' | 'admin' | 'parent' | 'student';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface AdminUsersPanelProps {
  users: UserSummary[];
  roleFilter: RoleFilter;
  setRoleFilter: Dispatch<SetStateAction<RoleFilter>>;
  statusFilter: StatusFilter;
  setStatusFilter: Dispatch<SetStateAction<StatusFilter>>;
  onOpenUserDetail: (username: string) => void | Promise<void>;
  onUpdateStatus: (username: string, nextStatus: 'approved' | 'rejected') => void | Promise<void>;
  onDeleteUser: (username: string) => void | Promise<void>;
}

export default function AdminUsersPanel({
  users,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onOpenUserDetail,
  onUpdateStatus,
  onDeleteUser,
}: AdminUsersPanelProps) {
  const { t } = useTranslation();
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    const status = user.status || 'pending';
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 max-w-5xl mx-auto shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-sm font-black text-slate-350 uppercase tracking-widest">
          👥 DANH SÁCH TÀI KHOẢN ({users.length})
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{t('aus_th_role')}:</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
            >
              <option value="all">{t('aus_opt_all')}</option>
              <option value="admin">{t('aus_opt_admin')}</option>
              <option value="parent">{t('aus_opt_parent')}</option>
              <option value="student">{t('aus_opt_student')}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{t('aus_filter_approve')}</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="pending">{t('aus_opt_pending')}</option>
              <option value="approved">{t('aus_opt_approved')}</option>
              <option value="rejected">{t('aus_opt_rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-850">
        <table className="w-full border-collapse text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold">
              <th className="p-4">{t('aus_th_user')}</th>
              <th className="p-4">{t('aus_th_contact')}</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">{t('aus_th_status')}</th>
              <th className="p-4">{t('aus_th_date')}</th>
              <th className="p-4 text-center">{t('aus_th_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                  {t('aus_no_results')}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = user.status || 'pending';

                return (
                  <tr key={user.id} className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black uppercase text-[10px] ${
                            user.role === 'admin'
                              ? 'bg-purple-900/40 text-purple-300'
                              : user.role === 'parent'
                                ? 'bg-orange-900/40 text-orange-300'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.username.slice(0, 2)}
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-sm text-white">{user.displayName || user.username}</span>
                          <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-300 font-mono">
                      {user.contactInfo || <span className="text-slate-650 italic">{t('aus_none')}</span>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-950/70 border-purple-900 text-purple-400'
                            : user.role === 'parent'
                              ? 'bg-orange-950/70 border-orange-900 text-orange-400'
                              : 'bg-slate-950/60 border-slate-850 text-slate-400'
                        }`}
                      >
                        {user.role === 'admin'
                          ? t('aus_role_admin')
                          : user.role === 'parent'
                            ? t('aus_opt_parent')
                            : t('aus_opt_student')}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          status === 'approved'
                            ? 'bg-emerald-950/75 border-emerald-900 text-emerald-400'
                            : status === 'rejected'
                              ? 'bg-rose-950/75 border-rose-900 text-rose-400'
                              : 'bg-amber-950/75 border-amber-900 text-amber-400 animate-pulse'
                        }`}
                      >
                        {status === 'approved'
                          ? t('aus_status_approved')
                          : status === 'rejected'
                            ? t('aus_status_rejected')
                            : t('aus_status_pending')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenUserDetail(user.username)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-indigo-950/60 text-slate-500 hover:text-indigo-400 border border-slate-800 hover:border-indigo-900 transition-all cursor-pointer font-bold text-xs"
                          title={t('aus_title_detail')}
                        >
                          🔍
                        </button>
                        {status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(user.username, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase transition-all border-0 cursor-pointer"
                            title={t('aus_title_approve')}
                          >
                            {t('aus_approve')}
                          </button>
                        )}
                        {status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(user.username, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 font-extrabold text-[10px] uppercase transition-all border-0 cursor-pointer"
                            title={t('aus_title_reject')}
                          >
                            {t('aus_reject')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.username)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-900 hover:text-red-400 text-slate-500 border border-slate-800 transition-all cursor-pointer"
                          title={t('aus_title_delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
