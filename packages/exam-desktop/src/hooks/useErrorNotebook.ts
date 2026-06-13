import { useState, useEffect } from 'react';
import type { ErrorNotebookEntry, StorageAdapter } from '@miuprep/db';

interface UseErrorNotebookProps {
  db: StorageAdapter;
  userId: string;
  onRefreshHistory: () => Promise<void>;
}

export default function useErrorNotebook({ db, userId, onRefreshHistory }: UseErrorNotebookProps) {
  const [errorEntries, setErrorEntries] = useState<ErrorNotebookEntry[]>([]);
  const [notebookSearch, setNotebookSearch] = useState('');
  const [reviewQueue, setReviewQueue] = useState<ErrorNotebookEntry[]>([]);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(-1);
  const [reviewUserAnswer, setReviewUserAnswer] = useState('');
  const [reviewShowCorrect, setReviewShowCorrect] = useState(false);
  const [notebookFilter, setNotebookFilter] = useState<'all' | 'due'>('due');

  const loadErrorEntries = async () => {
    if (!db) return;
    try {
      const entries = await db.listErrorEntries(userId);
      setErrorEntries(entries.sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)));
    } catch (e) {
      console.error('Failed to load error entries in hook:', e);
    }
  };

  useEffect(() => {
    if (!db) return;
    db.listErrorEntries(userId)
      .then((entries) => {
        setErrorEntries(entries.sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)));
      })
      .catch((e) => {
        console.error('Failed to load error entries in hook:', e);
      });
  }, [db, userId]);

  const startNotebookReview = () => {
    const now = new Date();
    const due = errorEntries.filter((entry) => {
      if (notebookFilter === 'all') return true;
      return new Date(entry.nextReviewAt) <= now;
    });

    if (due.length === 0) return;

    setReviewQueue(due);
    setCurrentReviewIdx(0);
    setReviewUserAnswer('');
    setReviewShowCorrect(false);
  };

  const handleSrsGrade = async (grade: number) => {
    if (currentReviewIdx < 0 || currentReviewIdx >= reviewQueue.length || !db) return;
    const entry = reviewQueue[currentReviewIdx];

    try {
      await db.updateErrorEntrySrs(entry.id, grade);
      await loadErrorEntries();
      await onRefreshHistory();

      if (currentReviewIdx + 1 < reviewQueue.length) {
        setCurrentReviewIdx((prev) => prev + 1);
        setReviewUserAnswer('');
        setReviewShowCorrect(false);
      } else {
        setCurrentReviewIdx(-1);
        setReviewQueue([]);
      }
    } catch (e) {
      console.error('Failed to update SRS grade:', e);
    }
  };

  return {
    errorEntries,
    notebookSearch,
    reviewQueue,
    currentReviewIdx,
    reviewUserAnswer,
    reviewShowCorrect,
    notebookFilter,
    setErrorEntries,
    setNotebookSearch,
    setReviewQueue,
    setCurrentReviewIdx,
    setReviewUserAnswer,
    setReviewShowCorrect,
    setNotebookFilter,
    loadErrorEntries,
    startNotebookReview,
    handleSrsGrade,
  };
}
