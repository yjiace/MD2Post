import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import katex from 'katex';
import type { CodeBlockSettings } from '../types';

export interface RenderOptions {
  codeSettings?: CodeBlockSettings;
  showImageCaptions?: boolean;
}

// Callout types metadata (GitHub Flavored Markdown Alerts)
export const CALLOUT_CONFIG: Record<
  string,
  { type: string; title: string; color: string; bgColor: string; borderColor: string }
> = {
  note: {
    type: 'note',
    title: 'NOTE',
    color: '#0969da',
    bgColor: '#f0f7ff',
    borderColor: '#0969da'
  },
  tip: {
    type: 'tip',
    title: 'TIP',
    color: '#1a7f37',
    bgColor: '#f0fbf0',
    borderColor: '#1a7f37'
  },
  important: {
    type: 'important',
    title: 'IMPORTANT',
    color: '#8250df',
    bgColor: '#fbf0ff',
    borderColor: '#8250df'
  },
  warning: {
    type: 'warning',
    title: 'WARNING',
    color: '#9a6700',
    bgColor: '#fff8ea',
    borderColor: '#9a6700'
  },
  caution: {
    type: 'caution',
    title: 'CAUTION',
    color: '#cf222e',
    bgColor: '#fff0f0',
    borderColor: '#cf222e'
  }
};

/**
 * Creates and configures a markdown-it instance with all plugins
 */
export function createMarkdownParser(options: RenderOptions = {}) {
  const { codeSettings, showImageCaptions = true } = options;

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  });

  // 0. Heading span plugin (matching mdnice / md.weiyan.cc theme architecture)
  md.core.ruler.push('heading_span', state => {
    for (let t = 0; t < state.tokens.length - 1; t++) {
      if (state.tokens[t].type === 'heading_open' && state.tokens[t + 1].type === 'inline') {
        const inlineToken = state.tokens[t + 1];
        if (inlineToken && inlineToken.content) {
          const prefixToken = new state.Token('html_inline', '', 0);
          prefixToken.content = '<span class="prefix"></span><span class="content">';
          inlineToken.children = inlineToken.children || [];
          inlineToken.children.unshift(prefixToken);

          const suffixToken = new state.Token('html_inline', '', 0);
          suffixToken.content = '</span><span class="suffix"></span>';
          inlineToken.children.push(suffixToken);
          t += 2;
        }
      }
    }
  });

  // 0.1 Callout pre-processor (properly cleans leading markers, newlines, and prevents empty paragraphs)
  md.core.ruler.push('callout_processor', state => {
    const tokens = state.tokens;
    for (let idx = 0; idx < tokens.length; idx++) {
      if (tokens[idx].type === 'blockquote_open') {
        for (let i = idx + 1; i < tokens.length; i++) {
          if (tokens[i].type === 'blockquote_close') break;
          if (tokens[i].type === 'paragraph_open') {
            const inlineToken = tokens[i + 1];
            if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
              const match = inlineToken.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
              if (match) {
                const calloutType = match[1].toLowerCase();
                (tokens[idx] as any).__calloutType = calloutType;

                // Remove the [!TYPE] marker and leading whitespace
                inlineToken.content = inlineToken.content
                  .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i, '')
                  .trimStart();

                if (inlineToken.children && inlineToken.children.length > 0) {
                  if (inlineToken.children[0].type === 'text') {
                    inlineToken.children[0].content = inlineToken.children[0].content
                      .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i, '')
                      .trimStart();
                    if (!inlineToken.children[0].content) {
                      inlineToken.children.shift();
                    }
                  }
                  // Remove any immediately following softbreak, hardbreak (<br>), or whitespace tokens
                  while (
                    inlineToken.children.length > 0 &&
                    (inlineToken.children[0].type === 'softbreak' ||
                      inlineToken.children[0].type === 'hardbreak' ||
                      (inlineToken.children[0].type === 'text' && !inlineToken.children[0].content.trim()))
                  ) {
                    inlineToken.children.shift();
                  }
                }

                // If the first paragraph only contained [!TYPE] marker, remove the whole empty paragraph
                if (!inlineToken.content.trim() && (!inlineToken.children || inlineToken.children.length === 0)) {
                  tokens.splice(i, 3);
                }
              }
            }
            break;
          }
        }
      }
    }
  });
  const blockRules = [
    'paragraph_open',
    'heading_open',
    'bullet_list_open',
    'ordered_list_open',
    'list_item_open',
    'blockquote_open',
    'hr'
  ];

  blockRules.forEach(rule => {
    const defaultRenderer = md.renderer.rules[rule] || function (tokens, idx, opts, _env, self) {
      return self.renderToken(tokens, idx, opts);
    };

    md.renderer.rules[rule] = (tokens, idx, opts, env, self) => {
      const token = tokens[idx];
      if (token.map && token.map.length >= 1) {
        token.attrSet('data-line', String(token.map[0] + 1));
      }
      return defaultRenderer(tokens, idx, opts, env, self);
    };
  });

  // Common language alias mapping
  const LANG_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    golang: 'go',
    'c++': 'cpp',
    'c#': 'csharp',
    cs: 'csharp',
    html: 'xml',
    vue: 'xml',
    svg: 'xml',
    docker: 'dockerfile',
    md: 'markdown',
    text: 'plaintext',
    txt: 'plaintext',
    plain: 'plaintext'
  };

  // Helper to split highlighted HTML into lines while keeping span tags balanced across lines
  const splitHighlightedLines = (html: string): string[] => {
    const rawLines = html.split(/\r?\n/);
    if (rawLines.length > 1 && rawLines[rawLines.length - 1] === '') {
      rawLines.pop();
    }

    const lines: string[] = [];
    const openTags: string[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i];
      const prefix = openTags.join('');

      // Find all tags in this line
      const tagRegex = /<(\/)?([a-zA-Z0-9]+)([^>]*)>/g;
      let match: RegExpExecArray | null;

      while ((match = tagRegex.exec(rawLine)) !== null) {
        const isClose = match[1] === '/';
        const fullTag = match[0];
        if (isClose) {
          openTags.pop();
        } else if (!fullTag.endsWith('/>')) {
          openTags.push(fullTag);
        }
      }

      // Suffix with closing tags for all currently open tags
      const suffix = openTags
        .slice()
        .reverse()
        .map(t => {
          const m = t.match(/<([a-zA-Z0-9]+)/);
          return m ? `</${m[1]}>` : '</span>';
        })
        .join('');

      lines.push(prefix + rawLine + suffix);
    }

    return lines;
  };

  // Shared code renderer for fenced blocks and indented code blocks
  const renderCodeBlock = (rawCode: string, rawLang: string, lineAttr: string) => {
    const lang = (rawLang || '').trim().toLowerCase();

    // Check for Mermaid diagram
    if (lang === 'mermaid') {
      const encodedCode = encodeURIComponent(rawCode);
      return `<div class="md2post-mermaid"${lineAttr} data-code="${encodedCode}"><pre class="mermaid">${escapeHtml(rawCode)}</pre></div>\n`;
    }

    // Resolve language alias
    const canonicalLang = LANG_ALIASES[lang] || lang;
    const validLang = canonicalLang && hljs.getLanguage(canonicalLang) ? canonicalLang : '';

    let highlighted = '';
    if (validLang) {
      try {
        highlighted = hljs.highlight(rawCode, { language: validLang, ignoreIllegals: true }).value;
      } catch {
        highlighted = escapeHtml(rawCode);
      }
    } else {
      try {
        const auto = hljs.highlightAuto(rawCode);
        if (auto && auto.value) {
          highlighted = auto.value;
        } else {
          highlighted = escapeHtml(rawCode);
        }
      } catch {
        highlighted = escapeHtml(rawCode);
      }
    }

    // Format line numbers if enabled
    const showLines = codeSettings?.showLineNumbers ?? true;
    let codeBody = '';
    if (showLines) {
      const lines = splitHighlightedLines(highlighted);
      codeBody = lines
        .map((line, i) => {
          const textOnly = line.replace(/<[^>]+>/g, '');
          const safeContent = textOnly.length === 0 ? (line + ' ') : line;
          return `<span class="line"><span class="line-num" data-num="${i + 1}">${i + 1}</span><span class="line-content">${safeContent}</span></span>`;
        })
        .join('');
    } else {
      codeBody = highlighted;
    }

    const showMac = codeSettings?.showMacButtons ?? true;
    const showBadge = codeSettings?.showLanguageBadge ?? true;
    const wrapLines = codeSettings?.wrapLines ?? false;
    const displayBadge = lang || (validLang || '');

    const macHeader = showMac || (showBadge && displayBadge)
      ? `<div class="code-mac-header">
          ${showMac ? `<span class="mac-dots"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span></span>` : '<span></span>'}
          ${showBadge && displayBadge ? `<span class="code-lang">${displayBadge}</span>` : ''}
         </div>`
      : '';

    const wrapClass = wrapLines ? 'wrap-code' : 'scroll-code';

    return `<div class="md2post-code-container ${wrapClass}"${lineAttr}>${macHeader}<pre class="md2post-pre"><code class="hljs ${validLang ? 'language-' + validLang : ''}">${codeBody}</code></pre></div>\n`;
  };

  // 1. Custom Code Fence renderer (Mermaid + Highlight.js + Mac window + line numbers)
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const lang = info.split(/\s+/)[0];
    const rawCode = token.content;
    const line = token.map && token.map.length >= 1 ? token.map[0] + 1 : '';
    const lineAttr = line ? ` data-line="${line}"` : '';

    return renderCodeBlock(rawCode, lang, lineAttr);
  };

  // Indented code block renderer (consistent styling with fenced code blocks)
  md.renderer.rules.code_block = (tokens, idx) => {
    const token = tokens[idx];
    const rawCode = token.content;
    const line = token.map && token.map.length >= 1 ? token.map[0] + 1 : '';
    const lineAttr = line ? ` data-line="${line}"` : '';

    return renderCodeBlock(rawCode, '', lineAttr);
  };

  // 2. Custom Table wrapper for mobile responsiveness
  md.renderer.rules.table_open = (tokens, idx) => {
    const line = tokens[idx].map && tokens[idx].map!.length >= 1 ? tokens[idx].map![0] + 1 : '';
    const lineAttr = line ? ` data-line="${line}"` : '';
    return `<div class="md2post-table-wrapper"${lineAttr}><table class="md2post-table">\n`;
  };
  md.renderer.rules.table_close = () => '</table></div>\n';

  // 3. Custom Image renderer (Image captions from alt)
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    const alt = token.content || '';
    let src = srcIndex >= 0 ? String(token.attrs![srcIndex][1]) : '';

    // Normalize protocol-relative URL
    if (src.startsWith('//')) {
      src = 'https:' + src;
      if (srcIndex >= 0) token.attrs![srcIndex][1] = src;
    }

    if (showImageCaptions && alt) {
      return `<figure class="md2post-image-figure">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" class="md2post-img" onerror="window.__handleImgError && window.__handleImgError(this)" />
        <figcaption class="md2post-image-caption">${escapeHtml(alt)}</figcaption>
      </figure>`;
    }

    return `<div class="md2post-image-container">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" class="md2post-img" onerror="window.__handleImgError && window.__handleImgError(this)" />
    </div>`;
  };

  // 4. Custom Link renderer (target="_blank")
  const defaultLinkOpen = md.renderer.rules.link_open || function (tokens, idx, opts, _env, self) {
    return self.renderToken(tokens, idx, opts);
  };

  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
    return defaultLinkOpen(tokens, idx, opts, env, self);
  };

  // 5. Custom Blockquote renderer for Callouts (GitHub Alert syntax: > [!NOTE], > [!TIP], etc.)
  const defaultBlockquoteOpen = md.renderer.rules.blockquote_open || function (tokens, idx, opts, _env, self) {
    return self.renderToken(tokens, idx, opts);
  };
  const defaultBlockquoteClose = md.renderer.rules.blockquote_close || function (tokens, idx, opts, _env, self) {
    return self.renderToken(tokens, idx, opts);
  };

  md.renderer.rules.blockquote_open = (tokens, idx, opts, env, self) => {
    const line = tokens[idx].map && tokens[idx].map!.length >= 1 ? tokens[idx].map![0] + 1 : '';
    const lineAttr = line ? ` data-line="${line}"` : '';

    const calloutType = (tokens[idx] as any).__calloutType;
    if (calloutType && CALLOUT_CONFIG[calloutType]) {
      const config = CALLOUT_CONFIG[calloutType];
      return `<div class="md2post-callout md2post-callout-${calloutType}"${lineAttr} style="border-left-color: ${config.borderColor}; background-color: ${config.bgColor};">
        <div class="callout-header" style="color: ${config.color};">
          <span class="callout-title">${config.title}</span>
        </div>
        <div class="callout-content">\n`;
    }

    if (line) {
      tokens[idx].attrSet('data-line', String(line));
    }
    return defaultBlockquoteOpen(tokens, idx, opts, env, self);
  };

  md.renderer.rules.blockquote_close = (tokens, idx, opts, env, self) => {
    // Check matching open token
    let openIdx = -1;
    let depth = 0;
    for (let i = idx - 1; i >= 0; i--) {
      if (tokens[i].type === 'blockquote_close') depth++;
      if (tokens[i].type === 'blockquote_open') {
        if (depth === 0) {
          openIdx = i;
          break;
        }
        depth--;
      }
    }

    if (openIdx >= 0 && (tokens[openIdx] as any).__calloutType) {
      return `</div></div>\n`;
    }

    return defaultBlockquoteClose(tokens, idx, opts, env, self);
  };

  return md;
}

/**
 * Extracts math formulas before Markdown parser touches text, preventing underscores,
 * ampersands, or slashes from being corrupted by Markdown emphasis or escaping rules.
 */
export function extractMathPlaceholders(markdown: string): {
  cleanMarkdown: string;
  mathMap: Map<string, { formula: string; isBlock: boolean; line: number }>;
} {
  const mathMap = new Map<string, { formula: string; isBlock: boolean; line: number }>();
  let blockIdx = 0;
  let inlineIdx = 0;

  // 1. Block Math: $$ ... $$
  let cleanMarkdown = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula, offset) => {
    const id = `MB_${blockIdx++}_${Date.now()}`;
    const line = markdown.substring(0, offset).split('\n').length;
    mathMap.set(id, { formula: formula.trim(), isBlock: true, line });
    return `\n\n<div class="md2post-math-block" data-math-id="${id}"></div>\n\n`;
  });

  // 2. Inline Math: $ ... $ (must not be $$)
  cleanMarkdown = cleanMarkdown.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/g, (_match, formula, offset) => {
    const id = `MI_${inlineIdx++}_${Date.now()}`;
    const line = markdown.substring(0, offset).split('\n').length;
    mathMap.set(id, { formula: formula.trim(), isBlock: false, line });
    return `<span class="md2post-math-inline" data-math-id="${id}"></span>`;
  });

  return { cleanMarkdown, mathMap };
}

/**
 * Restores math formulas after Markdown rendering, safely executing KaTeX
 * on original untouched LaTeX formulas.
 */
export function restoreMathPlaceholders(
  html: string,
  mathMap: Map<string, { formula: string; isBlock: boolean; line: number }>
): string {
  if (!html || mathMap.size === 0) return html;

  return html.replace(
    /<(div|span)[^>]*data-math-id="([^"]+)"[^>]*>[\s\S]*?<\/\1>/g,
    (match, _tag, id) => {
      const item = mathMap.get(id);
      if (!item) return match;

      let formula = item.formula;
      // Auto-repair control character escapes if present (\x0c -> \f, \x08 -> \b)
      formula = formula.replace(/\x0c/g, '\\f').replace(/\x08/g, '\\b');

      try {
        const rendered = katex.renderToString(formula, {
          displayMode: item.isBlock,
          throwOnError: false
        });

        if (item.isBlock) {
          return `<div class="md2post-math-block" data-line="${item.line}" data-formula="${encodeURIComponent(formula)}">${rendered}</div>`;
        } else {
          return `<span class="md2post-math-inline" data-formula="${encodeURIComponent(formula)}">${rendered}</span>`;
        }
      } catch (err: any) {
        if (item.isBlock) {
          return `<div class="md2post-math-error" data-line="${item.line}" title="${escapeHtml(err?.message || '')}">$$\n${escapeHtml(formula)}\n$$</div>`;
        }
        return `<span class="md2post-math-error" title="${escapeHtml(err?.message || '')}">$${escapeHtml(formula)}$</span>`;
      }
    }
  );
}

/**
 * Full pipeline: render markdown with safe math formulas and line mappings
 */
export function renderMarkdownWithMath(markdown: string, options: RenderOptions = {}): string {
  const { cleanMarkdown, mathMap } = extractMathPlaceholders(markdown);
  const parser = createMarkdownParser(options);
  const html = parser.render(cleanMarkdown);
  return restoreMathPlaceholders(html, mathMap);
}

/**
 * Fallback backward-compatible helper
 */
export function renderMathFormulas(html: string): string {
  if (!html) return '';

  let result = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
    try {
      return `<div class="md2post-math-block">${katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      })}</div>`;
    } catch (e: any) {
      return `<div class="md2post-math-error" title="${escapeHtml(e.message)}">$$\n${escapeHtml(formula)}\n$$</div>`;
    }
  });

  result = result.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/g, (_, formula) => {
    try {
      return `<span class="md2post-math-inline">${katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false
      })}</span>`;
    } catch (e: any) {
      return `<span class="md2post-math-error" title="${escapeHtml(e.message)}">$${escapeHtml(formula)}$</span>`;
    }
  });

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
