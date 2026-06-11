import React, { Suspense } from 'react';
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
  if (isAdminContentOnly) {
    return (
      <DeferredPanel label="Loading content repair queue">
        <AdminContentRepairQueue onOpenContent={onOpenContent} />
      </DeferredPanel>
    );
  }

  return (
    <>
      <DeferredPanel label="Loading intervention queue">
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

      <DeferredPanel label="Loading content repair queue">
        <AdminContentRepairQueue onOpenContent={onOpenContent} />
      </DeferredPanel>

      <DeferredPanel label="Loading learning analytics">
        <AdminLearningAnalytics
          tracks={tracks}
          mathLessons={mathLessons}
          importedExams={importedExams}
          errorQuestions={errorQuestions}
          adminLogs={adminLogs}
          learningEvents={learningEvents}
        />
      </DeferredPanel>

      <DeferredPanel label="Loading beta tracker">
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
    </>
  );
}
