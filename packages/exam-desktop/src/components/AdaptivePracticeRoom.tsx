/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef, useMemo } from 'react';
import type { IeltsTest, IeltsQuestion } from '@miuprep/content';
import { buildEnglishLearningCatalog, filterEnglishExamTestsToLearningReady } from '@miuprep/content/src/english-learning';
import type { StorageAdapter } from '@miuprep/db';
import { isCorrectAnswer, generateAdaptiveDiagnostic } from '@miuprep/core';
import { sanitizeHtml } from '@miuprep/ui';




interface Weakness {
  questionType: string;
  correct: number;
  total: number;
  accuracy: number;
  status: 'proficient' | 'needs_improvement' | 'critical';
}

interface AdaptivePracticeRoomProps {
  availableTests: IeltsTest[];
  db: StorageAdapter;
  userId: string;
  weaknesses: Weakness[];
  onHistoryReload: () => Promise<void>;
  activeTrack?: 'ielts' | 'cpe' | 'cae' | null;
  autoLaunchPracticeType?: string | null;
  clearAutoLaunch?: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'exam' | 'writing_ai' | 'error_notebook' | 'speaking_ai' | 'adaptive_room') => void;
}

interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  notes?: string;
  isMastered: boolean;
  createdAt: string;
}

const TOPICS = [
  {
    id: 'reading',
    name: 'Đọc & Sử dụng Anh ngữ (Reading & Use of English)',
    icon: '📖',
    color: 'from-emerald-500 to-teal-600',
    types: [
      { id: 'cpe_part_1', name: 'Part 1: Multiple-choice cloze (Trắc nghiệm điền từ)' },
      { id: 'cpe_part_2', name: 'Part 2: Open cloze (Điền từ tự do)' },
      { id: 'cpe_part_3', name: 'Part 3: Word formation (Biến đổi dạng từ)' },
      { id: 'cpe_part_4', name: 'Part 4: Key word transformation (Viết lại câu dùng từ gợi ý)' },
      { id: 'cpe_part_5', name: 'Part 5: Multiple choice reading (Đọc hiểu trắc nghiệm)' },
      { id: 'cpe_part_6', name: 'Part 6: Gapped text (Đọc hiểu điền đoạn văn)' },
      { id: 'cpe_part_7', name: 'Part 7: Multiple matching (Nối thông tin)' }
    ]
  },
  {
    id: 'listening',
    name: 'Kỹ năng Nghe C2 (Listening)',
    icon: '🎧',
    color: 'from-teal-500 to-cyan-600',
    types: [
      { id: 'cpe_listen_part_1', name: 'Part 1: Multiple choice (Trắc nghiệm hội thoại ngắn)' },
      { id: 'cpe_listen_part_2', name: 'Part 2: Sentence completion (Điền từ hoàn thành câu)' },
      { id: 'cpe_listen_part_3', name: 'Part 3: Multiple choice (Trắc nghiệm hội thoại dài)' },
      { id: 'cpe_listen_part_4', name: 'Part 4: Multiple matching (Nghe nối thông tin kép)' }
    ]
  },
  {
    id: 'writing',
    name: 'Kỹ năng Viết C2 (Writing)',
    icon: '✍️',
    color: 'from-amber-500 to-orange-600',
    types: [
      { id: 'cpe_write_part_1', name: 'Part 1: Compulsory Essay (Viết luận tóm tắt & đánh giá)' },
      { id: 'cpe_write_part_2', name: 'Part 2: Optional Task (Bài viết tự chọn - Thư/Báo cáo/Review)' }
    ]
  },
  {
    id: 'speaking',
    name: 'Kỹ năng Nói C2 (Speaking)',
    icon: '🗣️',
    color: 'from-rose-500 to-pink-600',
    types: [
      { id: 'cpe_speak_part_1', name: 'Part 1: Interview (Phỏng vấn giao tiếp xã hội)' },
      { id: 'cpe_speak_part_2', name: 'Part 2: Collaborative Task (Thảo luận tranh ảnh đồng thuận)' },
      { id: 'cpe_speak_part_3', name: 'Part 3: Long Turn (Độc thoại và thảo luận sâu)' }
    ]
  },
  {
    id: 'grammar',
    name: 'Ngữ pháp & Từ vựng C2 (Grammar & Vocabulary)',
    icon: '📝',
    color: 'from-purple-500 to-violet-600',
    types: [
      { id: 'cpe_gram_inversion', name: 'Advanced Inversion & Subjunctive (Đảo ngữ & Giả định)' },
      { id: 'cpe_gram_collocation', name: 'Advanced Collocations & C2 Idioms (Cụm từ & Thành ngữ)' },
      { id: 'cpe_gram_mcq', name: 'C2 Grammar MCQs (Trắc nghiệm ngữ pháp C2 nâng cao)' }
    ]
  }
];

export default function AdaptivePracticeRoom({
  availableTests,
  db,
  userId,
  weaknesses,
  onHistoryReload,
  activeTrack,
  autoLaunchPracticeType,
  clearAutoLaunch,
  onNavigateTab,
}: AdaptivePracticeRoomProps) {
  // Navigation & Config state
  const [activeRoomTab, setActiveRoomTab] = useState<'practice' | 'vocab'>('practice');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [_showExamTips, _setShowExamTips] = useState<boolean>(true);
  
  // Active practice exam states
  const [isActive, setIsActive] = useState(false);
  const [miniTest, setMiniTest] = useState<IeltsTest | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  // Instant per-question feedback states
  const [currentPracticeQuestionIdx, setCurrentPracticeQuestionIdx] = useState(0);
  const [_isCurrentQuestionChecked, setIsCurrentQuestionChecked] = useState(false);
  const [immediateAnswersChecked, setImmediateAnswersChecked] = useState<Record<string, { isCorrect: boolean; rawAnswer: string }>>({});

  // Spaced progression states
  const [completedQIds, setCompletedQIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`completed_practice_questions_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [lastPracticeTypeId, setLastPracticeTypeId] = useState<string | null>(null);

  // Vocabulary list states
  const [vocabList, setVocabList] = useState<VocabWord[]>(() => {
    try {
      const stored = localStorage.getItem(`user_vocab_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Text selection states
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWordMeaning, setNewWordMeaning] = useState('');
  const [newWordExample, setNewWordExample] = useState('');
  const [newWordNotes, setNewWordNotes] = useState('');

  // Vocabulary Review states
  const [reviewMode, setReviewMode] = useState<'list' | 'flashcard' | 'quiz'>('list');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Quiz specific states
  const [quizWord, setQuizWord] = useState<VocabWord | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startFocusedPracticeRef = useRef<(typeId: string) => void>(() => undefined);
  const activeProgramIds = useMemo(() => (activeTrack ? [activeTrack] : undefined), [activeTrack]);
  const learningCatalog = useMemo(
    () => buildEnglishLearningCatalog(availableTests, {
      programIds: activeProgramIds,
      displayModes: ['both', 'topic'],
    }),
    [activeProgramIds, availableTests],
  );
  const adaptiveReadyTests = useMemo(
    () => filterEnglishExamTestsToLearningReady(availableTests, {
      programIds: activeProgramIds,
      displayModes: ['both', 'topic'],
    }) as IeltsTest[],
    [activeProgramIds, availableTests],
  );

  // Save vocabulary list to localstorage
  useEffect(() => {
    localStorage.setItem(`user_vocab_${userId}`, JSON.stringify(vocabList));
  }, [vocabList, userId]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    startFocusedPracticeRef.current = startFocusedPractice;
  });

  // Handle auto-launching from dashboard
  useEffect(() => {
    if (autoLaunchPracticeType) {
      startFocusedPracticeRef.current(autoLaunchPracticeType);
      if (clearAutoLaunch) clearAutoLaunch();
    }
  }, [autoLaunchPracticeType, clearAutoLaunch]);

  const getWeaknessStats = (typeId: string) => {
    return weaknesses.find(w => w.questionType === typeId);
  };

  // Text Selection Detector
  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    
    if (text && text.length > 0 && text.length < 80) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFloatingPos({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - 40
        });
        setSelectedText(text);
        setShowFloatingBtn(true);
      } catch (err) {
        setShowFloatingBtn(false);
      }
    } else {
      setShowFloatingBtn(false);
    }
  };

  // Clear selection popup
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.floating-toolbar')) {
        return;
      }
      setTimeout(() => {
        setShowFloatingBtn(false);
      }, 200);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Highlight Selection
  const highlightSelection = (styleClass: string) => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = styleClass;
    
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
      setShowFloatingBtn(false);
    } catch (e) {
      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();
        setShowFloatingBtn(false);
      } catch (err) {
        console.error('Failed to highlight text:', err);
      }
    }
  };

  // Clear Highlights / Underlines
  const clearSelectionStyling = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode!;
    }
    
    const parentElement = parent as HTMLElement;
    if (parentElement && parentElement.tagName === 'SPAN' && 
        (parentElement.className.includes('bg-yellow-') || parentElement.className.includes('underline'))) {
      const parentNode = parentElement.parentNode!;
      while (parentElement.firstChild) {
        parentNode.insertBefore(parentElement.firstChild, parentElement);
      }
      parentNode.removeChild(parentElement);
      selection.removeAllRanges();
      setShowFloatingBtn(false);
    }
  };

  // Save new vocab word
  const handleSaveVocab = () => {
    if (!selectedText.trim() || !newWordMeaning.trim()) {
      alert('Vui lòng điền nghĩa của từ mới!');
      return;
    }
    const newWord: VocabWord = {
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      word: selectedText.trim(),
      meaning: newWordMeaning.trim(),
      example: newWordExample.trim() || undefined,
      notes: newWordNotes.trim() || undefined,
      isMastered: false,
      createdAt: new Date().toISOString()
    };
    setVocabList([newWord, ...vocabList]);
    setShowAddModal(false);
    setNewWordMeaning('');
    setNewWordExample('');
    setNewWordNotes('');
    setSelectedText('');
    alert(`Đã thêm "${newWord.word}" vào Sổ từ vựng của bạn!`);
  };

  const deleteVocabWord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa từ này khỏi từ điển?')) {
      setVocabList(vocabList.filter(v => v.id !== id));
    }
  };

  const toggleVocabMastery = (id: string) => {
    setVocabList(vocabList.map(v => v.id === id ? { ...v, isMastered: !v.isMastered } : v));
  };

  // Start Focused Practice for Reading / Listening / Grammar
  function startFocusedPractice(typeId: string) {
    setErrorMsg(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setLastPracticeTypeId(typeId);
    setCurrentPracticeQuestionIdx(0);
    setIsCurrentQuestionChecked(false);
    setImmediateAnswersChecked({});
    
    // Redirect logic for Writing and Speaking
    if (typeId.includes('write')) {
      if (onNavigateTab) {
        onNavigateTab('writing_ai');
      } else {
        alert('Chuyên đề viết được hỗ trợ nâng cao tại tab "Writing AI Evaluation". Vui lòng chọn tab đó để được Socratic AI chấm và nhận xét chi tiết!');
      }
      return;
    }
    if (typeId.includes('speak')) {
      if (onNavigateTab) {
        onNavigateTab('speaking_ai');
      } else {
        alert('Chuyên đề nói được hỗ trợ tương tác giọng nói thời gian thực tại tab "Speaking AI Room". Vui lòng chọn tab đó để được luyện nói trực tiếp!');
      }
      return;
    }

    // Progression cycle analysis: count all questions of this type to see if we should reset progress
    const allQuestionsOfType = adaptiveReadyTests.flatMap(t => t.sections || []).flatMap(s => s.questionGroups || []).flatMap(g => g.questions || []).filter(q => {
      if (q.displayMode === 'test') return false;
      const qCat = (q as any).category;
      const isCategoryFilter = typeId.startsWith('category:');
      const filterVal = isCategoryFilter ? typeId.substring(9) : typeId;
      if (isCategoryFilter) {
        if (filterVal === 'collocations') return qCat === 'cpe_part_1' || qCat === 'cpe_part_4' || qCat === 'collocations';
        if (filterVal === 'phrasal_verbs') return qCat === 'cpe_part_1' || qCat === 'cpe_part_2' || qCat === 'phrasal_verbs';
        if (filterVal === 'idioms') return qCat === 'cpe_part_2' || qCat === 'cpe_part_4' || qCat === 'idioms';
        if (filterVal === 'prepositions') return qCat === 'cpe_part_2' || qCat === 'prepositions';
        if (filterVal === 'word_formation') return qCat === 'cpe_part_3' || qCat === 'word_formation';
        if (filterVal === 'reading_comprehension') return qCat === 'cpe_part_5' || qCat === 'reading_comprehension';
        return qCat === filterVal;
      } else {
        let isMatch = q.type === filterVal || qCat === filterVal;
        if (!isMatch) {
          if (filterVal === 'gapped_text') isMatch = qCat === 'cpe_part_6';
          else if (filterVal === 'multiple_matching') isMatch = qCat === 'cpe_part_7';
          else if (filterVal === 'cpe_listen_part_1') isMatch = qCat === 'cpe_listen_part_1';
          else if (filterVal === 'cpe_listen_part_2') isMatch = qCat === 'cpe_listen_part_2';
          else if (filterVal === 'cpe_listen_part_3') isMatch = qCat === 'cpe_listen_part_3';
          else if (filterVal === 'cpe_listen_part_4') isMatch = qCat === 'cpe_listen_part_4';
        }
        return isMatch;
      }
    });

    let currentCompletedList = completedQIds;
    const completedOfType = allQuestionsOfType.filter(q => completedQIds.includes(q.id));
    
    // Cycle reset: if the student has finished all available questions for this topic, wipe progress for this topic
    if (completedOfType.length >= allQuestionsOfType.length && allQuestionsOfType.length > 0) {
      const newCompleted = completedQIds.filter(id => !allQuestionsOfType.some(q => q.id === id));
      setCompletedQIds(newCompleted);
      localStorage.setItem(`completed_practice_questions_${userId}`, JSON.stringify(newCompleted));
      currentCompletedList = newCompleted;
    }

    const adaptiveTest = generateAdaptiveDiagnostic(adaptiveReadyTests, typeId, currentCompletedList);
    if (!adaptiveTest) {
      setErrorMsg(
        `Không tìm thấy câu hỏi tương thích cho dạng bài này trong ngân hàng đề thi hiện tại. Vui lòng làm thêm đề thi chuẩn để mở rộng ngân hàng câu hỏi thích ứng.`
      );
      return;
    }

    setMiniTest(adaptiveTest);
    setActiveGroupIdx(0);
    setRemainingSeconds(3600); // 60 mins
    setIsActive(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleAutoSubmit = () => {
    submitFocusedExam(userAnswers);
  };

  const handleCheckCurrentQuestion = async (q: IeltsQuestion) => {
    if (!q) return;
    const uAns = userAnswers[q.id] || '';
    const isCorrect = isCorrectAnswer(uAns, q.acceptedAnswers);
    
    setImmediateAnswersChecked(prev => ({
      ...prev,
      [q.id]: { isCorrect, rawAnswer: uAns }
    }));
    setIsCurrentQuestionChecked(true);

    // Save incorrect responses directly to SRS Error Notebook instantly!
    if (!isCorrect) {
      try {
        const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const entry = {
          id: `error_adaptive_${q.id}_${uuid}`,
          userId: userId,
          attemptId: miniTest?.id || 'adaptive_mistake',
          questionId: q.id,
          questionType: q.type,
          userAnswer: uAns,
          correctAnswer: q.acceptedAnswers[0]?.[0] || '',
          explanation: q.explanation || `Dạng bài này yêu cầu điền đáp án chuẩn: ${q.acceptedAnswers[0]?.[0] || ''}`,
          intervalDays: 1, 
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewAt: new Date().toISOString(), 
          createdAt: new Date().toISOString(),
        };
        await db.addErrorEntry(entry);
        await onHistoryReload();
      } catch (e) {
        console.error('Failed to add live adaptive failure to Error Notebook:', e);
      }
    }
  };

  const handleFinishPractice = async () => {
    if (!miniTest) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);

    const allQuestions: IeltsQuestion[] = [];
    miniTest.sections[0].questionGroups.forEach((grp) => {
      if (grp && grp.questions) {
        allQuestions.push(...grp.questions);
      }
    });

    let correctCount = 0;
    allQuestions.forEach((q) => {
      const uAns = userAnswers[q.id] || '';
      const isCorrect = isCorrectAnswer(uAns, q.acceptedAnswers);
      if (isCorrect) {
        correctCount++;
      }
    });

    setScore({ correct: correctCount, total: allQuestions.length });
    setIsSubmitted(true);

    // Save completed questions to progress list
    const newCompletedIds = [...completedQIds];
    allQuestions.forEach(q => {
      if (!newCompletedIds.includes(q.id)) {
        newCompletedIds.push(q.id);
      }
    });
    setCompletedQIds(newCompletedIds);
    localStorage.setItem(`completed_practice_questions_${userId}`, JSON.stringify(newCompletedIds));
    await onHistoryReload();
  };

  const submitFocusedExam = async (currentAnswers: Record<string, string>) => {
    if (!miniTest) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);

    const allQuestions: IeltsQuestion[] = [];
    miniTest.sections[0].questionGroups.forEach((grp) => {
      if (grp && grp.questions) {
        allQuestions.push(...grp.questions);
      }
    });

    let correctCount = 0;
    const failedQuestions: {
      id: string;
      type: string;
      userAnswer: string;
      correctAnswer: string;
      explanation: string;
    }[] = [];

    allQuestions.forEach((q: IeltsQuestion) => {
      const uAns = currentAnswers[q.id] || '';
      const isCorrect = isCorrectAnswer(uAns, q.acceptedAnswers);
      if (isCorrect) {
        correctCount++;
      } else {
        failedQuestions.push({
          id: q.id,
          type: q.type,
          userAnswer: uAns,
          correctAnswer: q.acceptedAnswers[0]?.[0] || '',
          explanation: q.explanation || `Dạng bài này yêu cầu điền đáp án chuẩn: ${q.acceptedAnswers[0]?.[0] || ''}`,
        });
      }
    });

    setScore({ correct: correctCount, total: allQuestions.length });
    setIsSubmitted(true);

    // Save completed questions to progress list
    const newCompletedIds = [...completedQIds];
    allQuestions.forEach(q => {
      if (!newCompletedIds.includes(q.id)) {
        newCompletedIds.push(q.id);
      }
    });
    setCompletedQIds(newCompletedIds);
    localStorage.setItem(`completed_practice_questions_${userId}`, JSON.stringify(newCompletedIds));

    // Save incorrect responses directly to SRS Error Notebook
    if (failedQuestions.length > 0) {
      try {
        for (const failed of failedQuestions) {
          const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
          const entry = {
            id: `error_adaptive_${failed.id}_${uuid}`,
            userId: userId,
            attemptId: miniTest.id,
            questionId: failed.id,
            questionType: failed.type,
            userAnswer: failed.userAnswer,
            correctAnswer: failed.correctAnswer,
            explanation: failed.explanation,
            intervalDays: 1, 
            easeFactor: 2.5,
            repetitions: 0,
            nextReviewAt: new Date().toISOString(), 
            createdAt: new Date().toISOString(),
          };
          await db.addErrorEntry(entry);
        }
        await onHistoryReload();
      } catch (e) {
        console.error('Failed to add adaptive failures to Error Notebook:', e);
      }
    }
  };

  // Generate Vocabulary Quiz
  const startQuiz = () => {
    const unmastered = vocabList.filter(v => !v.isMastered);
    if (unmastered.length === 0) {
      alert('Bạn chưa lưu từ mới nào hoặc đã thuộc hết từ vựng! Hãy lưu thêm từ vựng để bắt đầu Quiz.');
      return;
    }
    const target = unmastered[Math.floor(Math.random() * unmastered.length)];
    setQuizWord(target);

    // Generate dummy options
    const distractorPool = vocabList.filter(v => v.id !== target.id).map(v => v.meaning);
    const standardDistractors = ['Không có nghĩa này', 'Cụm từ chỉ hành động làm sạch', 'Cực kỳ nhạy cảm trước môi trường', 'Không ngừng cố gắng'];
    
    const chosenDistractors: string[] = [];
    for (let i = 0; i < 3; i++) {
      if (distractorPool.length > 0) {
        const randIdx = Math.floor(Math.random() * distractorPool.length);
        chosenDistractors.push(distractorPool.splice(randIdx, 1)[0]);
      } else {
        chosenDistractors.push(standardDistractors[i]);
      }
    }

    const allOpts = [target.meaning, ...chosenDistractors].sort(() => Math.random() - 0.5);
    setQuizOptions(allOpts);
    setSelectedQuizOpt(null);
    setIsQuizAnswered(false);
    setReviewMode('quiz');
  };

  const getGappedTextParagraphs = (grp: any) => {
    if (!grp) return [];
    if (grp.paragraphOptions && Array.isArray(grp.paragraphOptions)) {
      return grp.paragraphOptions.map((po: any) => ({
        label: po.label || po.id || '',
        text: po.text || ''
      }));
    }
    const firstQ = grp.questions?.[0];
    if (firstQ && Array.isArray(firstQ.options) && firstQ.options[0]?.length > 5) {
      return firstQ.options.map((opt: string) => {
        const label = opt.substring(0, 1);
        const text = opt.substring(2).trim(); // Skip "A. " or "A "
        return { label, text };
      });
    }
    return [];
  };

  const currentGroup = miniTest?.sections?.[0]?.questionGroups?.[activeGroupIdx];
  const isGappedText = currentGroup?.questions?.[0]?.type === 'gapped_text';
  const paragraphs = getGappedTextParagraphs(currentGroup);
  const questionsInGroup = currentGroup?.questions || [];
  const activeQuestion = questionsInGroup[currentPracticeQuestionIdx];

  const renderQuestionCard = (q: IeltsQuestion, idx: number) => {
    if (!q) return null;
    const isCorrect = immediateAnswersChecked[q.id]?.isCorrect;
    const isChecked = immediateAnswersChecked[q.id] !== undefined;

    return (
      <div key={q.id} className="border border-slate-200 bg-slate-50/50 p-6 rounded-2xl flex flex-col gap-4 text-xs text-slate-750 text-left shadow-sm">
        <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accentdeep-100 text-accentdeep-700 flex items-center justify-center text-xs font-black shrink-0">
            {idx + 1}
          </span>
          Câu hỏi {idx + 1}: {q.instruction.replace('______', '(Điền đáp án vào đây)')}
        </span>

        {/* Gap Fill Input */}
        {q.type === 'gap_fill' && (
          <input
            type="text"
            value={userAnswers[q.id] || ''}
            disabled={isChecked}
            onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
            placeholder="Điền đáp án của bạn..."
            className="border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:border-accentdeep-500 bg-white text-slate-800 max-w-sm font-semibold shadow-inner"
          />
        )}

        {/* Button Selectors (Gapped Text / Multiple Matching) */}
        {(q.type === 'gapped_text' || q.type === 'multiple_matching') && (
          <div className="flex gap-2 flex-wrap mt-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, q.options?.length || 8).map((char) => {
              const isSelected = userAnswers[q.id] === char;
              return (
                <button
                  key={char}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setUserAnswers({ ...userAnswers, [q.id]: char })}
                  className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all border outline-none ${
                    isSelected
                      ? 'bg-accentdeep-600 text-white border-accentdeep-500 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/50 hover:border-slate-350'
                  } disabled:cursor-not-allowed`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        )}

        {/* Multiple Choice Radio */}
        {q.type === 'multiple_choice' && q.options && (
          <div className="flex flex-col gap-2.5 mt-1">
            {q.options.map((opt: string) => {
              const char = opt.substring(0, 1);
              const isSelected = userAnswers[q.id] === char;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 cursor-pointer border p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-accentdeep-50 border-accentdeep-300 font-bold text-accentdeep-900 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  } ${isChecked ? 'cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={char}
                    disabled={isChecked}
                    checked={isSelected}
                    onChange={() => setUserAnswers({ ...userAnswers, [q.id]: char })}
                    className="text-accentdeep-600 focus:ring-accentdeep-500 disabled:opacity-50"
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* True/False/Not Given Radio */}
        {q.type === 'true_false_not_given' && (
          <div className="flex gap-3 mt-1 flex-wrap">
            {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => {
              const isSelected = userAnswers[q.id] === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 cursor-pointer border px-4 py-2.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-accentdeep-50 border-accentdeep-300 font-bold text-accentdeep-950 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  } ${isChecked ? 'cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    disabled={isChecked}
                    checked={isSelected}
                    onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                    className="text-accentdeep-600 focus:ring-accentdeep-500 disabled:opacity-50"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Socratic Hint Box during live practice */}
        {!isChecked && (
          <div className="mt-1 text-left">
            <details className="cursor-pointer group">
              <summary className="text-[10px] text-accentdeep-600 font-bold hover:text-accentdeep-800 flex items-center gap-1 outline-none select-none">
                <span>💡 Xem gợi ý tư duy Socratic</span>
              </summary>
              <div className="mt-2 p-3 bg-accentdeep-50 border border-accentdeep-100 rounded-xl text-[10px] leading-relaxed text-accentdeep-950 font-sans shadow-sm">
                Dạng bài này yêu cầu bạn tìm từ hoặc cụm từ đồng nghĩa (paraphrase) trong bài đọc để xác nhận đáp án chuẩn nhất. Hãy chú ý cấu trúc ngữ pháp và sắc thái từ vựng.
              </div>
            </details>
          </div>
        )}

        {/* Feedback Alert Panel */}
        {isChecked && (
          isCorrect ? (
            <div className="mt-2 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs flex flex-col gap-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span className="text-sm">🎉</span>
                <span>CHÍNH XÁC! (Correct Answer)</span>
              </div>
              <div className="text-slate-700 leading-relaxed mt-1">
                <strong>Giải thích sư phạm:</strong> {q.explanation || 'Không có giải thích.'}
              </div>
              {q.answerLocation && (
                <div className="mt-2 border-t border-emerald-100 pt-2 text-[11px] text-slate-500 italic">
                  <strong>Dẫn chứng từ bài đọc:</strong> "{q.answerLocation}"
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 p-4 bg-rose-50/80 border border-rose-200 rounded-xl text-xs flex flex-col gap-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <span className="text-sm">❌</span>
                <span>CHƯA CHÍNH XÁC! (Incorrect)</span>
              </div>
              <div className="text-slate-700 mt-1">
                <span className="font-semibold">Đáp án đúng:</span>{' '}
                <span className="font-mono bg-white border px-2 py-0.5 rounded text-xs font-bold text-emerald-700 shadow-sm">
                  {q.acceptedAnswers[0]?.[0] || ''}
                </span>
              </div>
              <div className="text-slate-700 leading-relaxed mt-1">
                <strong>Giải thích sư phạm:</strong> {q.explanation || 'Không có giải thích.'}
              </div>
              {q.answerLocation && (
                <div className="mt-2 border-t border-rose-100 pt-2 text-[11px] text-slate-500 italic">
                  <strong>Dẫn chứng từ bài đọc:</strong> "{q.answerLocation}"
                </div>
              )}
            </div>
          )
        )}

        {/* Per-Question Navigation Controls */}
        <div className="flex items-center justify-between border-t pt-4 mt-3">
          {!isChecked ? (
            <button
              onClick={() => handleCheckCurrentQuestion(q)}
              disabled={!userAnswers[q.id]}
              className="bg-accentdeep-600 hover:bg-accentdeep-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-all border-0 outline-none cursor-pointer disabled:cursor-not-allowed ml-auto"
            >
              Kiểm tra đáp án ✓
            </button>
          ) : (
            <>
              {currentPracticeQuestionIdx > 0 ? (
                <button
                  onClick={() => {
                    setCurrentPracticeQuestionIdx(currentPracticeQuestionIdx - 1);
                    const prevQ = questionsInGroup[currentPracticeQuestionIdx - 1];
                    setIsCurrentQuestionChecked(immediateAnswersChecked[prevQ.id] !== undefined);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer border-0 transition-all outline-none"
                >
                  ← Câu trước
                </button>
              ) : <div />}

              {currentPracticeQuestionIdx < questionsInGroup.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentPracticeQuestionIdx(currentPracticeQuestionIdx + 1);
                    const nextQ = questionsInGroup[currentPracticeQuestionIdx + 1];
                    setIsCurrentQuestionChecked(immediateAnswersChecked[nextQ.id] !== undefined);
                  }}
                  className="bg-accentdeep-600 hover:bg-accentdeep-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer border-0 transition-all outline-none shadow-sm ml-auto"
                >
                  Câu tiếp theo →
                </button>
              ) : activeGroupIdx < (miniTest?.sections?.[0]?.questionGroups?.length ?? 0) - 1 ? (
                <button
                  onClick={() => {
                    setActiveGroupIdx(activeGroupIdx + 1);
                    setCurrentPracticeQuestionIdx(0);
                    setIsCurrentQuestionChecked(false);
                  }}
                  className="bg-accentdeep-600 hover:bg-accentdeep-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer border-0 transition-all outline-none shadow-sm ml-auto"
                >
                  Đoạn tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleFinishPractice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer border-0 transition-all outline-none shadow ml-auto"
                >
                  Hoàn thành & Xem kết quả ✓
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-left">
      {/* 3D Flipping Card CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .flashcard-container {
          perspective: 1000px;
        }
        .flashcard-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }
      ` }} />

      {/* Floating Selection Toolbar */}
      {showFloatingBtn && floatingPos && (
        <div
          style={{ left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }}
          className="floating-toolbar absolute z-50 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xl scale-100 hover:scale-[1.02] transition-all cursor-default select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowFloatingBtn(false);
              setShowAddModal(true);
            }}
            className="hover:text-emerald-400 font-bold text-xs flex items-center gap-1.5 bg-transparent border-0 cursor-pointer outline-none transition-colors text-slate-200"
            title="Thêm từ hoặc cụm từ bôi đen vào Sổ từ vựng cá nhân"
          >
            <span>➕ Sổ từ</span>
          </button>
          
          <div className="h-3.5 w-[1px] bg-slate-800" />
          
          <button
            onClick={() => highlightSelection('bg-yellow-250 text-slate-950 font-medium px-1.5 py-0.5 rounded shadow-sm')}
            className="hover:text-yellow-400 font-bold text-xs flex items-center gap-1.5 bg-transparent border-0 cursor-pointer outline-none transition-colors text-slate-200"
            title="Tô màu bút nhớ dòng (Màu vàng)"
          >
            <span>🖍️ Bút nhớ</span>
          </button>

          <div className="h-3.5 w-[1px] bg-slate-800" />

          <button
            onClick={() => highlightSelection('underline decoration-amber-500 decoration-2 underline-offset-2 font-semibold')}
            className="hover:text-cyan-400 font-bold text-xs flex items-center gap-1.5 bg-transparent border-0 cursor-pointer outline-none transition-colors text-slate-200"
            title="Gạch chân từ quan trọng"
          >
            <span>🔗 Gạch chân</span>
          </button>

          <div className="h-3.5 w-[1px] bg-slate-800" />

          <button
            onClick={clearSelectionStyling}
            className="hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 bg-transparent border-0 cursor-pointer outline-none transition-colors text-slate-200"
            title="Xóa nhớ dòng hoặc gạch chân tại vùng chọn"
          >
            <span>🧹 Xóa</span>
          </button>
        </div>
      )}

      {/* Add New Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full flex flex-col gap-4 text-left text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📓</span> Lưu Từ Vựng / Cụm Từ Mới
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Từ / Cụm từ gốc</span>
              <span className="font-mono text-sm font-black text-emerald-400 bg-slate-950 px-3 py-2 rounded border border-slate-850">
                {selectedText}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Nghĩa tiếng Việt *</span>
              <input
                type="text"
                placeholder="Ví dụ: nhạy cảm với môi trường, tạo dựng dấu ấn..."
                value={newWordMeaning}
                onChange={e => setNewWordMeaning(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Ví dụ ngữ cảnh (Không bắt buộc)</span>
              <textarea
                placeholder="Dán câu có cụm từ này vào..."
                value={newWordExample}
                onChange={e => setNewWordExample(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold h-16 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Ghi chú riêng (Không bắt buộc)</span>
              <input
                type="text"
                placeholder="Cố định đi kèm với giới từ..."
                value={newWordNotes}
                onChange={e => setNewWordNotes(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2 rounded-lg cursor-pointer text-xs border-0 outline-none text-center"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveVocab}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg cursor-pointer text-xs border-0 outline-none text-center"
              >
                Lưu vào từ điển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Room Navigation Header */}
      {!isActive && (
        <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-850 m-0">
              Phòng Ôn Luyện Thích Ứng & Sổ Từ Vựng C2
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Phân chia chuyên đề thông minh, lấp đầy lỗ hổng kiến thức và quản trị từ vựng nâng cao chuẩn Cambridge CPE.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveRoomTab('practice')}
              className={`py-2 px-4 text-xs font-bold rounded-lg transition-all border-0 outline-none cursor-pointer ${
                activeRoomTab === 'practice' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📖 Chuyên Đề Học Tập
            </button>
            <button
              onClick={() => setActiveRoomTab('vocab')}
              className={`py-2 px-4 text-xs font-bold rounded-lg transition-all border-0 outline-none cursor-pointer flex items-center gap-1.5 ${
                activeRoomTab === 'vocab' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📓 Sổ Từ Vựng
              {vocabList.filter(v => !v.isMastered).length > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {vocabList.filter(v => !v.isMastered).length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE TAB: SKILLS & QUESTION TYPES */}
      {activeRoomTab === 'practice' && !isActive && !isSubmitted && (
        <div className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-xs leading-relaxed max-w-3xl">
              ⚠️ <strong>Hệ thống lưu ý:</strong> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Learning-ready questions</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{learningCatalog.coverage.readyQuestions}</div>
            </div>
            <div className="bg-white border border-amber-100 rounded-lg p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Blocked by quality gate</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{learningCatalog.coverage.blockedQuestions}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Ready practice tests</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{adaptiveReadyTests.length}</div>
            </div>
          </div>

          {!selectedTopic ? (
            /* First Level: Topics Grid */
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider m-0">Bước 1: Chọn Chuyên Đề Đề Nghị</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {TOPICS.map((topic) => {
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="border border-slate-200 rounded-xl p-5 bg-white hover:border-emerald-400 shadow-sm hover:shadow transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer outline-none group text-slate-800"
                    >
                      <span className="text-4xl filter group-hover:scale-110 transition-transform">{topic.icon}</span>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight m-0">{topic.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{topic.types.length} dạng bài tích hợp</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Second Level: Question Types list inside chosen topic */
            <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-3xl">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TOPICS.find(t => t.id === selectedTopic)?.icon}</span>
                  <h3 className="text-base font-bold text-slate-800 m-0">
                    Chuyên đề: {TOPICS.find(t => t.id === selectedTopic)?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTopic('')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-1.5 px-3 rounded-lg border-0 cursor-pointer outline-none transition-all uppercase tracking-wide"
                >
                  {"← Quay lại"}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bước 2: Chọn dạng bài thi thử (5 phút):</span>
                {TOPICS.find(t => t.id === selectedTopic)?.types.map((type) => {
                  const stats = getWeaknessStats(type.id);
                  const isCritical = stats ? stats.accuracy < 60 : false;
                  
                  return (
                    <div
                      key={type.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-150 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all gap-4 text-left"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 m-0">{type.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {stats ? (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isCritical ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              Độ chính xác: {Math.round(stats.accuracy)}% 
                              {isCritical ? ' (Cần cải thiện gấp)' : ' (Ổn định)'}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium">Chưa có dữ liệu thống kê kiểm tra</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => startFocusedPractice(type.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm border-0 transition-all flex items-center gap-1 cursor-pointer outline-none whitespace-nowrap self-stretch sm:self-auto text-center justify-center"
                      >
                        Bắt đầu
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE PRACTICE MINI EXAM SHEET */}
      {isActive && miniTest && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm flex-wrap gap-4">
            <div>
              <span className="text-[9px] bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Khối Đề Ôn Luyện Thích Ứng (Không Giới Hạn Thời Gian)
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-1.5 mb-0">{miniTest.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 text-slate-100 px-3 py-2 rounded-lg font-mono text-sm font-black border border-slate-800" title="Thời gian tự luyện tập thoải mái">
                ⏱️ {Math.floor(remainingSeconds / 60)}:
                {(remainingSeconds % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => submitFocusedExam(userAnswers)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow transition-all border-0 outline-none cursor-pointer"
              >
                Nộp Bài & Kết Thúc ✓
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Passage Content & Selection Event Listener */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="border-b pb-2 mb-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 m-0">Reading Material / Passage</h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded border">
                    💡 Bôi đen văn bản để lưu từ mới
                  </span>
                </div>

                {/* Passage Navigation Tabs if multiple passages exist */}
                {miniTest.sections[0].questionGroups.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pt-2 pb-1 border-t mt-1">
                    {miniTest.sections[0].questionGroups.map((_, gIdx) => (
                      <button
                        key={gIdx}
                        onClick={() => setActiveGroupIdx(gIdx)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-black cursor-pointer border transition-all whitespace-nowrap outline-none ${
                          activeGroupIdx === gIdx
                            ? 'bg-accentdeep-600 text-white border-accentdeep-500 shadow-sm'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        Đoạn văn {gIdx + 1} ({_.questions.length} câu)
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div 
                className="overflow-y-auto max-h-[60vh] pr-1"
                onMouseUp={handleTextSelection}
              >
                {miniTest.sections[0].questionGroups[activeGroupIdx]?.questions[0]?.passageHtml ? (
                  <div
                    className="prose prose-sm font-serif leading-relaxed text-slate-700 select-text"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(miniTest.sections[0].questionGroups[activeGroupIdx].questions[0].passageHtml),
                    }}
                  />
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Hãy phân tích kỹ các câu hỏi bên cạnh và trả lời đáp án chuẩn xác nhất.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Sidebar / Paragraph Options (Gapped Text) or default Questions List */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
              {isGappedText ? (
                /* Premium Gapped Text scrollable options board */
                <div className="flex flex-col gap-4 animate-fade-in pr-1">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 m-0">
                      Paragraph Options (Đoạn văn A–H bị thiếu)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                      C2 Part 6
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {paragraphs.map((p: any) => (
                      <div 
                        key={p.label} 
                        className="bg-slate-50/50 hover:bg-accentdeep-50/10 border border-slate-200 hover:border-accentdeep-300 rounded-xl p-4 flex gap-4 text-left transition-all duration-300 shadow-sm"
                      >
                        <div className="w-7 h-7 bg-accentdeep-600 border border-accentdeep-500 text-white rounded-full flex items-center justify-center font-black font-mono text-xs shrink-0 shadow-sm">
                          {p.label}
                        </div>
                        <div className="text-slate-700 leading-relaxed font-serif text-[11.5px] flex-1">
                          {p.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Sequential focused practice room - Renders exactly active question */
                <>
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 m-0">
                      Answer Sheet (Phiếu trả lời tự luyện)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                      Luyện tập Chuyên Đề
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-6 pr-1">
                    {renderQuestionCard(activeQuestion, currentPracticeQuestionIdx)}
                  </div>
                </>
              )}
            </div>

            {/* Bottom Row Answersheet - Spans full width below split boards (only when isGappedText is true) */}
            {isGappedText && (
              <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 mt-2">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 m-0">
                    Answer Sheet (Phiếu trả lời - Đoạn văn {activeGroupIdx + 1} / {miniTest.sections[0].questionGroups.length})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                    Bấm chọn chữ cái A-H tương ứng điền vào ô trống
                  </span>
                </div>
                
                <div className="flex flex-col gap-6 pr-1">
                  {renderQuestionCard(activeQuestion, currentPracticeQuestionIdx)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MINI EXAM SUBMISSION RESULT PANEL */}
      {activeRoomTab === 'practice' && isSubmitted && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 max-w-2xl mx-auto w-full flex flex-col gap-5 text-center">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 m-0">Nộp Bài Thành Công!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Bạn đã hoàn thành bài tập thích ứng khắc phục lỗ hổng kiến thức ngắn hạn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl my-2 max-w-sm mx-auto w-full">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Số câu đúng</span>
              <span className="text-2xl font-black text-emerald-600 mt-0.5">{score.correct} / {score.total}</span>
            </div>
            <div className="flex flex-col border-l border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Độ chính xác</span>
              <span className="text-2xl font-black text-emerald-600 mt-0.5">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-100 rounded-xl p-4 leading-relaxed max-w-md mx-auto">
            {score.total - score.correct > 0 ? (
              <span>
                <strong>Sổ tay lỗi sai SRS cập nhật:</strong> Có{' '}
                <strong className="text-rose-600 font-black">{score.total - score.correct} lỗi sai</strong> đã được tự động nạp vào Sổ tay để lên lịch nhắc nhở làm lại định kỳ!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold block">
                🎉 Tuyệt vời! Bạn đã làm đúng tuyệt đối toàn bộ câu hỏi. AI xác nhận điểm yếu này của bạn đã được cải thiện xuất sắc!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
            <button
              onClick={() => { setIsSubmitted(false); setSelectedTopic(''); }}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 px-6 rounded-lg shadow-sm transition-all uppercase tracking-wider cursor-pointer border-0 outline-none"
            >
              Quay lại danh mục
            </button>
            {lastPracticeTypeId && (
              <button
                onClick={() => startFocusedPractice(lastPracticeTypeId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-lg shadow-md transition-all uppercase tracking-wider cursor-pointer border-0 outline-none flex items-center gap-1.5"
              >
                ⚡ Luyện tập câu tiếp theo
              </button>
            )}
          </div>
        </div>
      )}

      {/* VOCABULARY DICTIONARY TAB */}
      {activeRoomTab === 'vocab' && (
        <div className="flex flex-col gap-6">
          {/* Subsection review modes */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setReviewMode('list')}
              className={`py-2 px-4 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                reviewMode === 'list' 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              📓 Danh Sách Từ Vựng ({vocabList.length})
            </button>
            <button
              onClick={() => {
                const unmastered = vocabList.filter(v => !v.isMastered);
                if (unmastered.length === 0) {
                  alert('Không có từ vựng nào chưa thuộc trong từ điển!');
                  return;
                }
                setFlashcardIdx(0);
                setIsFlipped(false);
                setReviewMode('flashcard');
              }}
              className={`py-2 px-4 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                reviewMode === 'flashcard' 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🎴 Thẻ Flashcard ({vocabList.filter(v => !v.isMastered).length} từ)
            </button>
            <button
              onClick={startQuiz}
              className={`py-2 px-4 rounded-lg font-bold text-xs cursor-pointer border transition-all ${
                reviewMode === 'quiz' 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⚡ Trắc Nghiệm Quiz
            </button>
          </div>

          {/* MODE A: WORD LIST VIEW */}
          {reviewMode === 'list' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-black text-slate-800 m-0 border-b pb-3">Sổ Tay Từ Vựng Cá Nhân Hóa C2</h3>
              
              {vocabList.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl">📓</span>
                  <p className="text-sm font-bold text-slate-800 mt-2">Sổ từ vựng của bạn chưa có từ nào!</p>
                  <p className="text-xs text-slate-400 max-w-sm text-center">
                    Trong quá trình đọc hiểu tại Phòng Luyện Tập Thích Ứng, bạn hãy bôi đen bất kỳ từ hoặc cụm từ nào để lưu và học lại bằng Flashcard/Quiz tại đây nhé!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {vocabList.map(vocab => (
                    <div 
                      key={vocab.id}
                      className="border border-slate-100 bg-slate-50/40 hover:bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex-1 flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black text-emerald-700">{vocab.word}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            vocab.isMastered 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {vocab.isMastered ? '✓ Đã thuộc' : '⚡ Đang học'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 mt-1">{vocab.meaning}</span>
                        {vocab.example && (
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                            <strong>Context:</strong> "{vocab.example}"
                          </p>
                        )}
                        {vocab.notes && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">💡 {vocab.notes}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVocabMastery(vocab.id)}
                          className={`font-bold text-[10px] py-1.5 px-3 rounded-lg border cursor-pointer outline-none transition-all ${
                            vocab.isMastered
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {vocab.isMastered ? '✓ Đã thuộc' : 'Đánh dấu thuộc'}
                        </button>
                        <button
                          onClick={() => deleteVocabWord(vocab.id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 font-bold text-[10px] py-1.5 px-2.5 rounded-lg cursor-pointer outline-none transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE B: 3D FLASHCARD VIEW */}
          {reviewMode === 'flashcard' && (
            <div className="max-w-md w-full mx-auto flex flex-col gap-5 items-center">
              {(() => {
                const unmastered = vocabList.filter(v => !v.isMastered);
                if (unmastered.length === 0) return null;
                const current = unmastered[flashcardIdx];
                if (!current) return null;

                return (
                  <>
                    <span className="text-xs font-bold text-slate-400">
                      Từ vựng {flashcardIdx + 1} / {unmastered.length} (Chưa thuộc)
                    </span>

                    {/* Flipping 3D Flashcard Container */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full h-64 flashcard-container cursor-pointer select-none"
                    >
                      <div className={`w-full h-full relative rounded-2xl shadow-xl border border-slate-250 flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                        {/* Front (English Word) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-2xl flex flex-col items-center justify-center p-6 text-center flashcard-front">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-65">Tiếng Anh</span>
                          <h2 className="text-2xl font-black font-mono tracking-tight mt-3">{current.word}</h2>
                          <span className="text-[10px] mt-8 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 text-emerald-300 animate-pulse">
                            🖱️ Nhấp chuột để lật mặt sau
                          </span>
                        </div>

                        {/* Back (Vietnamese Meaning) */}
                        <div className="absolute inset-0 bg-white text-slate-800 rounded-2xl flex flex-col items-center justify-between p-6 text-center flashcard-back">
                          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Định nghĩa tiếng Việt</span>
                          <div className="flex-1 flex flex-col justify-center gap-3">
                            <h3 className="text-xl font-bold text-slate-800 m-0 leading-tight">{current.meaning}</h3>
                            {current.example && (
                              <p className="text-[11px] text-slate-500 italic max-w-sm mt-1 px-3 border-l-2 text-left">
                                "{current.example}"
                              </p>
                            )}
                            {current.notes && (
                              <span className="text-[10px] text-slate-400 font-semibold mt-1">💡 {current.notes}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">🖱️ Nhấp để lật lại mặt trước</span>
                        </div>
                      </div>
                    </div>

                    {/* Playback action buttons */}
                    <div className="flex items-center justify-between gap-4 w-full mt-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setFlashcardIdx(prev => prev > 0 ? prev - 1 : unmastered.length - 1);
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer border-0 outline-none transition-all flex-1"
                      >
                        {"← Từ trước"}
                      </button>
                      
                      <button
                        onClick={() => {
                          toggleVocabMastery(current.id);
                          const nextUnmastered = unmastered.filter(v => v.id !== current.id);
                          if (nextUnmastered.length === 0) {
                            setReviewMode('list');
                            alert('Chúc mừng! Bạn đã học thuộc toàn bộ sổ từ vựng!');
                          } else {
                            setIsFlipped(false);
                            setFlashcardIdx(prev => prev >= nextUnmastered.length ? 0 : prev);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer border-0 outline-none transition-all flex-1"
                      >
                        ✓ Đã thuộc từ này
                      </button>

                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setFlashcardIdx(prev => prev < unmastered.length - 1 ? prev + 1 : 0);
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer border-0 outline-none transition-all flex-1"
                      >
                        {"Từ tiếp theo →"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* MODE C: TRẮC NGHIỆM QUIZ */}
          {reviewMode === 'quiz' && quizWord && (
            <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5 text-left text-slate-800">
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Trắc Nghiệm Ghi Nhớ Từ Vựng C2
                </span>
                <h3 className="text-base font-bold text-slate-500 mt-2 m-0 leading-relaxed">
                  Từ hoặc cụm từ: <span className="font-mono font-black text-emerald-700 text-lg">{quizWord.word}</span> có nghĩa là gì?
                </h3>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                {quizOptions.map((opt, i) => {
                  const isCorrect = opt === quizWord.meaning;
                  const isSelected = selectedQuizOpt === opt;
                  
                  let optionClass = 'border-slate-200 bg-white hover:bg-slate-55';
                  if (isQuizAnswered) {
                    if (isCorrect) {
                      optionClass = 'bg-green-50 border-green-300 text-green-800 font-bold';
                    } else if (isSelected) {
                      optionClass = 'bg-red-50 border-red-300 text-red-800 font-bold';
                    } else {
                      optionClass = 'border-slate-100 opacity-60 bg-white';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isQuizAnswered}
                      onClick={() => {
                        setSelectedQuizOpt(opt);
                        setIsQuizAnswered(true);
                      }}
                      className={`w-full p-3 rounded-lg border text-xs text-left transition-all cursor-pointer outline-none ${optionClass}`}
                    >
                      {i + 1}. {opt}
                      {isQuizAnswered && isCorrect && <span className="float-right text-green-600 font-black">✓ Đúng</span>}
                      {isQuizAnswered && isSelected && !isCorrect && <span className="float-right text-red-600 font-black">✗ Sai</span>}
                    </button>
                  );
                })}
              </div>

              {isQuizAnswered && (
                <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 pt-4">
                  <div className="bg-slate-50 border p-3 rounded-lg text-xs leading-relaxed text-slate-600">
                    <strong className="text-slate-800 font-bold block mb-0.5">Giải thích từ điển:</strong>
                    Nghĩa chính: <span className="font-semibold text-slate-800">{quizWord.meaning}</span>
                    {quizWord.notes && <span className="block mt-1">💡 Ghi chú ngữ pháp: {quizWord.notes}</span>}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        toggleVocabMastery(quizWord.id);
                        alert(`Đã chuyển từ "${quizWord.word}" sang trạng thái "Đã Thuộc" và bỏ qua trong các Quiz tiếp theo!`);
                        startQuiz();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer outline-none border-0 transition-all"
                    >
                      ✓ Đã biết từ này
                    </button>

                    <button
                      onClick={startQuiz}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer outline-none border-0 transition-all flex items-center gap-1.5"
                    >
                      {"Từ tiếp theo →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
