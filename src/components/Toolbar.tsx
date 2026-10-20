import React from 'react';
import type { DiagnosticItem } from '../types';
import { BUILT_IN_THEMES } from '../themes/themeDefinitions';

interface ToolbarProps {
  onInsertText: (before: string, after?: string, defaultText?: string) => void;
  onFormatPangu: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewMode: 'desktop' | 'mobile';
  onTogglePreviewMode: () => void;
  charCount: number;
  readTimeMin: number;
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  diagnostics: DiagnosticItem[];
  onOpenPrecheck: () => void;
  primaryColor: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onInsertText,
  onFormatPangu,
  onImportFile,
  previewMode,
  onTogglePreviewMode,
  charCount,
  readTimeMin,
  currentThemeId,
  onThemeChange,
  diagnostics,
  onOpenPrecheck,
  primaryColor
}) => {
  const errorCount = diagnostics.filter(d => d.type === 'error').length;
  const warningCount = diagnostics.filter(d => d.type === 'warning').length;

  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        {/* File Import */}
        <label className="tool-btn file-upload-label" title="导入本地 Markdown 文件 (.md)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <input
            type="file"
            accept=".md,.markdown,text/markdown"
            onChange={onImportFile}
            style={{ display: 'none' }}
          />
        </label>

        <span className="tool-sep" />

        {/* Headings */}
        <button
          className="tool-btn"
          onClick={() => onInsertText('# ', '', '一级标题')}
          title="一级标题 H1"
        >
          H1
        </button>
        <button
          className="tool-btn"
          onClick={() => onInsertText('## ', '', '二级标题')}
          title="二级标题 H2"
        >
          H2
        </button>
        <button
          className="tool-btn"
          onClick={() => onInsertText('### ', '', '三级标题')}
          title="三级标题 H3"
        >
          H3
        </button>

        <span className="tool-sep" />

        {/* Basic Inlines */}
        <button
          className="tool-btn"
          onClick={() => onInsertText('**', '**', '加粗文本')}
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          className="tool-btn"
          onClick={() => onInsertText('*', '*', '斜体文本')}
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          className="tool-btn"
          onClick={() => onInsertText('`', '`', 'code')}
          title="行内代码"
        >
          &lt;/&gt;
        </button>

        <span className="tool-sep" />

        {/* Blocks */}
        <button
          className="tool-btn"
          onClick={() => onInsertText('> ', '', '引用内容')}
          title="引用块"
        >
          ”
        </button>


        {/* Code Block */}
        <button
          className="tool-btn"
          onClick={() => onInsertText('```java\n', '\n```', '// 在此输入代码')}
          title="插入带语言的高亮代码块"
        >
          代码块
        </button>

        {/* Table */}
        <button
          className="tool-btn"
          onClick={() =>
            onInsertText(
              '| 列 1 | 列 2 | 列 3 |\n| :--- | :---: | ---: |\n| 文本 | 居中 | 右对齐 |\n'
            )
          }
          title="插入自适应表格"
        >
          表格
        </button>

        {/* KaTeX Math */}
        <button
          className="tool-btn"
          onClick={() => onInsertText('$$\n', '\n$$', 'E = mc^2')}
          title="插入 LaTeX 数学公式"
        >
          ∑ 公式
        </button>

        {/* Pangu Format */}
        <button
          className="tool-btn highlight-tool"
          onClick={onFormatPangu}
          title="一键盘古排版：中英文/数字间自动加空格，纠正全半角标点"
        >
          ✨ 排版
        </button>
      </div>

      <div className="toolbar-right">
        {/* Theme Selector */}
        <div className="theme-selector-wrap" title="选择排版主题">
          <span className="theme-color-indicator" style={{ backgroundColor: primaryColor }} />
          <select
            className="theme-select"
            value={currentThemeId}
            onChange={e => onThemeChange(e.target.value)}
          >
            {BUILT_IN_THEMES.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <span className="tool-sep" />

        {/* Mobile / Desktop Toggle */}
        <button
          className={`tool-btn ${previewMode === 'mobile' ? 'active' : ''}`}
          onClick={onTogglePreviewMode}
          title={previewMode === 'mobile' ? '切换为桌面端宽度' : '切换为 375px 手机端模拟视口'}
        >
          {previewMode === 'mobile' ? '📱 手机' : '💻 桌面'}
        </button>

        <span className="tool-sep" />

        {/* Pre-check button */}
        <button
          className={`tool-btn precheck-btn ${errorCount > 0 ? 'has-errors' : warningCount > 0 ? 'has-warnings' : ''}`}
          onClick={onOpenPrecheck}
          title={
            errorCount > 0
              ? `预检报告：发现 ${errorCount} 处错误，点击查看`
              : warningCount > 0
              ? `预检报告：发现 ${warningCount} 项提醒，点击查看`
              : '预检通过：点击查看报告'
          }
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <span>预检</span>
          {errorCount + warningCount > 0 && (
            <span className="badge-count">{errorCount + warningCount}</span>
          )}
        </button>

        <span className="tool-sep" />

        {/* Word count & Reading time */}
        <div className="stats-chip" title={`字数：${charCount} 字符，预计阅读时长：${readTimeMin} 分钟`}>
          <span>{charCount}字</span>
          <span className="chip-dot">·</span>
          <span>{readTimeMin}m</span>
        </div>
      </div>
    </div>
  );
};
