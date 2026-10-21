import React from 'react';

interface PlatformDockProps {
  onCopyWechat: () => void;
  onCopyZhihu: () => void;
  onCopyJuejin: () => void;
  onCopyToutiao: () => void;
  copiedAction: string | null;
}

export const PlatformDock: React.FC<PlatformDockProps> = ({
  onCopyWechat,
  onCopyZhihu,
  onCopyJuejin,
  onCopyToutiao,
  copiedAction
}) => {
  return (
    <aside className="nice-sidebar" aria-label="快捷复制工具栏">
      {/* 1. 复制到微信公众号 */}
      <div className="nice-dock-item">
        <button
          id="nice-sidebar-wechat"
          className="nice-btn nice-btn-wechat"
          onClick={onCopyWechat}
          title="复制到公众号"
          aria-label="复制到公众号"
        >
          <svg className="nice-btn-wechat-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#07C060" d="M38.7,15.3c-3.7-4.9-10.2-6.2-16.1-4.1c0.2,0.1,0.4,0.1,0.6,0.2c8.7,2.9,13.3,12.3,10.4,21 c-0.8,2.3-2,4.3-3.5,6c1.9-0.5,3.8-1.3,5.4-2.5C42.1,30.8,43.4,21.4,38.7,15.3z" />
            <path fill="#07C060" d="M17,10.4L17,10.4C17,10.4,17,10.4,17,10.4c0.4-0.3,0.7-0.5,1.1-0.8c0,0,0,0,0.1,0c0.4-0.2,0.8-0.4,1.1-0.7 c0,0,0.1,0,0.1-0.1c0.8-0.4,1.6-0.7,2.4-1c0.1,0,0.1,0,0.2-0.1c0.4-0.1,0.8-0.3,1.2-0.4c0,0,0.1,0,0.1,0c0.4-0.1,0.8-0.2,1.2-0.2 c0.1,0,0.1,0,0.2,0C25.3,7,25.7,7,26.1,7c0.1,0,0.2,0,0.3,0c0.4,0,0.9-0.1,1.3-0.1c0.5,0,1,0,1.5,0.1c0.1,0,0.1,0,0.2,0 c0.5,0,0.9,0.1,1.4,0.2c0.1,0,0.2,0,0.2,0c0.5,0.1,0.9,0.2,1.3,0.3c0.1,0,0.1,0,0.2,0.1C33,7.7,33.5,7.8,33.9,8 c-0.2-0.4-0.4-0.7-0.4-0.7C30.6,2.7,25.8,0,20.6,0c-3.1,0-7.9,1.1-11.5,5.4c-2.4,2.9-3.2,6.3-2.7,9.7c0.3,2.3,1.6,5.4,3.5,7.3 C10.6,17.5,13.2,13.2,17,10.4z" />
            <path fill="#07C060" d="M20.6,30.9c-1.3,0-2.6-0.2-3.8-0.4c-0.1,0-0.3,0-0.5,0c-0.4,0-0.7,0.1-1,0.3l-4,2.6 c-0.1,0.1-0.2,0.1-0.4,0.1c-0.3,0-0.6-0.3-0.7-0.6c0-0.2,0-0.3,0.1-0.5c0-0.1,0.4-2,0.7-3.2c0-0.1,0.1-0.3,0-0.4 c0-0.4-0.2-0.8-0.6-1c-4.3-2.9-7.2-7.5-7.8-12.2c-1.1,1.7-1.6,3-2.2,5c-2.1,7.3,2.5,16,9.9,18.4c8.6,2.8,16.7-0.3,19.5-7.6 c0.3-0.9,0.7-2.4,0.8-3.6C27.7,29.9,24.6,30.9,20.6,30.9z" />
          </svg>
          {copiedAction === 'wechat' && <span className="dock-check-badge">✓</span>}
        </button>
        <span className="dock-tooltip">复制到公众号</span>
      </div>

      {/* 2. 复制到知乎 */}
      <div className="nice-dock-item">
        <button
          id="nice-sidebar-zhihu"
          className="nice-btn nice-btn-zhihu"
          onClick={onCopyZhihu}
          title="复制到知乎"
          aria-label="复制到知乎"
        >
          <svg className="nice-btn-zhihu-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="#1296db" d="M564.7 230.1V803h60l25.2 71.4L756.3 803h131.5V230.1H564.7z m247.7 497h-59.9l-75.1 50.4-17.8-50.4h-18V308.3h170.7v418.8zM526.1 486.9H393.3c2.1-44.9 4.3-104.3 6.6-172.9h130.9l-0.1-8.1c0-0.6-0.2-14.7-2.3-29.1-2.1-15-6.6-34.9-21-34.9H287.8c4.4-20.6 15.7-69.7 29.4-93.8l6.4-11.2-12.9-0.7c-0.8 0-19.6-0.9-41.4 10.6-35.7 19-51.7 56.4-58.7 84.4-18.4 73.1-44.6 123.9-55.7 145.6-3.3 6.4-5.3 10.2-6.2 12.8-1.8 4.9-0.8 9.8 2.8 13 10.5 9.5 38.2-2.9 38.5-3 0.6-0.3 1.3-0.6 2.2-1 13.9-6.3 55.1-25 69.8-84.5h56.7c0.7 32.2 3.1 138.4 2.9 172.9h-141l-2.1 1.5c-23.1 16.9-30.5 63.2-30.8 65.2l-1.4 9.2h167c-12.3 78.3-26.5 113.4-34 127.4-3.7 7-7.3 14-10.7 20.8-21.3 42.2-43.4 85.8-126.3 153.6-3.6 2.8-7 8-4.8 13.7 2.4 6.3 9.3 9.1 24.6 9.1 5.4 0 11.8-0.3 19.4-1 49.9-4.4 100.8-18 135.1-87.6 17-35.1 31.7-71.7 43.9-108.9L497 850l5-12c0.8-1.9 19-46.3 5.1-95.9l-0.5-1.8-108.1-123-22 16.6c6.4-26.1 10.6-49.9 12.5-71.1h158.7v-8c0-40.1-18.5-63.9-19.2-64.9l-2.4-3z" />
          </svg>
          {copiedAction === 'zhihu' && <span className="dock-check-badge">✓</span>}
        </button>
        <span className="dock-tooltip">复制到知乎</span>
      </div>

      {/* 3. 复制到稀土掘金 */}
      <div className="nice-dock-item">
        <button
          id="nice-sidebar-juejin"
          className="nice-btn nice-btn-juejin"
          onClick={onCopyJuejin}
          title="复制到稀土掘金"
          aria-label="复制到稀土掘金"
        >
          <svg className="nice-btn-juejin-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="#006cff" d="M729.64116345 165.27693991L634.32650881 90.125l-99.5625 78.52693991-5.17887981 4.16056009 104.74137981 83.50215546 105.09051682-83.50215546-9.77586218-7.53556009z m361.21228445 291.47198236l-456.78879245 360.19396555-456.49784537-359.99030128L110.125 511.12715547l523.93965546 413.11745671 524.23060335-413.35021555-67.44181091-54.14547436z m-456.78879245 29.21120673L385.4784479 290.00646554 318.06573237 344.12284454l315.96982771 249.16810336 316.28987101-249.40086136-67.41271555-54.14547436-248.84806008 196.21551682z" />
          </svg>
          {copiedAction === 'juejin' && <span className="dock-check-badge">✓</span>}
        </button>
        <span className="dock-tooltip">复制到稀土掘金</span>
      </div>

      {/* 4. 复制到今日头条 */}
      <div className="nice-dock-item">
        <button
          id="nice-sidebar-toutiao"
          className="nice-btn nice-btn-toutiao"
          onClick={onCopyToutiao}
          title="复制到今日头条"
          aria-label="复制到今日头条"
        >
          <svg className="nice-btn-toutiao-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="1024" rx="200" fill="#f85959" />
            <path fill="#ffffff" d="M220 270h584c20 0 36 16 36 36v64c0 20-16 36-36 36H220c-20 0-36-16-36-36v-64c0-20 16-36 36-36z" />
            <path fill="#ffffff" d="M220 460h370c20 0 36 16 36 36v64c0 20-16 36-36 36H220c-20 0-36-16-36-36v-64c0-20 16-36 36-36z" />
            <path fill="#ffffff" d="M220 650h480c20 0 36 16 36 36v64c0 20-16 36-36 36H220c-20 0-36-16-36-36v-64c0-20 16-36 36-36z" />
            <circle cx="740" cy="530" r="58" fill="#ffffff" />
          </svg>
          {copiedAction === 'toutiao' && <span className="dock-check-badge">✓</span>}
        </button>
        <span className="dock-tooltip">复制到今日头条</span>
      </div>
    </aside>
  );
};
