import type { ThemeConfig } from '../types';

export const BUILT_IN_THEMES: ThemeConfig[] = [
  {
    id: 'classic-tech',
    name: '经典技术蓝',
    description: '深邃理性，深蓝科技感，最适合架构、后端与技术深层解析。',
    primaryColor: '#0969da',
    secondaryColor: '#54aeff',
    backgroundColor: '#ffffff',
    textColor: '#24292f',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    fontSize: 16,
    lineHeight: 1.75,
    paragraphSpacing: 16
  },
  {
    id: 'minimal-slate',
    name: '极简石墨黑',
    description: '冷峻简约，高级石墨灰调，适合现代工程实践与产品思考。',
    primaryColor: '#334155',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 15.5,
    lineHeight: 1.8,
    paragraphSpacing: 16
  },
  {
    id: 'vibrant-indigo',
    name: '活力前沿紫',
    description: '渐变微光，紫罗兰科技风，适合前端、AI 与创新技术专题。',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    backgroundColor: '#ffffff',
    textColor: '#18181b',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 16,
    lineHeight: 1.75,
    paragraphSpacing: 16
  },
  {
    id: 'forest-emerald',
    name: '墨绿自然护眼',
    description: '柔和舒适，低饱和翡翠绿，适合长文深度阅读与全栈知识库。',
    primaryColor: '#059669',
    secondaryColor: '#34d399',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 16,
    lineHeight: 1.8,
    paragraphSpacing: 18
  },
  {
    id: 'sunset-amber',
    name: '暖阳琥珀橙',
    description: '热情饱满，高辨识度暖色系，适合热点分享与运营干货。',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#292524',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 16,
    lineHeight: 1.75,
    paragraphSpacing: 16
  }
];

export const PRESET_PRIMARY_COLORS = [
  { name: '经典蓝', color: '#0969da' },
  { name: '石墨黑', color: '#334155' },
  { name: '极光紫', color: '#6366f1' },
  { name: '翡翠绿', color: '#059669' },
  { name: '琥珀橙', color: '#d97706' },
  { name: '胭脂红', color: '#e11d48' },
  { name: '青碧蓝', color: '#0891b2' },
  { name: '薄荷蓝', color: '#0d9488' }
];

export const FONT_FAMILY_OPTIONS = [
  {
    label: '现代无衬线 (推荐)',
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
export function generateThemeCss(theme: ThemeConfig, primaryColorOverride?: string, customCss?: string): string {
  const primary = primaryColorOverride || theme.primaryColor;

  return `
/* MD2Post Generated Theme Styles */
.md2post-rendered-content {
  color: ${theme.textColor};
  font-family: ${theme.fontFamily};
  font-size: ${theme.fontSize}px;
  line-height: ${theme.lineHeight};
  letter-spacing: 0.02em;
  word-break: break-word;
  background-color: transparent;
}

.md2post-rendered-content p {
  margin-top: 0;
  margin-bottom: ${theme.paragraphSpacing}px;
}

/* Headings */
.md2post-rendered-content h1 {
  font-size: 1.85em;
  font-weight: 700;
  color: #111827;
  margin-top: 1.8em;
  margin-bottom: 0.8em;
  padding-bottom: 0.4em;
  border-bottom: 2px solid ${primary};
  line-height: 1.35;
}

.md2post-rendered-content h2 {
  font-size: 1.45em;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5em;
  margin-bottom: 0.6em;
  padding-left: 0.5em;
  border-left: 4px solid ${primary};
  line-height: 1.4;
}

.md2post-rendered-content h3 {
  font-size: 1.2em;
  font-weight: 600;
  color: #374151;
  margin-top: 1.3em;
  margin-bottom: 0.5em;
}

.md2post-rendered-content h4, 
.md2post-rendered-content h5, 
.md2post-rendered-content h6 {
  font-size: 1.05em;
  font-weight: 600;
  color: #4b5563;
  margin-top: 1.1em;
  margin-bottom: 0.4em;
}

/* Blockquotes */
.md2post-rendered-content blockquote {
  margin: 1.2em 0;
  padding: 0.8em 1.2em;
  color: #475569;
  background-color: #f8fafc;
  border-left: 4px solid ${primary};
  border-radius: 0 8px 8px 0;
}

.md2post-rendered-content blockquote p:last-child {
  margin-bottom: 0;
}

/* Links */
.md2post-rendered-content a {
  color: ${primary};
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px dashed ${primary};
  transition: opacity 0.2s;
}

.md2post-rendered-content a:hover {
  opacity: 0.8;
  border-bottom-style: solid;
}

/* Inline code */
.md2post-rendered-content :not(pre) > code {
  font-family: 'Fira Code', Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.88em;
  padding: 0.2em 0.45em;
  margin: 0 0.2em;
  background-color: #f1f5f9;
  color: #e11d48;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* Lists */
.md2post-rendered-content ul, 
.md2post-rendered-content ol {
  padding-left: 1.8em;
  margin-bottom: ${theme.paragraphSpacing}px;
}

.md2post-rendered-content li {
  margin-bottom: 0.35em;
}

.md2post-rendered-content li::marker {
  color: ${primary};
}

/* Tables */
.md2post-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1.4em 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.md2post-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.92em;
}

.md2post-table th {
  background-color: ${primary};
  color: #ffffff;
  font-weight: 600;
  padding: 0.75em 1em;
  border: 1px solid ${primary};
  white-space: nowrap;
}

.md2post-table td {
  padding: 0.7em 1em;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

.md2post-table tr:nth-child(even) {
  background-color: #f8fafc;
}

.md2post-table tr:hover {
  background-color: #f1f5f9;
}

/* Horizontal Rule */
.md2post-rendered-content hr {
  height: 2px;
  background-color: #e2e8f0;
  border: none;
  margin: 2em 0;
}

/* Callouts */
.md2post-callout {
  border-left: 4px solid;
  border-radius: 0 8px 8px 0;
  padding: 0.9em 1.2em;
  margin: 1.3em 0;
}

.md2post-callout .callout-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-weight: 600;
  font-size: 0.95em;
  margin-bottom: 0.4em;
}

.md2post-callout .callout-content p:last-child {
  margin-bottom: 0;
}

/* Images & Figures */
.md2post-image-figure {
  margin: 1.5em 0;
  text-align: center;
}

.md2post-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  display: block;
  margin: 0 auto;
}

.md2post-image-caption {
  font-size: 0.85em;
  color: #64748b;
  margin-top: 0.6em;
  text-align: center;
  font-style: italic;
}

/* Footnotes list at document bottom */
.md2post-footnotes-section {
  margin-top: 2.5em;
  padding-top: 1.2em;
  border-top: 1px dashed #cbd5e1;
  font-size: 0.88em;
  color: #64748b;
}

.md2post-footnotes-title {
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.6em;
}

.md2post-footnote-item {
  margin-bottom: 0.35em;
  word-break: break-all;
}

/* Math */
.md2post-math-block {
  overflow-x: auto;
  margin: 1.2em 0;
  padding: 0.8em;
  text-align: center;
}

/* User Custom CSS */
${customCss || ''}
`;
}
