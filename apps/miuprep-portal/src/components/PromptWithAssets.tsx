import type { JSX } from 'react';
import type { ReactNode } from 'react';
import { renderMathCore } from '@miuprep/ui';

const FORMULA_TOKEN_PATTERN = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;

interface PromptWithAssetsProps {
  text: string;
  className?: string;
}

// Render a plain text segment. If it contains $...$ / $$...$$ math delimiters,
// render those via KaTeX (so content can replace a formula <img> with inline
// LaTeX that draws natively — no image needed). Text WITHOUT $ stays a normal
// React text node so it is HTML-escaped (keeps inequalities like "x < 5" safe).
function TextSegment({ text }: { text: string }): JSX.Element {
  if (!text.includes('$')) {
    return <span>{text}</span>;
  }
  return <span dangerouslySetInnerHTML={{ __html: renderMathCore(text) }} />;
}

export default function PromptWithAssets({ text, className }: PromptWithAssetsProps): JSX.Element {
  const promptText = String(text || '');
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of promptText.matchAll(FORMULA_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(<TextSegment key={`text-${cursor}`} text={promptText.slice(cursor, index)} />);
    }

    const src = match[1] || '';
    const width = match[2] ? Number(match[2]) : undefined;
    const height = match[3] ? Number(match[3]) : undefined;
    if (src.startsWith('/assets/')) {
      nodes.push(
        <img
          key={`formula-${index}`}
          src={src}
          alt="math formula"
          loading="lazy"
          className="mx-1 inline-block max-w-full rounded-sm bg-white align-middle"
          style={{
            width: width ? `${Math.min(width, 360)}px` : undefined,
            height: height ? `${Math.min(height, 180)}px` : undefined,
            objectFit: 'contain',
          }}
        />,
      );
    }
    cursor = index + match[0].length;
  }

  if (cursor < promptText.length) {
    nodes.push(<TextSegment key={`text-${cursor}`} text={promptText.slice(cursor)} />);
  }

  return <div className={className}>{nodes.length ? nodes : <TextSegment text={promptText} />}</div>;
}
