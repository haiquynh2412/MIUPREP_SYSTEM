# CAE Other Source Audit Summary

Generated: 2026-06-04

Source folder: `C:\Users\HAIQUYNH\OneDrive\SACH VIET\IELTS\CAE`

## Scope

- Checked CAE Plus 1, CAE 1, CAE 2, CAE 3, CAE 4, and CAE 5 against OCR/source pages.
- CAE 6 was handled separately in `reports/content-quality/cae6-focused-audit`.
- Focus: source mismatch, missing/truncated content, obvious OCR artefacts, wrong passage/question pairing.

## Verified Clean

- `cam-cae-plus1`: 50/50 sections source-crosschecked.
- `cam-cae1`: 36/36 sections source-crosschecked.
- `cam-cae5`: 40/40 sections source-crosschecked.
- General OCR punctuation cleanup was applied earlier to CAE 1-5 and Plus 1 files.

## Corrected In This Pass

### `packages/content/src/mocks/cam-cae2-test1.json`

- Fixed Reading Part 1 source mismatch.
  - Replaced the incorrect synthetic extracts about campsite/screenwriting/modern relationships.
  - Restored source-aligned extracts: `The Snow Geese`, `Tools`, `Book Crossing`.
  - Rebuilt questions 1-6 with source-aligned stems, options, answer locations, and explanations.

- Fixed Reading Part 2 source mismatch.
  - Replaced the incorrect fictional lute story.
  - Restored source-aligned `The Magic Lute` article about Arthur Robb.
  - Restored paragraph options A-G and rebuilt explanations for gaps 7-12.

### `packages/content/src/mocks/cam-cae2-test3.json`

- Fixed Reading Part 2 source mismatch.
  - Replaced the incorrect fuel-cell article.
  - Restored source-aligned `Plugging in the home` article and paragraph options.
  - Rebuilt explanations for gaps 7-12.

- Fixed Reading Part 3 source mismatch.
  - Replaced the incorrect Kenichi Horie solar boat article.
  - Restored source-aligned `Solar Survivor` article about Robert and Brenda Vale's autonomous house.
  - Rebuilt questions 13-19 with source-aligned options, answer locations, and explanations.

### `packages/content/src/mocks/cam-cae4-test4.json`

- Fixed Use of English Part 6 OCR/truncation artefacts.
  - Verified `THE CHINESE IN THE USA` directly from `Cambridge Certificate In Advanced English 4.pdf`, PDF page 106 / printed page 102.
  - Verified official answers `75 B, 76 I, 77 D, 78 E, 79 C, 80 H` from `cambridge-certificate-in-advanced-english-4-Teachers-book.pdf`, Test 4 Key, p.78.
  - Rebuilt the passage and A-J phrase list so options are separated cleanly and OCR noise such as `{n San Francisco` / `zonmnmmoodwn` is removed.
  - Rebuilt answer locations and explanations with method, trap, and language-rule cues.

### `packages/content/src/mocks/cam-cae3-test1.json`

- Verified Reading Test 1 Part 1-4 directly from `CAE3.pdf`.
  - Source pages: PDF pages 3-7 / printed pages 7-15.
  - Official answer key: `CAE3.pdf`, Test 1 Key, PDF page 72 / printed page 133.
- Corrected Reading Part 1 answer-option alignment.
  - Question 2 now uses official answer `B` and source-aligned option order.
  - Question 6 now uses official answer `D` and source-aligned option order.
- Rebuilt Reading Part 2 passage order against the PDF.
  - The previous content had the article paragraphs in the wrong sequence.
  - Restored the source order for `The Boat of My Dreams`.
  - Corrected official gap answers to `7 F, 8 A, 9 G, 10 B, 11 D, 12 C`.
  - Rebuilt explanations and answer locations with source notes and trap cues.

## Still Needs Source Confirmation

- None after the CAE3 PDF re-check in this pass.

## Verification

- `npm.cmd test -w @miuprep/content`: pass, run twice.
- `npm.cmd run audit:cae-deep -w @miuprep/content`: pass with 0 issues, final run clean twice after fixes.
- `npm.cmd run guard:english -w @miuprep/content`: pass, 0 blockers, adapter pass.
- `npm.cmd run sync:portal-quality -w @miuprep/content`: pass.
- `npm.cmd run build -w miuprep-portal`: pass.
