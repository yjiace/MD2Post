import type { AppSettings, ArticleItem } from '../types';
import { SAMPLE_TECHNICAL_POST } from './sampleDocument';

const STORAGE_KEYS = {
  ARTICLES: 'md2post_articles_v1',
  ACTIVE_ARTICLE_ID: 'md2post_active_article_id_v1',
  SETTINGS: 'md2post_settings_v1'
};

export const DEFAULT_SETTINGS: AppSettings = {
  activeThemeId: 'classic-tech',
  primaryColor: '#0969da',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  fontSize: 16,
  lineHeight: 1.75,
  paragraphSpacing: 16,
  customCss: '',
  codeSettings: {
    showMacButtons: true,
    showLineNumbers: true,
    showLanguageBadge: true,
    wrapLines: false,
    themeId: 'one-dark'
  },
  convertWechatFootnotes: true,
  showImageCaptions: true,
  imageStrategy: 'keep-url',
  previewMode: 'desktop',
  syncScroll: true,
  appTheme: 'light'
};

export function loadArticles(): ArticleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: ArticleItem) => {
          let c = item.content || '';
          if (c.includes('\x0c') || c.includes('\x08') || (item.id === 'default-sample' && c.includes('TPS_{max} = '))) {
            c = c.replace(/\x0c/g, '\\f').replace(/\x08/g, '\\b');
            if (item.id === 'default-sample') {
              c = SAMPLE_TECHNICAL_POST;
            }
            return { ...item, content: c };
          }
          return item;
        });
      }
    }
  } catch (e) {
    console.error('Failed to load articles from storage:', e);
  }

  // Initial default article
  const initialArticle: ArticleItem = {
    id: 'default-sample',
    title: '微服务高并发架构演进与分布式事务实践指南',
    content: SAMPLE_TECHNICAL_POST,
    updatedAt: Date.now(),
    createdAt: Date.now()
  };
  saveArticles([initialArticle]);
  return [initialArticle];
}

export function saveArticles(articles: ArticleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed to save articles to storage:', e);
  }
}

export function loadActiveArticleId(fallbackId: string): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ARTICLE_ID) || fallbackId;
  } catch {
    return fallbackId;
  }
}

export function saveActiveArticleId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ARTICLE_ID, id);
  } catch (e) {
    console.error('Failed to save active article id:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        syncScroll: parsed.syncScroll !== undefined ? parsed.syncScroll : true
      };
    }
  } catch (e) {
    console.error('Failed to load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ARTICLE_ID);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (e) {
    console.error('Failed to clear local data:', e);
  }
}
