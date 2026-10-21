import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { ArticleItem, AppSettings } from './types';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2500);
  };

  useEffect(() => {
    (window as any).__showToast = showToast;
  }, []);

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

  // 1. 复制到微信公众号 (Rich Text with Inlined Weiyan CSS)
  const handleCopyWechat = async () => {
    try {
      setCopiedAction('wechat');

      let domToCopy = (previewContainerRef.current?.querySelector('#nice') ||
        previewContainerRef.current?.querySelector('.md2post-rendered-content') ||
        document.querySelector('#nice')) as HTMLElement;

      if (!domToCopy) {
        const freshHtml = renderMarkdownWithMath(preprocessMarkdown(rawContent).cleanMarkdown, {
          codeSettings: settings.codeSettings,
          showImageCaptions: settings.showImageCaptions
        });
        domToCopy = document.createElement('div');
        domToCopy.id = 'nice';
        domToCopy.innerHTML = freshHtml;
      }

      const { inlinedHtml, plainText } = await transformToInlinedHtml(domToCopy, {
        theme: activeTheme,
        primaryColor: settings.primaryColor,
        codeThemeId: settings.codeSettings.themeId,
        convertFootnotes: settings.convertWechatFootnotes,
        platform: 'wechat'
      });

      await copyRichTextToClipboard(inlinedHtml, plainText);
      showToast('已复制，请到微信公众平台粘贴');
    } catch (err) {
      console.error('WeChat copy failed:', err);
      showToast('复制失败，请重试');
    } finally {
      setTimeout(() => {
        setCopiedAction(prev => (prev === 'wechat' ? null : prev));
      }, 1500);
    }
  };

  // 知乎专用 Markdown 适配器：彻底解决知乎 Markdown 解析器的引用换行断裂和列表脱离引用块的缺陷
  const adaptMarkdownForZhihu = (markdown: string): string => {
    const lines = markdown.split(/\r?\n/);
    const result: string[] = [];
    let inBq = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const isBqLine = /^[ \t]*>/.test(line);

      if (isBqLine) {
        inBq = true;
        const bqMatch = line.match(/^([ \t]*>[ \t]*)(.*)$/);
        const prefix = bqMatch ? bqMatch[1] : '> ';
        const content = bqMatch ? bqMatch[2] : '';

        // 1. 转换 GitHub Alert 语法（[!TIP] 等）为知乎兼容的高亮块标题
        const alertMatch = content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(.*)$/i);
        if (alertMatch) {
          const type = alertMatch[1].toUpperCase();
          let badge = 'ℹ️ **注意**';
          if (type === 'TIP') badge = '💡 **提示**';
          else if (type === 'IMPORTANT') badge = '📌 **重点**';
          else if (type === 'WARNING') badge = '⚠️ **警告**';
          else if (type === 'CAUTION') badge = '🚨 **危险**';

          const rawRest = (alertMatch[2] || '').trim().replace(/^[：:\s]+/, '').replace(/[:：]+$/, '');
          if (rawRest) {
            line = `${prefix}${badge}：${rawRest}`;
          } else {
            line = `${prefix}${badge}`;
          }
        } else {
          // 2. 避免列表被知乎 Draft.js 强行踢出引用块：
          // 知乎的块模型中引用块和有序/无序列表互斥，遇到 `> 1. ` 会直接终结引用块。
          // 将其平滑转换为 `> 1、` 和 `> • `，确保 100% 留在引用块内！
          const listMatch = content.match(/^(\d+)\.[ \t]+(.*)$/);
          const bulletMatch = content.match(/^[-*][ \t]+(.*)$/);
          if (listMatch) {
            line = `${prefix}${listMatch[1]}、${listMatch[2]}`;
          } else if (bulletMatch) {
            line = `${prefix}• ${bulletMatch[1]}`;
          }
        }
      } else {
        if (!line.trim()) {
          inBq = false;
        }
      }

      // 3. 保护引用块内部连续换行（解决附件1中核心论文与适合人群被合并到同一行的问题）：
      // 在标准 CommonMark 中未带两个空格的换行为软换行，知乎会将其拼接为一行。
      // 若当前行属于引用且下一行是引用条目（如 `> 📌`、`> •`、`> \d+、` 等），当前行末尾追加 2 个空格强制硬换行！
      if (inBq && line.trim()) {
        const nextLine = lines[i + 1];
        if (nextLine !== undefined) {
          const isNextNewItem = /^[ \t]*>[ \t]*(📌|•|\d+、|[💡ℹ️⚠️📌🚨]|[*_]{2}|-|\d+\.)/.test(nextLine);
          if (isNextNewItem && !line.endsWith('  ')) {
            line = line + '  ';
          }
        }
      }

      result.push(line);
    }

    return result.join('\n');
  };

  // 2. 复制到知乎 (Zhihu-tailored Clean Rich Text + Original Plain Markdown Dual-Channel)
  const handleCopyZhihu = async () => {
    try {
      setCopiedAction('zhihu');

      let domToCopy = (previewContainerRef.current?.querySelector('#nice') ||
        previewContainerRef.current?.querySelector('.md2post-rendered-content') ||
        document.querySelector('#nice')) as HTMLElement;

      if (!domToCopy) {
        const freshHtml = renderMarkdownWithMath(preprocessMarkdown(rawContent).cleanMarkdown, {
          codeSettings: settings.codeSettings,
          showImageCaptions: settings.showImageCaptions
        });
        domToCopy = document.createElement('div');
        domToCopy.id = 'nice';
        domToCopy.innerHTML = freshHtml;
      }

      const { inlinedHtml } = await transformToInlinedHtml(domToCopy, {
        theme: activeTheme,
        primaryColor: settings.primaryColor,
        codeThemeId: settings.codeSettings.themeId,
        convertFootnotes: false,
        platform: 'zhihu'
      });

      const rawClean = preprocessMarkdown(rawContent).cleanMarkdown || rawContent;
      const freshCleanMarkdown = adaptMarkdownForZhihu(rawClean);

      await copyRichTextToClipboard(inlinedHtml, freshCleanMarkdown);

      const hasMermaid = /```mermaid/i.test(rawContent);
      if (hasMermaid) {
        showToast('已复制知乎格式！文中含流程图，可在右侧预览区点击流程图【复制图片】在知乎直接粘贴');
      } else {
        showToast('已复制知乎格式，请直接粘贴到知乎专栏/回答');
      }
    } catch (err) {
      console.error('Zhihu copy failed:', err);
      showToast('复制失败，请重试');
    } finally {
      setTimeout(() => {
        setCopiedAction(prev => (prev === 'zhihu' ? null : prev));
      }, 1500);
    }
  };

  // 3. 复制到稀土掘金 (Markdown adapted for Juejin parser)
  const handleCopyJuejin = async () => {
    try {
      setCopiedAction('juejin');

      let freshCleanMarkdown = preprocessMarkdown(rawContent).cleanMarkdown || rawContent;

      // 1. Adapt GitHub Alert / Callout boxes without extra '>' or nested quotes (Fix Issue 2)
      freshCleanMarkdown = freshCleanMarkdown.replace(
        /^([ \t]*>[ \t]*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(.*)$/gmi,
        (_match, prefix, type, rest) => {
          const t = type.toUpperCase();
          let badge = 'ℹ️ **注意**';
          if (t === 'TIP') badge = '💡 **提示**';
          else if (t === 'IMPORTANT') badge = '❗️ **重点**';
          else if (t === 'WARNING') badge = '⚠️ **警告**';
          else if (t === 'CAUTION') badge = '🛑 **危险**';

          const cleanRest = (rest || '').trim();
          if (cleanRest) {
            return `${prefix}${badge}\n${prefix}${cleanRest}`;
          }
          return `${prefix}${badge}`;
        }
      );

      // 2. Mermaid & Document Content Integrity:
      // Preserves original Markdown code blocks exactly as authored.
      // Do NOT inject invalid external URLs or massive base64 strings into markdown text
      // to avoid Juejin ByteMD editor's "超过最大字符数限制" and "图片地址解析失败" errors.

      await copyTextToClipboard(freshCleanMarkdown);
      showToast('已复制，请到稀土掘金粘贴');
    } catch (err) {
      console.error('Juejin copy failed:', err);
      showToast('复制失败，请重试');
    } finally {
      setTimeout(() => {
        setCopiedAction(prev => (prev === 'juejin' ? null : prev));
      }, 1500);
    }
  };

  // 4. 复制到今日头条 (Rich Text with Inlined CSS & Native Tables)
  const handleCopyToutiao = async () => {
    try {
      setCopiedAction('toutiao');

      let domToCopy = (previewContainerRef.current?.querySelector('#nice') ||
        previewContainerRef.current?.querySelector('.md2post-rendered-content') ||
        document.querySelector('#nice')) as HTMLElement;

      if (!domToCopy) {
        const freshHtml = renderMarkdownWithMath(preprocessMarkdown(rawContent).cleanMarkdown, {
          codeSettings: settings.codeSettings,
          showImageCaptions: settings.showImageCaptions
        });
        domToCopy = document.createElement('div');
        domToCopy.id = 'nice';
        domToCopy.innerHTML = freshHtml;
      }

      const { inlinedHtml, plainText } = await transformToInlinedHtml(domToCopy, {
        theme: activeTheme,
        primaryColor: settings.primaryColor,
        codeThemeId: settings.codeSettings.themeId,
        convertFootnotes: false,
        platform: 'toutiao'
      });

      await copyRichTextToClipboard(inlinedHtml, plainText);
      showToast('已复制，请到今日头条创作平台粘贴');
    } catch (err) {
      console.error('Toutiao copy failed:', err);
      showToast('复制失败，请重试');
    } finally {
      setTimeout(() => {
        setCopiedAction(prev => (prev === 'toutiao' ? null : prev));
      }, 1500);
    }
  };

  // 4. 切换预览模式 (桌面 / 手机)
  const handleTogglePreviewMode = () => {
    const nextMode = settings.previewMode === 'mobile' ? 'desktop' : 'mobile';
    handleUpdateSettings({ previewMode: nextMode });
    showToast(nextMode === 'mobile' ? '已切换为移动端 375px 预览视口' : '已切换为桌面宽屏视图');
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
        onTogglePreviewMode={handleTogglePreviewMode}
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
            onCopyWechat={handleCopyWechat}
            onCopyZhihu={handleCopyZhihu}
            onCopyJuejin={handleCopyJuejin}
            onCopyToutiao={handleCopyToutiao}
            copiedAction={copiedAction}
          />

          {/* 顶部操作反馈 Toast 浮层 */}
          {toastMessage && (
            <div className="md2post-toast" role="alert">
              <span className="toast-icon">✓</span>
              <span className="toast-text">{toastMessage}</span>
            </div>
          )}

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
