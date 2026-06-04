import { useState, useEffect } from 'react';
import { AIAdapterFactory } from '@miuprep/ai';
import type { AIConfig, CredentialStore } from '@miuprep/ai';
import type { WritingFeedback, StorageAdapter } from '@miuprep/db';

interface UseAiEvaluationProps {
  db: StorageAdapter;
  credentialStore: CredentialStore;
  generateLocalId: (prefix: string) => string;
}

export default function useAiEvaluation({ db, credentialStore, generateLocalId }: UseAiEvaluationProps) {
  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'mock' });
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load key existence on mount
  useEffect(() => {
    if (!credentialStore) return;
    credentialStore.get('openai_api_key').then((k) => setHasOpenAiKey(!!k));
    credentialStore.get('gemini_api_key').then((k) => setHasGeminiKey(!!k));
  }, [credentialStore]);

  const runWritingAiEvaluation = async (
    writingEssay: string,
    writingTaskNum: 1 | 2,
    track?: 'ielts' | 'cpe' | 'cae',
    promptInstruction?: string
  ) => {
    if (!writingEssay.trim() || !db) return;
    setIsAiLoading(true);
    setWritingFeedback(null);
    setAiErrorMsg(null);
    try {
      const activeAi = AIAdapterFactory.create(aiConfig, credentialStore);
      const feedback = await activeAi.gradeWriting({
        attemptId: generateLocalId('writing'),
        essay: writingEssay,
        taskNumber: writingTaskNum,
        track,
        promptInstruction
      });

      await db.saveWritingFeedback(feedback);
      setWritingFeedback(feedback);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setAiErrorMsg(errMsg);
      try {
        await db.logSystemEvent({
          id: generateLocalId('log'),
          level: 'ERROR',
          module: 'AI',
          message: `Writing AI evaluation failed: ${errMsg}`,
          payload: JSON.stringify({
            provider: aiConfig.provider,
            model: aiConfig.provider === 'openai' ? aiConfig.openaiModel : aiConfig.geminiModel,
            taskNumber: writingTaskNum,
            essayLength: writingEssay.length,
            track
          })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestConnectionResult(null);
    try {
      const activeAi = AIAdapterFactory.create(aiConfig, credentialStore);
      if (aiConfig.provider === 'mock') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTestConnectionResult({ success: true, message: 'Mock connection active and offline-ready!' });
      } else {
        const testFeedback = await activeAi.gradeWriting({
          attemptId: 'test-connection',
          essay: 'This is a test sentence to verify the API key connection.',
          taskNumber: 1,
          promptInstruction: 'Please respond immediately with the JSON output. This is only a connection test.'
        });
        if (testFeedback && testFeedback.bandOverall) {
          setTestConnectionResult({ 
            success: true, 
            message: `Successfully authenticated and evaluated with ${aiConfig.provider === 'openai' ? 'OpenAI' : 'Google Gemini'}!` 
          });
        } else {
          throw new Error('API completed but returned an empty or invalid response.');
        }
      }
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setTestConnectionResult({ success: false, message: errMsg });
      try {
        await db.logSystemEvent({
          id: generateLocalId('log'),
          level: 'WARN',
          module: 'AI',
          message: `AI test connection failed: ${errMsg}`,
          payload: JSON.stringify({
            provider: aiConfig.provider,
            model: aiConfig.provider === 'openai' ? aiConfig.openaiModel : aiConfig.geminiModel
          })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    aiConfig,
    openaiKeyInput,
    geminiKeyInput,
    hasOpenAiKey,
    hasGeminiKey,
    isAiLoading,
    writingFeedback,
    aiErrorMsg,
    isTestingConnection,
    testConnectionResult,
    setAiConfig,
    setOpenaiKeyInput,
    setGeminiKeyInput,
    setHasOpenAiKey,
    setHasGeminiKey,
    setWritingFeedback,
    setAiErrorMsg,
    runWritingAiEvaluation,
    handleTestConnection
  };
}
