import React from 'react';
import type { PlatformType } from '../types';
import { PLATFORMS } from '../platforms/platformConfig';

interface PlatformDockProps {
  currentPlatform: PlatformType;
  copiedPlatform: PlatformType | null;
  onPlatformClickAndCopy: (platform: PlatformType) => void;
}

// 仅保留 4 个平台：微信公众号、知乎、掘金、今日头条
const DISPLAY_PLATFORMS: PlatformType[] = ['wechat', 'zhihu', 'juejin', 'toutiao'];

// 官方高精度矢量图标（严格还原参考附件）
const OFFICIAL_PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  // 微信公众号：官方经典绿色三旋叶气泡标
  wechat: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 2.247.74 4.32 1.99 6L2.6 21.4a.75.75 0 0 0 .93.93l3.4-1.38A9.95 9.95 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 0 1 5.86 10.82l-2.02-1.17A4.67 4.67 0 0 0 12 7.33v-2.33zm-7 7c0-1.58.52-3.04 1.41-4.22l2.02 1.17A4.67 4.67 0 0 0 12 16.67v2.33A7 7 0 0 1 5 12zm7 7v-2.33a4.67 4.67 0 0 0 3.73-1.87l2.02 1.17A7 7 0 0 1 12 19z"
        fill="#07c160"
      />
    </svg>
  ),

  // 知乎：官方知乎蓝“知”字标
  zhihu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0084ff">
      <path d="M5.38 3.5h3.2v2.13H6.77c-.07.8-.19 1.83-.41 3.03h2.32v2.13H6.18c-.46 1.84-1.28 3.6-2.43 5.07l-1.6-1.5c.95-1.15 1.6-2.52 1.95-3.87H2.5V8.36h1.96c.21-1.07.33-2.12.38-3.03H2.5V3.5h2.88zm5.54 0h9.08v16.74h-2.14v-2.07h-4.8v2.07H10.92V3.5zm2.14 2.13v3.42h4.8V5.63h-4.8zm0 5.4v3.54h4.8v-3.54h-4.8z" />
    </svg>
  ),

  // 掘金：官方蓝色折角菱形叠标
  juejin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1e80ff">
      {/* 顶部菱形点 */}
      <path d="M12 4.5l2 1.6-2 1.6-2-1.6 2-1.6z"/>
      {/* 中部向下折角 */}
      <path d="M6.6 10.2L12 14.6l5.4-4.4-1.4-1.1-4 3.3-4-3.3-1.4 1.1z"/>
      {/* 底部宽向下折角 */}
      <path d="M3.2 14.8L12 22l8.8-7.2-1.4-1.1-7.4 6-7.4-6-1.4 1.1z"/>
    </svg>
  ),

  // 今日头条：官方头条红媒体徽标
  toutiao: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#f04142"/>
      <path d="M5.5 7.5h13v2.2h-13zm0 3.6h8.5v2.2h-8.5zm0 3.6h11v2.2h-11z" fill="#ffffff"/>
      <circle cx="16.5" cy="12.3" r="1.4" fill="#ffffff"/>
    </svg>
  ),

  // 通用（兜底）
  universal: null
};

export const PlatformDock: React.FC<PlatformDockProps> = ({
  currentPlatform,
  copiedPlatform,
  onPlatformClickAndCopy
}) => {
  return (
    <aside className="platform-floating-dock" aria-label="浮动平台快速复制发布菜单">
      <div className="dock-button-list">
        {DISPLAY_PLATFORMS.map(key => {
          const p = PLATFORMS[key];
          const isActive = currentPlatform === key;
          const isCopied = copiedPlatform === key;

          return (
            <button
              key={key}
              className={`floating-dock-btn ${isActive ? 'active' : ''} ${isCopied ? 'copied' : ''}`}
              onClick={() => onPlatformClickAndCopy(key)}
              title={`点击一键复制适配【${p.name}】的排版代码`}
              aria-label={`复制到${p.name}`}
            >
              <div className="btn-icon-wrap">
                {OFFICIAL_PLATFORM_ICONS[key]}
              </div>

              {isCopied && (
                <div className="copied-overlay">
                  <span className="check-icon">✓</span>
                </div>
              )}

              {/* 悬停左侧气泡提示 */}
              <div className="dock-flyout-tooltip">
                <span className="tooltip-name">{p.name}</span>
                <span className="tooltip-mode">
                  {p.defaultCopyMode === 'markdown' ? '一键复制 Markdown' : '一键复制富文本'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
