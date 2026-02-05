/**
 * Strapi blocks: array of { type, children?: [{ type: 'text', text: string }] }.
 * Extract plain text for display/editing, or build a single paragraph block from text.
 */

export type Block = { type: string; children?: Array<{ type: string; text?: string }>; [k: string]: unknown };

function getTextFromBlock(block: Block): string {
  if (!block.children || !Array.isArray(block.children)) return '';
  return block.children.map((c) => (c && typeof c.text === 'string' ? c.text : '')).join('');
}

/** Convert fullArticle (blocks JSON) to a single plain-text string for display or form. */
export function fullArticleToText(fullArticle: unknown): string {
  if (fullArticle == null) return '';
  if (typeof fullArticle === 'string') {
    try {
      const parsed = JSON.parse(fullArticle) as unknown;
      return fullArticleToText(parsed);
    } catch {
      return fullArticle;
    }
  }
  if (!Array.isArray(fullArticle)) return '';
  return (fullArticle as Block[]).map(getTextFromBlock).filter(Boolean).join('\n\n');
}

/** Convert plain text to Strapi blocks format (single paragraph block). */
export function textToFullArticle(text: string): unknown {
  if (!text.trim()) return [];
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: text.trim() }],
    },
  ];
}
