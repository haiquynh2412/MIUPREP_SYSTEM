import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * Per-track configuration for the shared exam-desktop components.
 * Visual theming is NOT configured here — shared components use semantic
 * Tailwind colors (accent / accentdeep / accentalt) that each app maps to its
 * own palette in tailwind.config.js (ielts: blue/indigo/amber, cpe: emerald/emerald/teal).
 */
export interface ExamTrackConfig {
  /** Track identifier, e.g. 'ielts' | 'cpe' */
  trackId: string;
  /** Human label used in copy, e.g. 'IELTS' | 'CPE' */
  label: string;
  /** Source tag stamped on learning events, e.g. 'miuprep_ielts_desktop' */
  learningEventSource: string;
  /** localStorage prefix for crash-recovery exam snapshots */
  emergencyStoragePrefix: string;
}

const TrackConfigContext = createContext<ExamTrackConfig | null>(null);

export function TrackConfigProvider({ config, children }: { config: ExamTrackConfig; children: ReactNode }) {
  return <TrackConfigContext.Provider value={config}>{children}</TrackConfigContext.Provider>;
}

export function useTrackConfig(): ExamTrackConfig {
  const config = useContext(TrackConfigContext);
  if (!config) {
    throw new Error('useTrackConfig must be used inside a <TrackConfigProvider>.');
  }
  return config;
}
