import type { ThemeConfig } from '../types';
import { WEIYAN_THEMES, WEIYAN_BASIC_CSS } from './weiyanThemes';

export const BUILT_IN_THEMES: ThemeConfig[] = WEIYAN_THEMES.map(t => ({
  id: t.id,
  name: t.name,
  description: `${t.name} - 参考自 md.weiyan.cc 经典微信排版主题`,
  primaryColor: t.color,
  secondaryColor: t.color,
  backgroundColor: '#ffffff',
  textColor: '#24292f',
  fontFamily: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
  fontSize: 16,
  lineHeight: 1.6,
  paragraphSpacing: 16,
  customCss: t.css
}));

export const PRESET_PRIMARY_COLORS = [
  { name: '橙心红', color: '#ef7060' },
  { name: '姹紫', color: '#955b99' },
  { name: '嫩青', color: '#41b34f' },
  { name: '绿意', color: '#009688' },
  { name: '红绯', color: '#d93a49' },
  { name: '全栈蓝', color: '#1890ff' },
  { name: '极客黑', color: '#333333' },
  { name: '蔷薇紫', color: '#6f42c1' }
];

export const FONT_FAMILY_OPTIONS = [
  {
    label: 'Optima / PingFang SC (默认推荐)',
    value: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
  },
  {
    label: '现代无衬线 (系统字体)',
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
  },
  {
    label: '人文衬线 (思源宋体风)',
    value: "Georgia, 'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', SimSun, serif"
  },
  {
    label: '代码极简风 (等宽倾向)',
    value: "'Inter', -apple-system, 'SF Pro Text', 'PingFang SC', sans-serif"
  }
];

/**
 * Generate CSS rules string based on theme and color overrides
 */
export function generateThemeCss(theme: ThemeConfig, _primaryColorOverride?: string, customCss?: string): string {
  const weiyan = WEIYAN_THEMES.find(t => t.id === theme.id) || WEIYAN_THEMES[1]; // default 橙心
  const themeCss = weiyan ? weiyan.css : (theme.customCss || '');

  return `
/* === Weiyan Base CSS === */
${WEIYAN_BASIC_CSS}

/* === Weiyan Active Theme: ${theme.name} === */
${themeCss}

/* === MD2Post Supplementary Features (Callouts, Code Boxes, Tables, Mermaid) === */
#nice {
  margin: 0 auto;
  box-sizing: border-box;
}

#nice .md2post-callout {
  margin: 1.2em 0;
  padding: 0.8em 1.2em;
  border-left: 4px solid #ef7060;
  border-radius: 0 8px 8px 0;
  background-color: #fff8f6;
}

#nice .callout-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 6px;
}

#nice .callout-content p {
  margin: 0 !important;
  padding: 0 !important;
}

#nice .md2post-code-container {
  margin: 1.2em 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

#nice .code-mac-header,
#nice .mac-window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

#nice .mac-dots {
  display: flex;
  gap: 6px;
}

#nice .dot,
#nice .mac-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

#nice .dot-red, #nice .mac-dot-red { background-color: #ff5f56; }
#nice .dot-yellow, #nice .mac-dot-yellow { background-color: #ffbd2e; }
#nice .dot-green, #nice .mac-dot-green { background-color: #27c93f; }

#nice .code-lang,
#nice .mac-lang-badge {
  color: #abb2bf;
  font-size: 11px;
  text-transform: uppercase;
  font-family: monospace;
  letter-spacing: 0.05em;
}

#nice pre.md2post-pre {
  margin: 0 !important;
  padding: 8px 12px !important;
  overflow-x: auto;
  background-color: transparent !important;
  font-family: 'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.35 !important;
}

#nice .md2post-code-container pre code,
#nice pre.md2post-pre code,
#nice pre code {
  display: block !important;
  font-family: 'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace !important;
  font-size: 13px !important;
  line-height: 1.35 !important;
  background-color: transparent !important;
  border-radius: 0;
  padding: 0;
}

#nice .md2post-code-container .line,
#nice .line {
  display: block !important;
  min-height: 1.35em !important;
  line-height: 1.35 !important;
  white-space: pre !important;
  margin: 0 !important;
  padding: 0 !important;
  font-size: 13px !important;
}

#nice .md2post-code-container .line-num,
#nice .line-num {
  display: inline-block !important;
  width: 2.8em !important;
  min-width: 2.8em !important;
  margin-right: 0.8em !important;
  text-align: right !important;
  user-select: none !important;
  opacity: 0.45;
  box-sizing: border-box;
  vertical-align: top;
  font-size: 12px;
  line-height: 1.35 !important;
}

#nice .md2post-code-container .line-content,
#nice .line-content {
  display: inline !important;
  white-space: pre !important;
  vertical-align: top;
}

#nice .wrap-code pre.md2post-pre,
#nice .wrap-code .line,
#nice .wrap-code .line-content {
  white-space: pre-wrap !important;
  word-break: break-all !important;
}

#nice .scroll-code pre.md2post-pre {
  white-space: pre !important;
  overflow-x: auto;
}

/* === Syntax Highlighting Tokens Fallback === */
#nice .md2post-code-container .hljs-comment, #nice .md2post-code-container .hljs-quote { color: #5c6370 !important; font-style: italic; }
#nice .md2post-code-container .hljs-keyword, #nice .md2post-code-container .hljs-selector-tag { color: #c678dd !important; font-weight: 600; }
#nice .md2post-code-container .hljs-tag, #nice .md2post-code-container .hljs-name { color: #e06c75 !important; font-weight: 600; }
#nice .md2post-code-container .hljs-attr, #nice .md2post-code-container .hljs-attribute { color: #d19a66 !important; }
#nice .md2post-code-container .hljs-string, #nice .md2post-code-container .hljs-doctag, #nice .md2post-code-container .hljs-regexp { color: #98c379 !important; }
#nice .md2post-code-container .hljs-title, #nice .md2post-code-container .hljs-section, #nice .md2post-code-container .hljs-function { color: #61afef !important; font-weight: 600; }
#nice .md2post-code-container .hljs-variable, #nice .md2post-code-container .hljs-template-variable { color: #e06c75 !important; }
#nice .md2post-code-container .hljs-type, #nice .md2post-code-container .hljs-class, #nice .md2post-code-container .hljs-built_in { color: #e5c07b !important; }
#nice .md2post-code-container .hljs-number, #nice .md2post-code-container .hljs-literal { color: #d19a66 !important; }
#nice .md2post-code-container .hljs-meta, #nice .md2post-code-container .hljs-meta-keyword { color: #61afef !important; }
#nice .md2post-code-container .hljs-params { color: #abb2bf !important; }

/* === Mermaid Diagram Isolation === */
#nice .md2post-mermaid,
#nice .mermaid-diagram-wrap,
#nice .diagram-svg-container,
#nice .diagram-svg-container svg {
  letter-spacing: normal !important;
  word-spacing: normal !important;
  line-height: normal !important;
  white-space: normal !important;
}

#nice .diagram-svg-container svg {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 0 auto;
}

#nice .diagram-svg-container svg text,
#nice .diagram-svg-container svg tspan {
  letter-spacing: normal !important;
  word-spacing: normal !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif !important;
}

#nice .md2post-table-wrapper {
  overflow-x: auto;
  margin: 1.4em 0;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

#nice table.md2post-table {
  width: 100%;
  border-collapse: collapse;
}

${customCss || ''}
`;
}
