import assert from "node:assert/strict";
import {
  announcementFeed,
  createAnnouncementPost,
  deleteAnnouncementPost,
  loadAnnouncementState,
  saveAnnouncementState,
  setAnnouncementStatus,
} from "./announcements";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

const storage = new MemoryStorage();
let state = loadAnnouncementState(storage);
assert.ok(announcementFeed(state, "student").length >= 1);

const created = createAnnouncementPost(state, {
  title: "Practice reminder",
  body: "Run one proof review before a new sprint.",
  audience: "students",
  status: "published",
  pinned: true,
});
assert.equal(created.ok, true);
state = saveAnnouncementState(created.state, storage);
assert.ok(announcementFeed(state, "student").some((post) => post.title === "Practice reminder"));
assert.equal(announcementFeed(state, "parent").some((post) => post.title === "Practice reminder"), false);

state = setAnnouncementStatus(state, created.post!.id, "draft");
assert.equal(announcementFeed(state, "student").some((post) => post.id === created.post!.id), false);

state = deleteAnnouncementPost(state, created.post!.id);
assert.equal(state.posts.some((post) => post.id === created.post!.id), false);

console.log("announcements.test: pass");
