import type { ReactNode } from 'react';

const FORMULA_TOKEN_PATTERN = /\{\{formula:([^}|]+)(?:\|w=(\d+))?(?:\|h=(\d+))?\}\}/g;

interface PromptWithAssetsProps {
  text: string;
  className?: string;
}

export default function PromptWithAssets({ text, className }: PromptWithAssetsProps): JSX.Element {
  const promptText = String(text || '');
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of promptText.matchAll(FORMULA_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(<span key={`text-${cursor}`}>{promptText.slice(cursor, index)}</span>);
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
    nodes.push(<span key={`text-${cursor}`}>{promptText.slice(cursor)}</span>);
  }

  return <div className={className}>{nodes.length ? nodes : promptText}</div>;
}
