import React, { Suspense, useState } from 'react';
import { useTranslation } from '@miuprep/i18n/src/react';
import type { LocalUser, SystemLog } from '@miuprep/db';
import type { LearningEventRecord } from '@miuprep/learning';
import type { PortalTrackInfo } from './UnifiedLearnerDashboard';

const AdminLearningAnalytics = React.lazy(() => import('./AdminLearningAnalytics'));
const BetaImplementationTracker = React.lazy(() => import('./BetaImplementationTracker'));
const AdminInterventionQueue = React.lazy(() => import('./AdminInterventionQueue'));
const AdminContentRepairQueue = React.lazy(() => import('./AdminContentRepairQueue'));

type TrackId = 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';

interface MathLessonLike {
  id: string;
  title: string;
  topic: string;
  count: number;
  status: string;
  conceptIds?: string[];
  skillIds?: string[];
}

interface ExamLike {
  id: string;
  title: string;
  exam: string;
  questions: number;
  duration: number;
  status: string;
  standardErrorCount?: number;
  conceptIds?: string[];
  skillIds?: string[];
  reviewStatus?: 'unchecked' | 'checked' | 'needs_fix';
  reviewer?: string;
  reviewedAt?: string;
}

interface ErrorQuestionLike {
  id: string;
  text: string;
  stage: number;
  answer?: string;
  conceptIds?: string[];
  skillIds?: string[];
  errorCategories?: string[];
  retryAttempts?: number;
  repairLessonTitle?: string;
}

interface AdminAnalyticsWorkspaceProps {
  isAdminContentOnly: boolean;
  tracks: PortalTrackInfo[];
  users: Omit<LocalUser, 'passwordHash'>[];
  mathLessons: MathLessonLike[];
  importedExams: ExamLike[];
  errorQuestions: ErrorQuestionLike[];
  adminLogs: SystemLog[];
  learningEvents: LearningEventRecord[];
  activeErrorQuestionCount: number;
  onOpenUsers: () => void;
  onOpenContent: (track: TrackId) => void;
}

function DeferredPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-xs text-slate-500 italic py-6 text-center">{label}...</div>}>
      {children}
    </Suspense>
  );
}

export default function AdminAnalyticsWorkspace({
  isAdminContentOnly,
  tracks,
  users,
  mathLessons,
  importedExams,
  errorQuestions,
  adminLogs,
  learningEvents,
  activeErrorQuestionCount,
  onOpenUsers,
  onOpenContent,
}: AdminAnalyticsWorkspaceProps) {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState<'intervention' | 'repair' | 'analytics' | 'beta'>('intervention');

  if (isAdminContentOnly) {
    return (
      <DeferredPanel label={t('aaw_loading_repair')}>
        <AdminContentRepairQueue onOpenContent={onOpenContent} />
      </DeferredPanel>
    );
  }

  const SUB_TABS = [
    { id: 'intervention', labelKey: 'aaw_tab_intervention' },
    { id: 'repair', labelKey: 'aaw_tab_repair' },
    { id: 'analytics', labelKey: 'aaw_tab_analytics' },
    { id: 'beta', labelKey: 'aaw_tab_beta' },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 sticky top-2 z-10">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-orange-500 text-slate-950 border-orange-500 shadow'
                : 'bg-slate-950/80 backdrop-blur border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {subTab === 'intervention' && (
        <DeferredPanel label={t('aaw_loading_intervention')}>
          <AdminInterventionQueue
            tracks={tracks}
            users={users}
            mathLessons={mathLessons}
            importedExams={importedExams}
            errorQuestions={errorQuestions}
            adminLogs={adminLogs}
            learningEvents={learningEvents}
            onOpenUsers={onOpenUsers}
            onOpenContent={onOpenContent}
          />
        </DeferredPanel>
      )}

      {subTab === 'repair' && (
        <DeferredPanel label={t('aaw_loading_repair')}>
          <AdminContentRepairQueue onOpenContent={onOpenContent} />
        </DeferredPanel>
      )}

      {subTab === 'analytics' && (
        <DeferredPanel label={t('aaw_loading_analytics')}>
          <AdminLearningAnalytics
            tracks={tracks}
            mathLessons={mathLessons}
            importedExams={importedExams}
            errorQuestions={errorQuestions}
            adminLogs={adminLogs}
            learningEvents={learningEvents}
          />
        </DeferredPanel>
      )}

      {subTab === 'beta' && (
        <DeferredPanel label={t('aaw_loading_beta')}>
          <BetaImplementationTracker
            tracks={tracks}
            users={users}
            mathLessons={mathLessons}
            importedExams={importedExams}
            adminLogs={adminLogs}
            learningEvents={learningEvents}
            errorQuestionCount={activeErrorQuestionCount}
          />
        </DeferredPanel>
      )}
    </div>
  );
}
