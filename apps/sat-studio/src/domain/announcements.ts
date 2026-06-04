import { stableChecksum } from "./learning-events";

export const ANNOUNCEMENT_STORAGE_KEY = "sat-studio:vite-announcements";

export type AnnouncementAudience = "all" | "students" | "parents";
export type AnnouncementStatus = "draft" | "published";

export interface AnnouncementPost {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementState {
  schemaVersion: "sat_announcements_v1";
  posts: AnnouncementPost[];
}

export interface AnnouncementDraft {
  title?: string;
  body?: string;
  audience?: string;
  status?: string;
  pinned?: boolean;
}

export const DEFAULT_ANNOUNCEMENTS: AnnouncementPost[] = [
  {
    id: "announcement-vite-public-ready",
    title: "Public SAT Studio route is live",
    body: "Student, parent, and admin routes now default to the Vite/Svelte experience. Use the legacy links only for older internal dashboards.",
    audience: "all",
    status: "published",
    pinned: true,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
  },
];

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeAudience(value: unknown): AnnouncementAudience {
  const audience = text(value);
  return audience === "students" || audience === "parents" || audience === "all" ? audience : "all";
}

function normalizeStatus(value: unknown): AnnouncementStatus {
  return text(value) === "draft" ? "draft" : "published";
}

export function normalizeAnnouncementPost(value: unknown): AnnouncementPost | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const title = text(record.title);
  const body = text(record.body);
  if (!title || !body) return null;
  const createdAt = text(record.createdAt) || new Date().toISOString();
  const post: AnnouncementPost = {
    id: text(record.id) || `announcement-${stableChecksum([title, body, createdAt].join("|"))}`,
    title,
    body,
    audience: normalizeAudience(record.audience),
    status: normalizeStatus(record.status),
    pinned: Boolean(record.pinned),
    createdAt,
    updatedAt: text(record.updatedAt) || createdAt,
  };
  return post;
}

export function normalizeAnnouncementState(value: unknown): AnnouncementState {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const posts = (Array.isArray(record.posts) ? record.posts : [])
    .map(normalizeAnnouncementPost)
    .filter((post): post is AnnouncementPost => Boolean(post));
  const byId = new Map<string, AnnouncementPost>();
  [...DEFAULT_ANNOUNCEMENTS, ...posts].forEach((post) => byId.set(post.id, post));
  return {
    schemaVersion: "sat_announcements_v1",
    posts: [...byId.values()].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)),
  };
}

export function loadAnnouncementState(storage: Storage | null = globalThis.localStorage ?? null): AnnouncementState {
  if (!storage) return normalizeAnnouncementState({});
  try {
    return normalizeAnnouncementState(JSON.parse(storage.getItem(ANNOUNCEMENT_STORAGE_KEY) || "{}"));
  } catch {
    return normalizeAnnouncementState({});
  }
}

export function saveAnnouncementState(state: AnnouncementState, storage: Storage | null = globalThis.localStorage ?? null): AnnouncementState {
  const normalized = normalizeAnnouncementState(state);
  if (storage) storage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function createAnnouncementPost(state: AnnouncementState, draft: AnnouncementDraft): { ok: boolean; reason: string; state: AnnouncementState; post?: AnnouncementPost } {
  const title = text(draft.title);
  const body = text(draft.body);
  if (!title || !body) return { ok: false, reason: "Title and body are required.", state };
  const now = new Date().toISOString();
  const post: AnnouncementPost = {
    id: `announcement-${stableChecksum([title, body, now].join("|"))}`,
    title,
    body,
    audience: normalizeAudience(draft.audience),
    status: normalizeStatus(draft.status),
    pinned: Boolean(draft.pinned),
    createdAt: now,
    updatedAt: now,
  };
  return {
    ok: true,
    reason: "Announcement saved.",
    post,
    state: normalizeAnnouncementState({ posts: [post, ...state.posts] }),
  };
}

export function setAnnouncementStatus(state: AnnouncementState, postId: string, status: AnnouncementStatus): AnnouncementState {
  const now = new Date().toISOString();
  return normalizeAnnouncementState({
    posts: state.posts.map((post) => (post.id === postId ? { ...post, status, updatedAt: now } : post)),
  });
}

export function deleteAnnouncementPost(state: AnnouncementState, postId: string): AnnouncementState {
  return normalizeAnnouncementState({ posts: state.posts.filter((post) => post.id !== postId && post.id !== "announcement-vite-public-ready") });
}

export function announcementFeed(state: AnnouncementState, audience: "student" | "parent" | "admin" = "student"): AnnouncementPost[] {
  const allowed = audience === "parent" ? new Set(["all", "parents"]) : audience === "student" ? new Set(["all", "students"]) : new Set(["all", "students", "parents"]);
  return state.posts.filter((post) => post.status === "published" && allowed.has(post.audience)).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}
