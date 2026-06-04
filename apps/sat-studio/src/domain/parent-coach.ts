import { estimatedBand, masteryRows, type LearnerState, type MasteryRow } from "./student-learning";

export interface ParentCoachMetric {
  label: string;
  value: string;
  detail: string;
}

export interface ParentCoachModel {
  generatedAt: string;
  band: string;
  accuracy: number;
  attempts: number;
  correct: number;
  openMistakes: number;
  averageSeconds: number;
  packageCount: number;
  nextAction: {
    title: string;
    detail: string;
    tone: "baseline" | "repair" | "practice";
  };
  metrics: ParentCoachMetric[];
  weakRows: MasteryRow[];
  flags: string[];
}

function average(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export function buildParentCoachModel(state: LearnerState, options: { packageCount?: number; generatedAt?: string } = {}): ParentCoachModel {
  const attempts = state.attempts.length;
  const correct = state.attempts.filter((attempt) => attempt.correct).length;
  const openMistakes = state.attempts.filter((attempt) => !attempt.correct).length;
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  const averageSeconds = average(state.attempts.map((attempt) => attempt.elapsedMs / 1000));
  const weakRows = masteryRows(state).slice(0, 6);
  const band = estimatedBand(state);
  const slowCorrect = state.attempts.filter((attempt) => attempt.correct && attempt.elapsedMs > 90_000).length;
  const flags = [
    attempts < 8 ? "baseline_needed" : "",
    openMistakes > 0 ? "mistake_review_due" : "",
    slowCorrect > 0 ? "pacing_risk" : "",
    weakRows.some((row) => row.status === "Repair") ? "skill_repair_needed" : "",
  ].filter(Boolean);
  const nextAction =
    attempts < 8
      ? {
          title: "Cho con làm baseline chẩn đoán",
          detail: "Cần tối thiểu 8 lượt làm để tín hiệu phụ huynh đủ tin cậy. Bước đầu nên là diagnostic ngắn.",
          tone: "baseline" as const,
        }
      : openMistakes > 0
        ? {
            title: "Xử lý lỗi sai trước khi tăng volume",
            detail: `${openMistakes} câu sai đang mở cần được sửa bằng proof/review trước khi giao thêm bài mới.`,
            tone: "repair" as const,
          }
        : {
            title: "Giao một sprint có giới hạn thời gian",
            detail: "Không còn lỗi sai mở trong dữ liệu local. Bước tiếp theo là sprint Medium/Hard có timing.",
            tone: "practice" as const,
          };

  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    band,
    accuracy,
    attempts,
    correct,
    openMistakes,
    averageSeconds,
    packageCount: Number(options.packageCount || 0),
    nextAction,
    metrics: [
      { label: "Band ước tính", value: band, detail: attempts ? "Tính từ lượt làm local của học sinh." : "Cần diagnostic để hiệu chỉnh." },
      { label: "Độ chính xác", value: `${accuracy}%`, detail: `${correct}/${attempts} lượt làm đúng.` },
      { label: "Lỗi cần sửa", value: String(openMistakes), detail: "Các câu nên chuyển thành proof review." },
      { label: "Thời gian TB", value: averageSeconds ? `${averageSeconds}s` : "--", detail: "Thời gian trả lời trung bình trong dữ liệu local." },
      { label: "Kho public-safe", value: String(options.packageCount || 0), detail: "Số câu an toàn đang dùng trong route học sinh." },
    ],
    weakRows,
    flags,
  };
}
