import type { CodeThemeConfig } from '../types';

export const BUILT_IN_CODE_THEMES: CodeThemeConfig[] = [
  {
    id: 'one-dark',
    name: 'One Dark (深色推荐)',
    isDark: true,
    css: `
      .md2post-code-container {
        background-color: #282c34;
        border-radius: 6px;
        margin: 12px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #21252b;
        border-bottom: 1px solid #181a1f;
      }
      .mac-dots {
        display: flex;
        gap: 5px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        display: inline-block;
      }
      .dot-red { background-color: #ff5f56; }
      .dot-yellow { background-color: #ffbd2e; }
      .dot-green { background-color: #27c93f; }
      .code-lang {
        font-size: 10.5px;
        text-transform: uppercase;
        color: #9da5b4;
        font-family: monospace;
        letter-spacing: 0.05em;
      }
      .md2post-pre {
        margin: 0;
        padding: 10px 12px;
        overflow-x: auto;
        background-color: transparent;
      }
      .wrap-code .md2post-pre {
        white-space: pre-wrap;
        word-break: break-all;
      }
      .scroll-code .md2post-pre {
        white-space: pre;
      }
      .hljs {
        color: #abb2bf;
        font-family: 'Fira Code', 'JetBrains Mono', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line {
        display: block;
        line-height: 1.4;
      }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #5c6370;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
      .hljs-keyword, .hljs-selector-tag { color: #c678dd; }
      .hljs-string, .hljs-doctag { color: #98c379; }
      .hljs-title, .hljs-section, .hljs-selector-id { color: #61afef; }
      .hljs-variable, .hljs-template-variable { color: #e06c75; }
      .hljs-type, .hljs-class .hljs-title { color: #e5c07b; }
      .hljs-number, .hljs-literal { color: #d19a66; }
      .hljs-function { color: #61afef; }
    `
  },
  {
    id: 'github-light',
    name: 'GitHub Light (浅色典雅)',
    isDark: false,
    css: `
      .md2post-code-container {
        background-color: #f6f8fa;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        margin: 12px 0;
        overflow: hidden;
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #eaecf0;
        border-bottom: 1px solid #d0d7de;
      }
      .mac-dots { display: flex; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .dot-red { background-color: #ff5f56; }
      .dot-yellow { background-color: #ffbd2e; }
      .dot-green { background-color: #27c93f; }
      .code-lang { font-size: 10.5px; text-transform: uppercase; color: #57606a; font-family: monospace; }
      .md2post-pre { margin: 0; padding: 10px 12px; overflow-x: auto; background-color: transparent; }
      .wrap-code .md2post-pre { white-space: pre-wrap; word-break: break-all; }
      .scroll-code .md2post-pre { white-space: pre; }
      .hljs {
        color: #24292f;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line { display: block; line-height: 1.4; }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #8c959f;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment, .hljs-quote { color: #6e7781; font-style: italic; }
      .hljs-keyword, .hljs-selector-tag { color: #cf222e; }
      .hljs-string, .hljs-doctag { color: #0a3069; }
      .hljs-title, .hljs-section { color: #8250df; }
      .hljs-variable { color: #953800; }
      .hljs-number, .hljs-literal { color: #0550ae; }
    `
  },
  {
    id: 'vscode-dark',
    name: 'VS Code Dark+ (深色开发)',
    isDark: true,
    css: `
      .md2post-code-container {
        background-color: #1e1e1e;
        border-radius: 6px;
        margin: 12px 0;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #252526;
        border-bottom: 1px solid #333333;
      }
      .mac-dots { display: flex; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .dot-red { background-color: #ff5f56; }
      .dot-yellow { background-color: #ffbd2e; }
      .dot-green { background-color: #27c93f; }
      .code-lang { font-size: 10.5px; text-transform: uppercase; color: #858585; font-family: monospace; }
      .md2post-pre { margin: 0; padding: 10px 12px; overflow-x: auto; background-color: transparent; }
      .wrap-code .md2post-pre { white-space: pre-wrap; word-break: break-all; }
      .scroll-code .md2post-pre { white-space: pre; }
      .hljs {
        color: #d4d4d4;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line { display: block; line-height: 1.4; }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #858585;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment { color: #6a9955; font-style: italic; }
      .hljs-keyword { color: #569cd6; }
      .hljs-string { color: #ce9178; }
      .hljs-number { color: #b5cea8; }
      .hljs-title { color: #dcdcaa; }
      .hljs-type { color: #4ec9b0; }
    `
  },
  {
    id: 'dracula',
    name: 'Dracula (吸血鬼高反差)',
    isDark: true,
    css: `
      .md2post-code-container {
        background-color: #282a36;
        border-radius: 6px;
        margin: 12px 0;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #21222c;
        border-bottom: 1px solid #191a21;
      }
      .mac-dots { display: flex; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .dot-red { background-color: #ff5555; }
      .dot-yellow { background-color: #f1fa8c; }
      .dot-green { background-color: #50fa7b; }
      .code-lang { font-size: 10.5px; text-transform: uppercase; color: #6272a4; font-family: monospace; }
      .md2post-pre { margin: 0; padding: 10px 12px; overflow-x: auto; background-color: transparent; }
      .wrap-code .md2post-pre { white-space: pre-wrap; word-break: break-all; }
      .scroll-code .md2post-pre { white-space: pre; }
      .hljs {
        color: #f8f8f2;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line { display: block; line-height: 1.4; }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #6272a4;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment { color: #6272a4; }
      .hljs-keyword { color: #ff79c6; }
      .hljs-string { color: #f1fa8c; }
      .hljs-number { color: #bd93f9; }
      .hljs-title { color: #50fa7b; }
      .hljs-type { color: #8be9fd; }
    `
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light (经典护眼浅色)',
    isDark: false,
    css: `
      .md2post-code-container {
        background-color: #fdf6e3;
        border: 1px solid #eee8d5;
        border-radius: 6px;
        margin: 12px 0;
        overflow: hidden;
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #eee8d5;
        border-bottom: 1px solid #e0dacf;
      }
      .mac-dots { display: flex; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .dot-red { background-color: #dc322f; }
      .dot-yellow { background-color: #b58900; }
      .dot-green { background-color: #859900; }
      .code-lang { font-size: 10.5px; text-transform: uppercase; color: #93a1a1; font-family: monospace; }
      .md2post-pre { margin: 0; padding: 10px 12px; overflow-x: auto; background-color: transparent; }
      .wrap-code .md2post-pre { white-space: pre-wrap; word-break: break-all; }
      .scroll-code .md2post-pre { white-space: pre; }
      .hljs {
        color: #657b83;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line { display: block; line-height: 1.4; }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #93a1a1;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment { color: #93a1a1; font-style: italic; }
      .hljs-keyword { color: #859900; }
      .hljs-string { color: #2aa198; }
      .hljs-number { color: #d33682; }
      .hljs-title { color: #268bd2; }
    `
  },
  {
    id: 'monokai',
    name: 'Monokai Pro (复古极客)',
    isDark: true,
    css: `
      .md2post-code-container {
        background-color: #272822;
        border-radius: 6px;
        margin: 12px 0;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      .code-mac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        background-color: #1e1f1c;
        border-bottom: 1px solid #141412;
      }
      .mac-dots { display: flex; gap: 5px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
      .dot-red { background-color: #f92672; }
      .dot-yellow { background-color: #e6db74; }
      .dot-green { background-color: #a6e22e; }
      .code-lang { font-size: 10.5px; text-transform: uppercase; color: #75715e; font-family: monospace; }
      .md2post-pre { margin: 0; padding: 10px 12px; overflow-x: auto; background-color: transparent; }
      .wrap-code .md2post-pre { white-space: pre-wrap; word-break: break-all; }
      .scroll-code .md2post-pre { white-space: pre; }
      .hljs {
        color: #f8f8f2;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .line { display: block; line-height: 1.4; }
      .line-num {
        display: inline-block;
        width: 2em;
        margin-right: 0.8em;
        text-align: right;
        color: #75715e;
        user-select: none;
        line-height: 1.4;
      }
      .hljs-comment { color: #75715e; }
      .hljs-keyword { color: #f92672; }
      .hljs-string { color: #e6db74; }
      .hljs-number { color: #ae81ff; }
      .hljs-title { color: #a6e22e; }
      .hljs-type { color: #66d9ef; }
    `
  }
];

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

export function getCodeThemeInlinePalette(themeId?: string): CodeThemeInlinePalette {
  if (themeId && CODE_THEME_PALETTES[themeId]) {
    return CODE_THEME_PALETTES[themeId];
  }
  return CODE_THEME_PALETTES['one-dark'];
}

