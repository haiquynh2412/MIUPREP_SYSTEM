// Admin content-exam editor (open/edit/save exam drafts + export change sets)
// extracted from App.tsx (roadmap 2.2.3 GĐ2b — slim App.tsx). Owns the draft
// + selection state; the imported-exam list, auth, notifications, logging and
// active track are injected so the hook stays decoupled from the shell.
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  buildContentExamChangeSet,
  buildContentReviewChangeSetExport,
  countEditableExamQuestions,
  ensureEditableExamSections,
  savePersistedImportedExams,
  type ContentExamChangeSet,
  type ContentReviewChangeSetExport,
  type EditableExamSection,
  type ImportedExam,
} from '../lib/adminContent';
import { safeFilePart } from '../lib/fileUtils';
import type { LocalUser } from '@miuprep/db';

function downloadJsonFile(filename: string, payload: ContentExamChangeSet | ContentReviewChangeSetExport): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

interface UseContentExamEditorDeps {
  importedExams: ImportedExam[];
  setImportedExams: Dispatch<SetStateAction<ImportedExam[]>>;
  currentUser: LocalUser | null;
  adminActiveTab: 'math' | 'sat' | 'ielts' | 'cae' | 'cpe';
  showNotif: (text: string, type?: 'success' | 'error' | 'info') => void;
  logSystemEvent: (level: 'INFO' | 'WARN' | 'ERROR', message: string, payload?: unknown) => void | Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function useContentExamEditor({
  importedExams,
  setImportedExams,
  currentUser,
  adminActiveTab,
  showNotif,
  logSystemEvent,
  t,
}: UseContentExamEditorDeps) {
  const [selectedContentExamId, setSelectedContentExamId] = useState<string | null>(null);
  const [contentExamDraft, setContentExamDraft] = useState<ImportedExam | null>(null);

  const handleOpenContentExam = (exam: ImportedExam) => {
    const editableExam: ImportedExam = {
      ...exam,
      editableSections: ensureEditableExamSections(exam),
      reviewStatus: exam.reviewStatus || 'unchecked',
    };
    setSelectedContentExamId(exam.id);
    setContentExamDraft(editableExam);
  };

  const handleCloseContentExam = () => {
    setSelectedContentExamId(null);
    setContentExamDraft(null);
  };

  const updateContentExamDraft = (patch: Partial<ImportedExam>) => {
    setContentExamDraft((draft) => (draft ? { ...draft, ...patch } : draft));
  };

  const updateContentExamSection = (sectionIndex: number, patch: Partial<EditableExamSection>) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) =>
        index === sectionIndex ? { ...section, ...patch } : section,
      );
      return { ...draft, editableSections: sections };
    });
  };

  const updateContentExamQuestion = (
    sectionIndex: number,
    questionIndex: number,
    patch: Partial<EditableExamSection['questions'][number]>,
  ) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        const questions = section.questions.map((question, qIndex) =>
          qIndex === questionIndex ? { ...question, ...patch } : question,
        );
        return { ...section, questions };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleAddContentSection = () => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft);
      return {
        ...draft,
        editableSections: [
          ...sections,
          {
            id: `${draft.id}-section-${sections.length + 1}`,
            title: `Section ${sections.length + 1}`,
            questions: [],
          },
        ],
      };
    });
  };

  const handleAddContentQuestion = (sectionIndex: number) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        const nextIndex = section.questions.length + 1;
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `${section.id}-q${nextIndex}`,
              text: `Question ${nextIndex}`,
              answer: '',
            },
          ],
        };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleRemoveContentQuestion = (sectionIndex: number, questionIndex: number) => {
    setContentExamDraft((draft) => {
      if (!draft) return draft;
      const sections = ensureEditableExamSections(draft).map((section, index) => {
        if (index !== sectionIndex) return section;
        return { ...section, questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) };
      });
      return { ...draft, editableSections: sections };
    });
  };

  const handleSaveContentExamDraft = (
    reviewStatus: ImportedExam['reviewStatus'] = contentExamDraft?.reviewStatus || 'unchecked',
  ) => {
    if (!contentExamDraft) return;
    const editableSections = ensureEditableExamSections(contentExamDraft);
    const editedQuestionCount = countEditableExamQuestions(editableSections);
    const savedExam: ImportedExam = {
      ...contentExamDraft,
      title: contentExamDraft.title.trim() || contentExamDraft.title,
      duration: Math.max(1, Number(contentExamDraft.duration) || 1),
      questions: editedQuestionCount || Math.max(1, Number(contentExamDraft.questions) || 1),
      editableSections,
      reviewStatus,
      reviewer: currentUser?.username,
      reviewedAt: new Date().toISOString(),
    };
    setImportedExams((items) => {
      const nextExams = items.map((item) => (item.id === savedExam.id ? savedExam : item));
      savePersistedImportedExams(localStorage, nextExams);
      return nextExams;
    });
    setContentExamDraft(savedExam);
    logSystemEvent(
      'WARN',
      `Admin @${currentUser?.username} saved content exam ${savedExam.exam}: "${savedExam.title}" [${reviewStatus}]`,
    );
    showNotif(t('notif_save_exam_ok', { exam: savedExam.exam }), 'success');
  };

  const handleExportContentExamChangeSet = () => {
    if (!contentExamDraft) {
      showNotif('No open content exam to export.', 'error');
      return;
    }
    const previousExam = importedExams.find((item) => item.id === contentExamDraft.id) || null;
    const changeSet: ContentExamChangeSet = buildContentExamChangeSet(contentExamDraft, {
      previousExam,
      reviewer: currentUser?.username || 'admincontent',
    });
    downloadJsonFile(
      `miuprep-${contentExamDraft.exam.toLowerCase()}-${safeFilePart(contentExamDraft.id)}-changeset.json`,
      changeSet,
    );
    logSystemEvent(
      'INFO',
      `Admin @${currentUser?.username} exported content change set ${contentExamDraft.exam}: "${contentExamDraft.title}"`,
    );
    showNotif(t('notif_exported_changeset', { exam: contentExamDraft.exam }), 'success');
  };

  const handleExportContentReviewSet = () => {
    const trackExams = importedExams.filter((exam) => exam.exam.toLowerCase() === adminActiveTab);
    if (!trackExams.length) {
      showNotif(t('notif_no_exams_export', { tab: adminActiveTab.toUpperCase() }), 'error');
      return;
    }
    const exportPayload: ContentReviewChangeSetExport = buildContentReviewChangeSetExport(trackExams, {
      track: adminActiveTab,
      reviewer: currentUser?.username || 'admincontent',
    });
    downloadJsonFile(`miuprep-${adminActiveTab}-review-changesets.json`, exportPayload);
    logSystemEvent(
      'INFO',
      `Admin @${currentUser?.username} exported ${adminActiveTab.toUpperCase()} review change set (${trackExams.length} exams)`,
    );
    showNotif(t('notif_exported_review', { tab: adminActiveTab.toUpperCase() }), 'success');
  };

  return {
    selectedContentExamId,
    contentExamDraft,
    handleOpenContentExam,
    handleCloseContentExam,
    updateContentExamDraft,
    updateContentExamSection,
    updateContentExamQuestion,
    handleAddContentSection,
    handleAddContentQuestion,
    handleRemoveContentQuestion,
    handleSaveContentExamDraft,
    handleExportContentExamChangeSet,
    handleExportContentReviewSet,
  };
}
