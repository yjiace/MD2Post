import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { PlatformType, ArticleItem, AppSettings } from './types';
import { PLATFORMS } from './platforms/platformConfig';
import { BUILT_IN_THEMES, generateThemeCss } from './themes/themeDefinitions';
import { BUILT_IN_CODE_THEMES } from './themes/codeThemes';
import {
  loadArticles,
  saveArticles,
  loadActiveArticleId,
  saveActiveArticleId,
  loadSettings,
  saveSettings,
  clearAllLocalData,
  DEFAULT_SETTINGS
} from './utils/storage';
import { preprocessMarkdown } from './parser/frontmatter';
import { renderMarkdownWithMath } from './parser/markdown';
import { syncEditorToPreview, syncPreviewToEditor } from './utils/scrollSync';
import { formatPangu } from './parser/pangu';
import { runPrecheck } from './utils/precheck';
import { transformToInlinedHtml } from './platforms/wechatInliner';
import { copyRichTextToClipboard, copyTextToClipboard } from './utils/clipboard';

import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { PlatformDock } from './components/PlatformDock';
import { PrecheckModal } from './components/PrecheckModal';
import { ArticlesModal } from './components/ArticlesModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // 1. Data States
  const [articles, setArticles] = useState<ArticleItem[]>(() => loadArticles());
  const [activeArticleId, setActiveArticleId] = useState<string>(() =>
    loadActiveArticleId(articles[0]?.id || 'default-sample')
  );

  // Active Article lookup
  const currentArticle = useMemo(() => {
    return articles.find(a => a.id === activeArticleId) || articles[0];
  }, [articles, activeArticleId]);

  // Primary reactive content state (guarantees 100% real-time reactivity for preview, precheck, and copy)
  const [rawContent, setRawContent] = useState<string>(() => {
    return currentArticle?.content || '';
  });

  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [currentPlatform, setCurrentPlatform] = useState<PlatformType>('wechat');
  const [copiedPlatform, setCopiedPlatform] = useState<PlatformType | null>(null);

  // 2. Modals
  const [isPrecheckOpen, setIsPrecheckOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 3. Refs for Scrolling & DOM Inspection
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef(false);

  // Keep activeArticleId aligned with existing articles
  useEffect(() => {
    if (currentArticle && currentArticle.id !== activeArticleId) {
      setActiveArticleId(currentArticle.id);
      saveActiveArticleId(currentArticle.id);
    }
  }, [currentArticle, activeArticleId]);

  // Content change handler: updates reactive rawContent instantly
  const handleContentChange = (newContent: string) => {
    setRawContent(newContent);
  };

  // Debounced auto-save rawContent back to articles & localStorage (non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => {
      setArticles(prev => {
        const targetId = activeArticleId;
        const updated = prev.map(art => {
          if (art.id === targetId) {
            const h1Match = rawContent.match(/^#[ \t]+(.*)$/m);
            const autoTitle = h1Match ? h1Match[1].replace(/^[0-9.]+\s*/, '').trim() : art.title;
            return {
              ...art,
              title: autoTitle || art.title,
              content: rawContent,
              updatedAt: Date.now()
            };
          }
          return art;
        });
        saveArticles(updated);
        return updated;
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [rawContent, activeArticleId]);

  // Sync scroll handlers using precise Markdown line landmarks
  const handleEditorScroll = () => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;
    if (editorTextareaRef.current && previewContainerRef.current) {
      syncEditorToPreview(editorTextareaRef.current, previewContainerRef.current);
    }
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  };

  const handlePreviewScroll = () => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;
    if (previewContainerRef.current && editorTextareaRef.current) {
      syncPreviewToEditor(previewContainerRef.current, editorTextareaRef.current);
    }
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  };

  // 4. Preprocessing and Parsing Pipeline
  const { cleanMarkdown } = useMemo(() => {
    return preprocessMarkdown(rawContent);
  }, [rawContent]);

  const renderedHtml = useMemo(() => {
    return renderMarkdownWithMath(cleanMarkdown, {
      codeSettings: settings.codeSettings,
      showImageCaptions: settings.showImageCaptions
    });
  }, [cleanMarkdown, settings.codeSettings, settings.showImageCaptions]);

  // Current Theme Config
  const activeTheme = useMemo(() => {
    return (
      BUILT_IN_THEMES.find(t => t.id === settings.activeThemeId) || BUILT_IN_THEMES[0]
    );
  }, [settings.activeThemeId]);

  // Dynamic Theme CSS string
  const dynamicThemeCss = useMemo(() => {
    return generateThemeCss(
      {
        ...activeTheme,
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight,
        paragraphSpacing: settings.paragraphSpacing,
        fontFamily: settings.fontFamily
      },
      settings.primaryColor,
      settings.customCss
    );
  }, [activeTheme, settings.fontSize, settings.lineHeight, settings.paragraphSpacing, settings.fontFamily, settings.primaryColor, settings.customCss]);

  // Dynamic Code Theme CSS string
  const activeCodeThemeCss = useMemo(() => {
    const codeTheme = BUILT_IN_CODE_THEMES.find(ct => ct.id === settings.codeSettings.themeId) || BUILT_IN_CODE_THEMES[0];
    return codeTheme.css;
  }, [settings.codeSettings.themeId]);

  // Run Pre-check diagnostics
  const diagnostics = useMemo(() => {
    return runPrecheck(rawContent, previewContainerRef.current);
  }, [rawContent]);

  // Save Settings when changed
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newPartial };
      saveSettings(updated);
      return updated;
    });
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  // Text Insertion Toolbar Action
  const handleInsertText = (before: string, after: string = '', defaultText: string = '') => {
    const ta = editorTextareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = rawContent.substring(start, end) || defaultText;
    const insertContent = `${before}${selected}${after}`;
    const newContent = rawContent.substring(0, start) + insertContent + rawContent.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  // Pangu Formatting Action (F1-6)
  const handleFormatPangu = () => {
    const formatted = formatPangu(rawContent);
    if (formatted !== rawContent) {
      handleContentChange(formatted);
    }
  };

  // File Import Action (US-A2)
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (content) {
        if (rawContent && rawContent.trim().length > 100) {
          if (!window.confirm('当前草稿有内容，导入新文档将覆盖当前文章，是否确认导入？')) {
            return;
          }
        }
        handleContentChange(content);
      }
    };
    reader.readAsText(file);
  };

  // Combined Platform Selection & 1-Click Direct Copy Action (guaranteed fresh content)
  const handlePlatformClickAndCopy = async (p: PlatformType) => {
    setCurrentPlatform(p);
    const targetMode = PLATFORMS[p].defaultCopyMode;

    try {
      if (targetMode === 'markdown') {
        // Ensure fresh clean markdown is copied and adapted for platforms like Juejin
        let freshCleanMarkdown = preprocessMarkdown(rawContent).cleanMarkdown || rawContent;
        
        // 1. Transform GitHub alert syntax [!TYPE] to standard Markdown blockquotes with icons
        freshCleanMarkdown = freshCleanMarkdown
          .replace(/^>\s*\[!NOTE\][ \t]*\n?/gmi, '> ℹ️ **注意**\n> ')
          .replace(/^>\s*\[!TIP\][ \t]*\n?/gmi, '> 💡 **提示**\n> ')
          .replace(/^>\s*\[!IMPORTANT\][ \t]*\n?/gmi, '> ❗️ **重点**\n> ')
          .replace(/^>\s*\[!WARNING\][ \t]*\n?/gmi, '> ⚠️ **警告**\n> ')
          .replace(/^>\s*\[!CAUTION\][ \t]*\n?/gmi, '> 🛑 **危险**\n> ');

        // 2. Transform flowchart LR/TD to graph LR/TD (Juejin's markdown parser only supports graph syntax)
        freshCleanMarkdown = freshCleanMarkdown.replace(/```mermaid\s*\n\s*flowchart\s+(LR|TD|RL|BT)/gi, '```mermaid\ngraph $1');

        await copyTextToClipboard(freshCleanMarkdown);
        setCopiedPlatform(p);
      } else {
        // Find rendered content or construct fresh off-screen element
        let domToCopy = (previewContainerRef.current?.querySelector('.md2post-rendered-content') ||
          document.querySelector('.md2post-rendered-content')) as HTMLElement;

        if (!domToCopy) {
          const freshHtml = renderMarkdownWithMath(preprocessMarkdown(rawContent).cleanMarkdown, {
            codeSettings: settings.codeSettings,
            showImageCaptions: settings.showImageCaptions
          });
          domToCopy = document.createElement('div');
          domToCopy.className = 'md2post-rendered-content';
          domToCopy.innerHTML = freshHtml;
        }

        const { inlinedHtml, plainText } = await transformToInlinedHtml(domToCopy, {
          theme: activeTheme,
          primaryColor: settings.primaryColor,
          codeThemeId: settings.codeSettings.themeId,
          convertFootnotes: settings.convertWechatFootnotes && (p === 'wechat' || PLATFORMS[p].convertLinksToFootnotes),
          platform: p
        });

        await copyRichTextToClipboard(inlinedHtml, plainText);
        setCopiedPlatform(p);
      }

      setTimeout(() => {
        setCopiedPlatform(prev => (prev === p ? null : prev));
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Back to top action for both editor and preview panes
  const handleScrollToTop = () => {
    if (editorTextareaRef.current) {
      editorTextareaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const desktopPane = document.querySelector('.preview-pane.mode-desktop');
    if (desktopPane) {
      desktopPane.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const mobileScreen = document.querySelector('.mobile-screen-scroll');
    if (mobileScreen) {
      mobileScreen.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Article Management Actions
  const handleSelectArticle = (id: string) => {
    const target = articles.find(a => a.id === id);
    if (target) {
      setActiveArticleId(id);
      saveActiveArticleId(id);
      setRawContent(target.content);
      setIsArticlesOpen(false);
    }
  };

  const handleCreateArticle = () => {
    const newArt: ArticleItem = {
      id: `art-${Date.now()}`,
      title: '新建技术博客文章',
      content: '# 新建技术博客文章\n\n> 📌 在此开始撰写您的精彩文章...\n\n',
      updatedAt: Date.now(),
      createdAt: Date.now()
    };
    const nextList = [newArt, ...articles];
    setArticles(nextList);
    saveArticles(nextList);
    setActiveArticleId(newArt.id);
    saveActiveArticleId(newArt.id);
    setRawContent(newArt.content);
    setIsArticlesOpen(false);
  };

  const handleRenameArticle = (id: string, newTitle: string) => {
    setArticles(prev => {
      const next = prev.map(a => (a.id === id ? { ...a, title: newTitle, updatedAt: Date.now() } : a));
      saveArticles(next);
      return next;
    });
  };

  const handleDeleteArticle = (id: string) => {
    const next = articles.filter(a => a.id !== id);
    setArticles(next);
    saveArticles(next);
    if (activeArticleId === id) {
      const fallback = next[0];
      if (fallback) {
        setActiveArticleId(fallback.id);
        saveActiveArticleId(fallback.id);
        setRawContent(fallback.content);
      }
    }
  };

  const handleClearAll = () => {
    clearAllLocalData();
    window.location.reload();
  };

  // Word Count & Read Time Calculation
  const charCount = rawContent.replace(/\s+/g, '').length;
  const readTimeMin = Math.max(1, Math.ceil(charCount / 400));

  return (
    <div className="app-container" style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
      {/* Dynamic Theme & Code Style Injections */}
      <style>{dynamicThemeCss}</style>
      <style>{activeCodeThemeCss}</style>

      {/* Top Navigation Header with Logo and Left-aligned Articles & Settings */}
      <Header
        primaryColor={settings.primaryColor}
        onOpenArticles={() => setIsArticlesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Editor & Formatting Toolbar with right-side utilities */}
      <Toolbar
        onInsertText={handleInsertText}
        onFormatPangu={handleFormatPangu}
        onImportFile={e => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
        }}
        previewMode={settings.previewMode}
        onTogglePreviewMode={() =>
          handleUpdateSettings({ previewMode: settings.previewMode === 'desktop' ? 'mobile' : 'desktop' })
        }
        charCount={charCount}
        readTimeMin={readTimeMin}
        currentThemeId={settings.activeThemeId}
        onThemeChange={id => {
          const selectedTheme = BUILT_IN_THEMES.find(t => t.id === id);
          handleUpdateSettings({
            activeThemeId: id,
            primaryColor: selectedTheme ? selectedTheme.primaryColor : settings.primaryColor
          });
        }}
        diagnostics={diagnostics}
        onOpenPrecheck={() => setIsPrecheckOpen(true)}
        primaryColor={settings.primaryColor}
      />

      {/* Split Workspace Layout with Right-side Vertical Platform Dock */}
      <main className="workspace-layout">
        <Editor
          editorRef={editorTextareaRef}
          value={rawContent}
          onChange={handleContentChange}
          onScroll={handleEditorScroll}
          onDropFile={handleImportFile}
        />

        {/* 右侧内容区域（内含预览视图与浮动的平台复制列表） */}
        <div className="preview-pane-container">
          <Preview
            htmlContent={renderedHtml}
            previewMode={settings.previewMode}
            primaryColor={settings.primaryColor}
            previewContainerRef={previewContainerRef}
            onScroll={handlePreviewScroll}
          />

          {/* 浮动在右侧内容区域的官方平台复制列表 */}
          <PlatformDock
            currentPlatform={currentPlatform}
            copiedPlatform={copiedPlatform}
            onPlatformClickAndCopy={handlePlatformClickAndCopy}
          />

          {/* 页面右下角回到顶部快捷悬浮按钮 */}
          <button
            className="back-to-top-btn"
            onClick={handleScrollToTop}
            title="回到顶部 (同时将编辑器与预览视图平滑滚动至首行)"
            aria-label="回到顶部"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </main>

      {/* Modals */}
      <PrecheckModal
        isOpen={isPrecheckOpen}
        onClose={() => setIsPrecheckOpen(false)}
        diagnostics={diagnostics}
        onLocateIssue={(snippet, line) => {
          const ta = editorTextareaRef.current;
          if (!ta) return;
          let targetIndex = -1;
          let targetLen = 0;

          if (line && line > 0) {
            const lines = rawContent.split('\n');
            let idx = 0;
            for (let i = 0; i < line - 1 && i < lines.length; i++) {
              idx += lines[i].length + 1;
            }
            targetIndex = idx;
            targetLen = lines[line - 1]?.length || 0;
          } else if (snippet) {
            const cleanSnippet = snippet.replace(/\.\.\.$/, '').trim();
            targetIndex = rawContent.indexOf(cleanSnippet);
            targetLen = cleanSnippet.length;
          }

          if (targetIndex >= 0) {
            ta.focus();
            ta.setSelectionRange(targetIndex, targetIndex + targetLen);

            const textBefore = rawContent.substring(0, targetIndex);
            const lineNum = textBefore.split('\n').length;
            const lineHeight = 21.6;
            const targetScrollTop = Math.max(0, (lineNum - 3) * lineHeight);
            ta.scrollTop = targetScrollTop;

            if (previewContainerRef.current) {
              const maxScroll = previewContainerRef.current.scrollHeight - previewContainerRef.current.clientHeight;
              const ratio = rawContent.length > 0 ? targetIndex / rawContent.length : 0;
              previewContainerRef.current.scrollTop = ratio * maxScroll;
            }
          }
        }}
      />

      <ArticlesModal
        isOpen={isArticlesOpen}
        onClose={() => setIsArticlesOpen(false)}
        articles={articles}
        activeId={activeArticleId}
        onSelectArticle={handleSelectArticle}
        onCreateArticle={handleCreateArticle}
        onRenameArticle={handleRenameArticle}
        onDeleteArticle={handleDeleteArticle}
        onClearAll={handleClearAll}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />
    </div>
  );
};
export default App;
