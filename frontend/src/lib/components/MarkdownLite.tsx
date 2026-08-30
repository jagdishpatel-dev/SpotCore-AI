
import type { ReactNode } from 'react';

/**
 * Minimal, dependency-free renderer for the LLM-generated prose GeoScore
 * shows verbatim (zoning Q&A answers, etc.) — handles the subset of markdown
 * these responses actually use: paragraphs, **bold**, *italic*, and
 * "- "/"1. " list blocks. Deliberately NOT a general markdown parser and
 * NEVER uses dangerouslySetInnerHTML: this text is derived from free-text
 * user questions passed through an LLM, so it's rendered as React text nodes
 * (safe/escaped by default) rather than as an HTML string.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** first, then *italic* within the non-bold segments.
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach((part, i) => {
    const boldMatch = /^\*\*([^*]+)\*\*$/.exec(part);
    if (boldMatch) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold">
          {boldMatch[1]}
        </strong>,
      );
      return;
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    italicParts.forEach((sub, j) => {
      const italicMatch = /^\*([^*]+)\*$/.exec(sub);
      if (italicMatch) {
        nodes.push(
          <em key={`${keyPrefix}-i${i}-${j}`} className="italic">
            {italicMatch[1]}
          </em>,
        );
      } else if (sub) {
        nodes.push(sub);
      }
    });
  });
  return nodes;
}

function isListBlock(lines: string[]): 'ul' | 'ol' | null {
  const nonEmpty = lines.filter((l) => l.trim());
  if (!nonEmpty.length) return null;
  if (nonEmpty.every((l) => /^\s*[-*]\s+/.test(l))) return 'ul';
  if (nonEmpty.every((l) => /^\s*\d+[.)]\s+/.test(l))) return 'ol';
  return null;
}

export default function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className={className}>
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n');
        const listType = isListBlock(lines);

        if (listType) {
          const items = lines.filter((l) => l.trim()).map((l) => l.replace(/^\s*(?:[-*]|\d+[.)])\s+/, ''));
          const ListTag = listType;
          return (
            <ListTag
              key={blockIdx}
              className={listType === 'ul' ? 'ml-5 list-disc space-y-1' : 'ml-5 list-decimal space-y-1'}
            >
              {items.map((item, i) => (
                <li key={i}>{renderInline(item, `${blockIdx}-${i}`)}</li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={blockIdx} className={blockIdx > 0 ? 'mt-3' : undefined}>
            {renderInline(block.replace(/\n/g, ' '), String(blockIdx))}
          </p>
        );
      })}
    </div>
  );
}
