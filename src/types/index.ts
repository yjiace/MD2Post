export type PlatformType = 'wechat' | 'toutiao' | 'juejin' | 'zhihu' | 'universal';

export type CopyMode = 'rich-text' | 'markdown';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number; // in px
  lineHeight: number;
  paragraphSpacing: number; // in px
  customCss?: string;
}

export interface CodeThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  css: string;
}

export interface CodeBlockSettings {
  showMacButtons: boolean;
  showLineNumbers: boolean;
  showLanguageBadge: boolean;
  wrapLines: boolean;
  themeId: string;
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  badge: string;
  defaultCopyMode: CopyMode;
  supportExternalLinks: boolean;
  convertLinksToFootnotes: boolean;
  tableStrategy: 'inline-table' | 'markdown-table' | 'pure-table';
  codeBlockStrategy: 'inline-highlight' | 'markdown-code' | 'clean-mono';
  tipsStrategy: 'styled-callout' | 'quote-box' | 'markdown-quote';
}

export interface MindMapData {
  title: string;
  rawContent: string;
  nodes: MindMapNode[];
}

export interface MindMapNode {
  id: string;
  text: string;
  level: number;
  children: MindMapNode[];
}

export interface DiagnosticItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'image' | 'math' | 'mermaid' | 'table' | 'link' | 'syntax';
  title: string;
  detail: string;
  sourceSnippet?: string;
  line?: number;
}

export interface ArticleItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}

export interface AppSettings {
  activeThemeId: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  customCss: string;
  codeSettings: CodeBlockSettings;
  convertWechatFootnotes: boolean;
  showImageCaptions: boolean;
  imageStrategy: 'keep-url' | 'embed-base64' | 'custom-host';
  previewMode: 'desktop' | 'mobile';
  syncScroll: boolean;
  appTheme: 'light' | 'dark' | 'auto';
}
