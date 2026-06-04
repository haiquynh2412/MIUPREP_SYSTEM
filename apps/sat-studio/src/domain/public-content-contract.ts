export const PUBLIC_STUDENT_CONTRACT_VERSION = "sat_public_student_contract_v1";

export const PUBLIC_INTERNAL_FIELDS = [
  "sourceType",
  "sourceName",
  "sourceReference",
  "sourceUsagePolicy",
  "sourceRisk",
  "risk",
  "licenseNote",
  "reviewStatus",
  "publicationStatus",
  "visibility",
  "auditStatus",
  "contentAudit",
  "strict1600Review",
  "publicReviewNote",
  "promotedBy",
  "promotedAt",
  "neverPublic",
] as const;

export const PUBLIC_QUESTION_FIELDS = [
  "id",
  "section",
  "domain",
  "skill",
  "difficulty",
  "questionType",
  "type",
  "targetBand",
  "modulePlacement",
  "estimatedTimeSeconds",
  "practicePool",
  "tags",
  "calculator",
  "calculatorTag",
  "desmos",
  "desmosTag",
  "toolTag",
  "mathTool",
  "lessonKey",
  "vocab",
  "prompt",
  "choices",
  "correctAnswer",
  "acceptableAnswers",
  "answerFormat",
  "explanation",
] as const;

export const PUBLIC_STUDENT_MANIFEST_FIELDS = [
  "section",
  "domain",
  "skill",
  "difficulty",
  "practicePool",
  "questionType",
  "calculator",
  "desmos",
] as const;

export type PublicQuestionField = (typeof PUBLIC_QUESTION_FIELDS)[number];
export type PublicInternalField = (typeof PUBLIC_INTERNAL_FIELDS)[number];
export type PublicStudentManifestField = (typeof PUBLIC_STUDENT_MANIFEST_FIELDS)[number];

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type RawQuestionRecord = Record<string, unknown>;

export type PublicQuestionItem = Partial<Record<PublicQuestionField, JsonValue>> & {
  id: string;
  section: string;
  domain: string;
  skill: string;
  difficulty: string;
  questionType: string;
  prompt: string;
};

export interface PublicStudentPackage {
  schemaVersion: "sat_content_package_v1";
  contractVersion: typeof PUBLIC_STUDENT_CONTRACT_VERSION;
  contentVersion: string;
  generatedAt: string;
  manifest: {
    contractVersion: typeof PUBLIC_STUDENT_CONTRACT_VERSION;
    generatedAt: string;
    revision: number;
    scope: "public";
    contentVersion: string;
    total: number;
    counts: Partial<Record<PublicStudentManifestField, Record<string, number>>>;
    fields: PublicStudentManifestField[];
    defaults: {
      limit: number;
      maxLimit: number;
      sort: "stable_id";
    };
  };
  items: PublicQuestionItem[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

function jsonField(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined;
  return cloneJson(value) as JsonValue;
}

function stringField(record: RawQuestionRecord, key: string): string {
  return String(record[key] ?? "").trim();
}

export function sanitizePublicQuestion(record: RawQuestionRecord): PublicQuestionItem {
  const item: Record<string, JsonValue> = {};
  for (const key of PUBLIC_QUESTION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const value = jsonField(record[key]);
      if (value !== undefined) item[key] = value;
    }
  }

  item.id = stringField(record, "id");
  item.section = stringField(record, "section");
  item.domain = stringField(record, "domain");
  item.skill = stringField(record, "skill");
  item.difficulty = stringField(record, "difficulty");
  item.questionType = stringField(record, "questionType") || stringField(record, "type") || "multiple_choice";
  item.prompt = stringField(record, "prompt");

  return item as PublicQuestionItem;
}

function countBy(items: PublicQuestionItem[], key: PublicStudentManifestField): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = item[key];
    const normalized = typeof value === "string" && value.trim() ? value : "Unknown";
    counts[normalized] = (counts[normalized] || 0) + 1;
    return counts;
  }, {});
}

export function buildPublicStudentPackage(
  records: RawQuestionRecord[],
  options: { generatedAt?: string; contentVersion?: string; revision?: number } = {},
): PublicStudentPackage {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const items = records.map(sanitizePublicQuestion);
  const contentVersion = options.contentVersion || "";

  return {
    schemaVersion: "sat_content_package_v1",
    contractVersion: PUBLIC_STUDENT_CONTRACT_VERSION,
    contentVersion,
    generatedAt,
    manifest: {
      contractVersion: PUBLIC_STUDENT_CONTRACT_VERSION,
      generatedAt,
      revision: Number(options.revision || 0),
      scope: "public",
      contentVersion,
      total: items.length,
      counts: Object.fromEntries(PUBLIC_STUDENT_MANIFEST_FIELDS.map((field) => [field, countBy(items, field)])),
      fields: [...PUBLIC_STUDENT_MANIFEST_FIELDS],
      defaults: {
        limit: 50,
        maxLimit: 200,
        sort: "stable_id",
      },
    },
    items,
  };
}

export function findPublicInternalKeys(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findPublicInternalKeys(item, `${path}[${index}]`));
  }
  if (!isPlainObject(value)) return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const currentPath = `${path}.${key}`;
    const current = (PUBLIC_INTERNAL_FIELDS as readonly string[]).includes(key) ? [currentPath] : [];
    return [...current, ...findPublicInternalKeys(child, currentPath)];
  });
}

export function assertPublicPackageHasNoInternalKeys(value: unknown): void {
  const internalKeys = findPublicInternalKeys(value);
  if (internalKeys.length) {
    throw new Error(`Public package contains internal fields: ${internalKeys.slice(0, 8).join(", ")}`);
  }
}
