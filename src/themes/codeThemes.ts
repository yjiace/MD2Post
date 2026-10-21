import type { CodeThemeConfig } from '../types';

export interface CodeThemeInlinePalette {
  containerBg: string;
  preBg: string;
  textColor: string;
  macHeaderBg: string;
  macHeaderBorder: string;
  lineNumColor: string;
  tokens: Record<string, string>;
}

export const CODE_THEME_PALETTES: Record<string, CodeThemeInlinePalette> = {
  'one-dark': {
    containerBg: '#282c34',
    preBg: '#282c34',
    textColor: '#abb2bf',
    macHeaderBg: '#21252b',
    macHeaderBorder: '#181a1f',
    lineNumColor: '#5c6370',
    tokens: {
      comment: '#5c6370',
      quote: '#5c6370',
      keyword: '#c678dd',
      'selector-tag': '#c678dd',
      string: '#98c379',
      doctag: '#98c379',
      title: '#61afef',
      section: '#61afef',
      'selector-id': '#61afef',
      variable: '#e06c75',
      'template-variable': '#e06c75',
      type: '#e5c07b',
      class: '#e5c07b',
      number: '#d19a66',
      literal: '#d19a66',
      function: '#61afef',
      built_in: '#e5c07b',
      attr: '#d19a66',
      attribute: '#d19a66',
      meta: '#e06c75',
      subst: '#e06c75',
      params: '#abb2bf',
      name: '#e06c75',
      tag: '#e06c75'
    }
  },
  'github-light': {
    containerBg: '#f6f8fa',
    preBg: '#f6f8fa',
    textColor: '#24292f',
    macHeaderBg: '#eaecf0',
    macHeaderBorder: '#d0d7de',
    lineNumColor: '#8c959f',
    tokens: {
      comment: '#6e7781',
      quote: '#6e7781',
      keyword: '#cf222e',
      'selector-tag': '#cf222e',
      string: '#0a3069',
      doctag: '#0a3069',
      title: '#8250df',
      section: '#8250df',
      'selector-id': '#8250df',
      variable: '#953800',
      'template-variable': '#953800',
      type: '#953800',
      class: '#8250df',
      number: '#0550ae',
      literal: '#0550ae',
      function: '#8250df',
      built_in: '#0550ae',
      attr: '#0550ae',
      attribute: '#0550ae',
      meta: '#6e7781',
      subst: '#24292f',
      params: '#24292f',
      name: '#116329',
      tag: '#116329'
    }
  },
  'vscode-dark': {
    containerBg: '#1e1e1e',
    preBg: '#1e1e1e',
    textColor: '#d4d4d4',
    macHeaderBg: '#252526',
    macHeaderBorder: '#333333',
    lineNumColor: '#858585',
    tokens: {
      comment: '#6a9955',
      quote: '#6a9955',
      keyword: '#569cd6',
      'selector-tag': '#569cd6',
      string: '#ce9178',
      doctag: '#ce9178',
      number: '#b5cea8',
      literal: '#569cd6',
      title: '#dcdcaa',
      section: '#dcdcaa',
      type: '#4ec9b0',
      class: '#4ec9b0',
      function: '#dcdcaa',
      built_in: '#4ec9b0',
      attr: '#9cdcfe',
      attribute: '#9cdcfe',
      variable: '#9cdcfe',
      meta: '#569cd6',
      subst: '#d4d4d4',
      params: '#9cdcfe',
      name: '#569cd6',
      tag: '#569cd6'
    }
  },
  'dracula': {
    containerBg: '#282a36',
    preBg: '#282a36',
    textColor: '#f8f8f2',
    macHeaderBg: '#21222c',
    macHeaderBorder: '#191a21',
    lineNumColor: '#6272a4',
    tokens: {
      comment: '#6272a4',
      quote: '#6272a4',
      keyword: '#ff79c6',
      'selector-tag': '#ff79c6',
      string: '#f1fa8c',
      doctag: '#f1fa8c',
      number: '#bd93f9',
      literal: '#bd93f9',
      title: '#50fa7b',
      section: '#50fa7b',
      type: '#8be9fd',
      class: '#8be9fd',
      function: '#50fa7b',
      built_in: '#8be9fd',
      attr: '#50fa7b',
      attribute: '#50fa7b',
      variable: '#f8f8f2',
      meta: '#ff79c6',
      subst: '#f8f8f2',
      params: '#ffb86c',
      name: '#ff79c6',
      tag: '#ff79c6'
    }
  },
  'solarized-light': {
    containerBg: '#fdf6e3',
    preBg: '#fdf6e3',
    textColor: '#657b83',
    macHeaderBg: '#eee8d5',
    macHeaderBorder: '#e0dacf',
    lineNumColor: '#93a1a1',
    tokens: {
      comment: '#93a1a1',
      quote: '#93a1a1',
      keyword: '#859900',
      'selector-tag': '#859900',
      string: '#2aa198',
      doctag: '#2aa198',
      number: '#d33682',
      literal: '#d33682',
      title: '#268bd2',
      section: '#268bd2',
      type: '#b58900',
      class: '#b58900',
      function: '#268bd2',
      built_in: '#268bd2',
      attr: '#b58900',
      attribute: '#b58900',
      variable: '#b58900',
      meta: '#859900',
      subst: '#657b83',
      params: '#657b83',
      name: '#268bd2',
      tag: '#268bd2'
    }
  },
  'monokai': {
    containerBg: '#272822',
    preBg: '#272822',
    textColor: '#f8f8f2',
    macHeaderBg: '#1e1f1c',
    macHeaderBorder: '#141412',
    lineNumColor: '#75715e',
    tokens: {
      comment: '#75715e',
      quote: '#75715e',
      keyword: '#f92672',
      'selector-tag': '#f92672',
      string: '#e6db74',
      doctag: '#e6db74',
      number: '#ae81ff',
      literal: '#ae81ff',
      title: '#a6e22e',
      section: '#a6e22e',
      type: '#66d9ef',
      class: '#66d9ef',
      function: '#a6e22e',
      built_in: '#66d9ef',
      attr: '#a6e22e',
      attribute: '#a6e22e',
      variable: '#f8f8f2',
      meta: '#75715e',
      subst: '#f8f8f2',
      params: '#fd971f',
      name: '#f92672',
      tag: '#f92672'
    }
  }
};

function buildThemeCss(palette: CodeThemeInlinePalette, isDark: boolean): string {
  const t = palette.tokens;
  return `
    #nice .md2post-code-container,
    .md2post-code-container {
      background-color: ${palette.containerBg} !important;
      border-radius: 6px;
      margin: 12px 0;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, ${isDark ? '0.2' : '0.08'});
    }
    #nice .code-mac-header,
    .code-mac-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background-color: ${palette.macHeaderBg} !important;
      border-bottom: 1px solid ${palette.macHeaderBorder} !important;
    }
    #nice .mac-dots, .mac-dots { display: flex; gap: 5px; }
    #nice .dot, .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
    #nice .dot-red, .dot-red { background-color: #ff5f56; }
    #nice .dot-yellow, .dot-yellow { background-color: #ffbd2e; }
    #nice .dot-green, .dot-green { background-color: #27c93f; }
    #nice .code-lang,
    .code-lang {
      font-size: 10.5px;
      text-transform: uppercase;
      color: ${isDark ? '#9da5b4' : '#57606a'};
      font-family: monospace;
      letter-spacing: 0.05em;
    }
    #nice .md2post-pre,
    .md2post-pre {
      margin: 0 !important;
      padding: 8px 12px !important;
      overflow-x: auto;
      background-color: ${palette.preBg} !important;
    }
    #nice .wrap-code .md2post-pre,
    .wrap-code .md2post-pre {
      white-space: pre-wrap !important;
      word-break: break-all !important;
    }
    #nice .scroll-code .md2post-pre,
    .scroll-code .md2post-pre {
      white-space: pre !important;
    }
    #nice .hljs,
    .hljs {
      color: ${palette.textColor} !important;
      font-family: 'Fira Code', 'JetBrains Mono', Consolas, Monaco, monospace !important;
      font-size: 13px !important;
      line-height: 1.35 !important;
      background-color: transparent !important;
    }
    #nice .line,
    .line {
      display: block !important;
      min-height: 1.35em !important;
      line-height: 1.35 !important;
      white-space: pre !important;
      font-size: 13px !important;
    }
    #nice .line-num,
    .line-num {
      display: inline-block !important;
      width: 2.8em !important;
      min-width: 2.8em !important;
      margin-right: 0.8em !important;
      text-align: right !important;
      color: ${palette.lineNumColor} !important;
      user-select: none !important;
      line-height: 1.35 !important;
      font-size: 12px;
      opacity: 0.55;
    }
    #nice .line-content,
    .line-content {
      display: inline !important;
      white-space: pre !important;
      line-height: 1.35 !important;
    }

    /* Complete Syntax Highlighting Tokens */
    #nice .hljs-comment, .hljs-comment, #nice .hljs-quote, .hljs-quote { color: ${t.comment || '#5c6370'} !important; font-style: italic; }
    #nice .hljs-keyword, .hljs-keyword, #nice .hljs-selector-tag, .hljs-selector-tag, #nice .hljs-subst, .hljs-subst { color: ${t.keyword || '#c678dd'} !important; font-weight: 600; }
    #nice .hljs-tag, .hljs-tag, #nice .hljs-name, .hljs-name { color: ${t.name || t.tag || t.keyword || '#e06c75'} !important; font-weight: 600; }
    #nice .hljs-attr, .hljs-attr, #nice .hljs-attribute, .hljs-attribute { color: ${t.attr || t.attribute || '#d19a66'} !important; }
    #nice .hljs-string, .hljs-string, #nice .hljs-doctag, .hljs-doctag, #nice .hljs-regexp, .hljs-regexp, #nice .hljs-meta-string, .hljs-meta-string { color: ${t.string || '#98c379'} !important; }
    #nice .hljs-title, .hljs-title, #nice .hljs-section, .hljs-section, #nice .hljs-selector-id, .hljs-selector-id, #nice .hljs-function, .hljs-function { color: ${t.title || '#61afef'} !important; font-weight: 600; }
    #nice .hljs-variable, .hljs-variable, #nice .hljs-template-variable, .hljs-template-variable { color: ${t.variable || '#e06c75'} !important; }
    #nice .hljs-type, .hljs-type, #nice .hljs-class, .hljs-class, #nice .hljs-built_in, .hljs-built_in, #nice .hljs-builtin-name, .hljs-builtin-name { color: ${t.type || t.built_in || '#e5c07b'} !important; }
    #nice .hljs-number, .hljs-number, #nice .hljs-literal, .hljs-literal { color: ${t.number || t.literal || '#d19a66'} !important; }
    #nice .hljs-meta, .hljs-meta, #nice .hljs-meta-keyword, .hljs-meta-keyword { color: ${t.meta || '#61afef'} !important; }
    #nice .hljs-params, .hljs-params { color: ${t.params || palette.textColor} !important; }
    #nice .hljs-symbol, .hljs-symbol, #nice .hljs-bullet, .hljs-bullet, #nice .hljs-link, .hljs-link { color: ${t.keyword || '#56b6c2'} !important; }
    #nice .hljs-punctuation, .hljs-punctuation { color: ${palette.textColor} !important; }
  `;
}

export const BUILT_IN_CODE_THEMES: CodeThemeConfig[] = [
  {
    id: 'one-dark',
    name: 'One Dark (深色推荐)',
    isDark: true,
    css: buildThemeCss(CODE_THEME_PALETTES['one-dark'], true)
  },
  {
    id: 'github-light',
    name: 'GitHub Light (浅色典雅)',
    isDark: false,
    css: buildThemeCss(CODE_THEME_PALETTES['github-light'], false)
  },
  {
    id: 'vscode-dark',
    name: 'VS Code Dark+ (深色开发)',
    isDark: true,
    css: buildThemeCss(CODE_THEME_PALETTES['vscode-dark'], true)
  },
  {
    id: 'dracula',
    name: 'Dracula (吸血鬼高反差)',
    isDark: true,
    css: buildThemeCss(CODE_THEME_PALETTES['dracula'], true)
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light (经典护眼浅色)',
    isDark: false,
    css: buildThemeCss(CODE_THEME_PALETTES['solarized-light'], false)
  },
  {
    id: 'monokai',
    name: 'Monokai Pro (复古极客)',
    isDark: true,
    css: buildThemeCss(CODE_THEME_PALETTES['monokai'], true)
  }
];

export function getCodeThemeInlinePalette(themeId?: string): CodeThemeInlinePalette {
  if (themeId && CODE_THEME_PALETTES[themeId]) {
    return CODE_THEME_PALETTES[themeId];
  }
  return CODE_THEME_PALETTES['one-dark'];
}
