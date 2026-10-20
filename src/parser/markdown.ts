import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import katex from 'katex';
import type { CodeBlockSettings } from '../types';

export interface RenderOptions {
  codeSettings?: CodeBlockSettings;
  showImageCaptions?: boolean;
}

// Callout types metadata
export const CALLOUT_CONFIG: Record<
  string,
  { type: string; title: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  note: {
    type: 'note',
    title: '注意',
    color: '#0969da',
    bgColor: '#f0f7ff',
    borderColor: '#0969da',
    icon: 'ℹ️'
  },
  tip: {
    type: 'tip',
    title: '提示',
    color: '#1a7f37',
    bgColor: '#f0fbf0',
    borderColor: '#1a7f37',
    icon: '💡'
  },
  important: {
    type: 'important',
    title: '重点',
    color: '#8250df',
    bgColor: '#fbf0ff',
    borderColor: '#8250df',
    icon: '❗️'
  },
  warning: {
    type: 'warning',
    title: '警告',
    color: '#bf8700',
    bgColor: '#fff8ea',
    borderColor: '#bf8700',
    icon: '⚠️'
  },
  caution: {
    type: 'caution',
    title: '危险',
    color: '#cf222e',
    bgColor: '#fff0f0',
    borderColor: '#cf222e',
    icon: '🛑'
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

  // Inject data-line attribute for block tokens to enable accurate synchronized scrolling
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

  // 1. Custom Code Fence renderer (Mermaid + Highlight.js + Mac window + line numbers)
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const lang = info.split(/\s+/)[0].toLowerCase();
    const rawCode = token.content;
    const line = token.map && token.map.length >= 1 ? token.map[0] + 1 : '';
    const lineAttr = line ? ` data-line="${line}"` : '';

    // Check for Mermaid diagram
    if (lang === 'mermaid') {
      const encodedCode = encodeURIComponent(rawCode);
      return `<div class="md2post-mermaid"${lineAttr} data-code="${encodedCode}"><pre class="mermaid">${escapeHtml(rawCode)}</pre></div>\n`;
    }

    // Syntax Highlighting
    let highlighted = '';
    const validLang = lang && hljs.getLanguage(lang) ? lang : '';

    if (validLang) {
      try {
        highlighted = hljs.highlight(rawCode, { language: validLang, ignoreIllegals: true }).value;
      } catch {
        highlighted = escapeHtml(rawCode);
      }
    } else {
      highlighted = escapeHtml(rawCode);
    }

    // Format line numbers if enabled
    const showLines = codeSettings?.showLineNumbers ?? true;
    let codeBody = '';
    if (showLines) {
      const lines = highlighted.split(/\r?\n/);
      // Remove trailing empty line if code ends with newline
      if (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      codeBody = lines
        .map((line, i) => `<span class="line"><span class="line-num" data-num="${i + 1}">${i + 1}</span><span class="line-content">${line || ' '}</span></span>`)
        .join('');
    } else {
      codeBody = highlighted;
    }

    const showMac = codeSettings?.showMacButtons ?? true;
    const showBadge = codeSettings?.showLanguageBadge ?? true;
    const wrapLines = codeSettings?.wrapLines ?? false;

    const macHeader = showMac || showBadge
      ? `<div class="code-mac-header">
          ${showMac ? `<span class="mac-dots"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span></span>` : ''}
          ${showBadge && lang ? `<span class="code-lang">${lang}</span>` : ''}
         </div>`
      : '';

    const wrapClass = wrapLines ? 'wrap-code' : 'scroll-code';

    return `<div class="md2post-code-container ${wrapClass}"${lineAttr}>${macHeader}<pre class="md2post-pre"><code class="hljs ${validLang ? 'language-' + validLang : ''}">${codeBody}</code></pre></div>\n`;
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

    // Check if the next token contains callout marker [!NOTE], [!TIP], etc.
    let isCallout = false;
    let calloutType = '';

    for (let i = idx + 1; i < tokens.length; i++) {
      if (tokens[i].type === 'blockquote_close') break;
      if (tokens[i].type === 'paragraph_open') {
        const inlineToken = tokens[i + 1];
        if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
          const match = inlineToken.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
          if (match) {
            isCallout = true;
            calloutType = match[1].toLowerCase();
            // Remove the [!TYPE] marker and any trailing line break or space
            inlineToken.content = inlineToken.content.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i, '').trimStart();
            if (inlineToken.children && inlineToken.children.length > 0) {
              const firstChild = inlineToken.children[0];
              if (firstChild && firstChild.type === 'text') {
                firstChild.content = firstChild.content.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i, '').trimStart();
              }
            }
          }
        }
        break;
      }
    }

    if (isCallout && CALLOUT_CONFIG[calloutType]) {
      const config = CALLOUT_CONFIG[calloutType];
      (tokens[idx] as any).__calloutType = calloutType;
      return `<div class="md2post-callout md2post-callout-${calloutType}"${lineAttr} style="border-left-color: ${config.borderColor}; background-color: ${config.bgColor};">
        <div class="callout-header" style="color: ${config.color};">
          <span class="callout-icon">${config.icon}</span>
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
