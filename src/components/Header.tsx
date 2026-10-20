import React from 'react';

interface HeaderProps {
  primaryColor?: string;
  onOpenArticles: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenArticles,
  onOpenSettings
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Brand */}
        <div className="app-brand" onClick={onOpenArticles} title="MD2Post - 点击管理文章草稿">
          <img src="/favicon.svg" alt="MD2Post Logo" className="brand-logo-img" />
          <span className="brand-title">MD2Post</span>
        </div>

        <span className="tool-sep" />

        {/* 1. 文章 (Articles) 移动到左侧logo右侧 */}
        <button className="icon-action-btn" onClick={onOpenArticles} title="本地草稿文章管理">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="btn-text">文章</span>
        </button>

        {/* 2. 设置 (Settings) 移动到左侧logo右侧 */}
        <button className="icon-action-btn" onClick={onOpenSettings} title="排版与高亮外观配置">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="btn-text">设置</span>
        </button>
      </div>

      <div className="header-right">
        {/* <span className="header-tagline">跨平台 Markdown 排版工具</span> */}
      </div>
    </header>
  );
};
