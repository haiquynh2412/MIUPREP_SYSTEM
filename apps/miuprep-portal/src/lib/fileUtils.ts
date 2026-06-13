// Small filesystem-name helper shared across portal modules.
// Extracted from App.tsx (roadmap 2.2.3 GĐ2b — slim App.tsx).

/** Turn an arbitrary string into a safe slug for filenames/ids. */
export function safeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'content';
}
