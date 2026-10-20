/**
 * Pangu format: automatically inserts space between CJK (Chinese, Japanese, Korean)
 * and half-width English words, numbers, and symbols, while normalizing quotes.
 */
export function formatPangu(text: string): string {
  if (!text) return '';

  let result = text;

  // 1. CJK and Latin / Number spacing
  // Chinese followed by English/Number
  result = result.replace(/([\u4e00-\u9fa5\u3040-\u30ff])([a-zA-Z0-9$@%#])/g, '$1 $2');
  // English/Number followed by Chinese
  result = result.replace(/([a-zA-Z0-9$@%#])([\u4e00-\u9fa5\u3040-\u30ff])/g, '$1 $2');

  // 2. Fix consecutive spaces (keep max 1 within text, but preserve leading indent spaces)
  result = result
    .split('\n')
    .map(line => {
      // Don't format code block lines or links
      if (line.startsWith('    ') || line.startsWith('```') || line.startsWith('~~~')) {
        return line;
      }
      return line.replace(/([^\s]) {2,}([^\s])/g, '$1 $2');
    })
    .join('\n');

  return result;
}
