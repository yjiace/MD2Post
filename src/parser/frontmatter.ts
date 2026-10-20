/**
 * Frontmatter, HTML Comments, and MindMapFloat Preprocessor
 */

export interface PreprocessResult {
  cleanMarkdown: string;
  hasFrontmatter: boolean;
  frontmatterRaw?: string;
  mindMapRaw?: string;
  mindMapTitle?: string;
}

export function preprocessMarkdown(rawMarkdown: string): PreprocessResult {
  if (!rawMarkdown) {
    return { cleanMarkdown: '', hasFrontmatter: false };
  }

  // Auto-sanitize control character escapes (\x0c formfeed -> \f, \x08 backspace -> \b)
  let text = rawMarkdown.replace(/\x0c/g, '\\f').replace(/\x08/g, '\\b');
  let hasFrontmatter = false;
  let frontmatterRaw: string | undefined;
  let mindMapRaw: string | undefined;
  let mindMapTitle: string | undefined;

  // 1. Cleanly strip Frontmatter at the beginning of document (C-01, US-E8)
  // Preserve line numbers by replacing with equivalent empty lines
  const frontmatterRegex = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/;
  const fmMatch = text.match(frontmatterRegex);
  if (fmMatch) {
    hasFrontmatter = true;
    frontmatterRaw = fmMatch[1];
    const strippedLines = fmMatch[0].split('\n').length - 1;
    text = '\n'.repeat(strippedLines) + text.slice(fmMatch[0].length);
  }

  // 2. Ignore / Strip all MindMapFloat components (preserve line count for scroll sync)
  const mindMapRegex = /<MindMapFloat(?:\s+[^>]*)?>([\s\S]*?)<\/MindMapFloat>|<MindMapFloat(?:\s+[^>]*)?\/>/gi;
  text = text.replace(mindMapRegex, match => '\n'.repeat(match.split('\n').length - 1));

  // 3. Strip HTML comments <!-- ... --> (preserve line count)
  text = text.replace(/<!--[\s\S]*?-->/g, match => '\n'.repeat(match.split('\n').length - 1));

  // 4. Normalize protocol-relative image URLs: //cdn.example.com/... -> https://cdn.example.com/... (C-12, F7-1, US-D1)
  // Markdown image syntax: ![alt](//cdn.xxx)
  text = text.replace(/!\[(.*?)\]\(\s*\/\/([^\s\)]+)\s*\)/g, '![$1](https://$2)');
  // HTML img syntax: <img src="//cdn.xxx" ...>
  text = text.replace(/(<img\s+[^>]*src=["'])\/\/([^\s"']+)(["'][^>]*>)/gi, '$1https://$2$3');

  return {
    cleanMarkdown: text,
    hasFrontmatter,
    frontmatterRaw,
    mindMapRaw,
    mindMapTitle
  };
}

/**
 * Parses indented outline text or markdown list into MindMapNode tree
 */
export function parseMindMapData(rawContent: string): import('../types').MindMapNode[] {
  if (!rawContent || !rawContent.trim()) return [];

  const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rootNodes: import('../types').MindMapNode[] = [];
  const nodeStack: { node: import('../types').MindMapNode; indent: number }[] = [];

  let idCounter = 1;

  for (const line of lines) {
    // Measure indentation (tabs or spaces)
    const match = line.match(/^([ \t]*)(?:[-*+]\s+|\d+\.\s+)?(.*)$/);
    if (!match) continue;

    const indentStr = match[1];
    const text = match[2].trim();
    if (!text) continue;

    const indent = indentStr.replace(/\t/g, '  ').length;
    const level = Math.floor(indent / 2) + 1;

    const newNode: import('../types').MindMapNode = {
      id: `mm-node-${idCounter++}`,
      text,
      level,
      children: []
    };

    while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].indent >= indent) {
      nodeStack.pop();
    }

    if (nodeStack.length === 0) {
      rootNodes.push(newNode);
    } else {
      nodeStack[nodeStack.length - 1].node.children.push(newNode);
    }

    nodeStack.push({ node: newNode, indent });
  }

  return rootNodes;
}
