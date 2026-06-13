import { useState, useEffect } from 'react';
import type { LearnerProfile, ExamAttempt, StorageAdapter } from '@miuprep/db';
import type { IeltsTest } from '@miuprep/content';
import { isCorrectAnswer, QUESTION_TYPE_TO_MICRO_SKILLS_MAP } from '@miuprep/core';

interface UseLearnerProfileProps {
  db: StorageAdapter;
  attempts: ExamAttempt[];
  availableTests: IeltsTest[];
  userId: string;
}

export default function useLearnerProfile({ db, attempts, availableTests, userId }: UseLearnerProfileProps) {
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [targetBandInput, setTargetBandInput] = useState(7.0);
  const [examDateInput, setExamDateInput] = useState('');

  // Initial load
  useEffect(() => {
    if (!db) return;
    db.getLearnerProfile(userId)
      .then((profile) => {
        if (profile) {
          setLearnerProfile(profile);
          setTargetBandInput(profile.targetBand);
          setExamDateInput(profile.examDate);
        } else {
          const defaultProfile: LearnerProfile = {
            userId,
            targetBand: 7.0,
            examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
            weakSkills: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          db.saveLearnerProfile(defaultProfile).then(() => {
            setLearnerProfile(defaultProfile);
            setTargetBandInput(7.0);
            setExamDateInput(defaultProfile.examDate);
          });
        }
      })
      .catch((e) => {
        console.error('Failed to load learner profile in hook:', e);
      });
  }, [db, userId]);

  const saveLearnerProfile = async () => {
    if (!db) return;
    const updated: LearnerProfile = {
      userId,
      targetBand: targetBandInput,
      examDate: examDateInput,
      weakSkills: learnerProfile?.weakSkills || [],
      createdAt: learnerProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await db.saveLearnerProfile(updated);
      setLearnerProfile(updated);
      setIsEditingProfile(false);
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  const getDaysRemaining = () => {
    if (!learnerProfile?.examDate) return null;
    const diff = new Date(learnerProfile.examDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  const getGlobalWeaknessAnalysis = () => {
    const completedAttempts = attempts.filter((a) => a.status === 'submitted');
    if (completedAttempts.length === 0) return [];

    const typeStats: Record<string, { correct: number; total: number }> = {};

    completedAttempts.forEach((att) => {
      const test = availableTests.find((t) => t.id === att.testId);
      if (!test) return;

      test.sections.forEach((sec) => {
        sec.questionGroups.forEach((grp) => {
          grp.questions.forEach((q) => {
            const userVal = att.answers[q.id]?.rawValue || '';
            const isCorrect = isCorrectAnswer(String(userVal), q.acceptedAnswers);
            if (!typeStats[q.type]) {
              typeStats[q.type] = { correct: 0, total: 0 };
            }
            typeStats[q.type].total++;
            if (isCorrect) {
              typeStats[q.type].correct++;
            }
          });
        });
      });
    });

    return Object.entries(typeStats).map(([qType, stats]) => {
      const accuracy = Math.round((stats.correct / stats.total) * 100);
      let status: 'proficient' | 'needs_improvement' | 'critical' = 'proficient';
      if (accuracy < 50) status = 'critical';
      else if (accuracy < 75) status = 'needs_improvement';

      return {
        questionType: qType,
        correct: stats.correct,
        total: stats.total,
        accuracy,
        status,
      };
    });
  };

  const getMicroSkillsAnalysis = () => {
    const completedAttempts = attempts.filter((a) => a.status === 'submitted');
    if (completedAttempts.length === 0) return [];

    const skillScores: Record<string, { totalWeight: number; weightedCorrect: number }> = {};

    completedAttempts.forEach((att) => {
      const test = availableTests.find((t) => t.id === att.testId);
      if (!test) return;

      test.sections.forEach((sec) => {
        sec.questionGroups.forEach((grp) => {
          grp.questions.forEach((q) => {
            const userVal = att.answers[q.id]?.rawValue || '';
            const isCorrect = isCorrectAnswer(String(userVal), q.acceptedAnswers);
            const qType = q.type || 'unknown';

            const mappedSkills = QUESTION_TYPE_TO_MICRO_SKILLS_MAP[qType] || [
              { skill: 'General Comprehension', weight: 1.0 },
            ];

            mappedSkills.forEach((mapping) => {
              if (!skillScores[mapping.skill]) {
                skillScores[mapping.skill] = { totalWeight: 0, weightedCorrect: 0 };
              }

              skillScores[mapping.skill].totalWeight += mapping.weight;
              if (isCorrect) {
                skillScores[mapping.skill].weightedCorrect += mapping.weight;
              }
            });
          });
        });
      });
    });

    return Object.entries(skillScores).map(([skillName, stats]) => {
      const score = stats.totalWeight > 0 ? Math.round((stats.weightedCorrect / stats.totalWeight) * 100) : 0;

      let description = 'Rèn luyện khả năng đọc quét dữ liệu nhanh.';
      if (skillName === 'Skimming & Gist Comprehension') {
        description = 'Khả năng đọc lướt nắm bắt ý chính toàn đoạn.';
      } else if (skillName === 'Paraphrase Recognition') {
        description = 'Khả năng nhận diện từ khóa đồng nghĩa bị biến đổi.';
      } else if (skillName === 'Grammatical Word-Class Prediction') {
        description = 'Khả năng phán đoán loại từ cần điền dựa trên ngữ cảnh.';
      } else if (skillName === 'Scanning & Detail Location') {
        description = 'Đọc quét nhanh định vị thông tin chi tiết.';
      } else if (skillName === 'Fact vs. Opinion Analysis') {
        description = 'Phân tích và đối chiếu sự thật so với ý kiến chủ quan.';
      }

      let status: 'proficient' | 'needs_improvement' | 'critical' = 'proficient';
      if (score < 50) status = 'critical';
      else if (score < 75) status = 'needs_improvement';

      return {
        skillName,
        description,
        score,
        status,
      };
    });
  };

  return {
    learnerProfile,
    isEditingProfile,
    targetBandInput,
    examDateInput,
    setLearnerProfile,
    setIsEditingProfile,
    setTargetBandInput,
    setExamDateInput,
    saveLearnerProfile,
    getDaysRemaining,
    getGlobalWeaknessAnalysis,
    getMicroSkillsAnalysis,
  };
}
