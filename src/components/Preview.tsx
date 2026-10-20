import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { svgToPngDataUrl } from '../utils/svgRasterizer';

interface PreviewProps {
  htmlContent: string;
  previewMode: 'desktop' | 'mobile';
  primaryColor: string;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll?: (ratio: number) => void;
  onImageError?: (src: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  htmlContent,
  previewMode,
  primaryColor,
  previewContainerRef,
  onScroll,
  onImageError
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid configuration once
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        flowchart: {
          htmlLabels: false, // Critical: generate pure SVG <text> instead of <foreignObject> so canvas rasterization succeeds
          useMaxWidth: false
        },
        sequence: {
          useMaxWidth: false
        },
        themeVariables: {
          primaryColor: primaryColor,
          primaryTextColor: '#1f2937',
          primaryBorderColor: primaryColor,
          lineColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#ffffff'
        }
      });
    } catch (e) {
      console.warn('Mermaid initialize warning:', e);
    }
  }, [primaryColor]);

  // Global image error handler setup
  useEffect(() => {
    (window as any).__handleImgError = (img: HTMLImageElement) => {
      img.setAttribute('data-failed', 'true');
      img.classList.add('img-error');
      const errBadge = document.createElement('div');
      errBadge.className = 'img-error-badge';
      errBadge.innerHTML = `⚠️ 图片加载失败: <code>${img.src}</code>`;
      img.parentNode?.insertBefore(errBadge, img.nextSibling);
      if (onImageError) {
        onImageError(img.src);
      }
    };
  }, [onImageError]);

  // Render Mermaid diagrams directly to crisp vector SVG
  useEffect(() => {
    if (!contentRef.current) return;

    const mermaidBlocks = contentRef.current.querySelectorAll<HTMLElement>('.md2post-mermaid');
    mermaidBlocks.forEach((block, idx) => {
      const codeAttr = block.getAttribute('data-code');
      if (!codeAttr) return;

      const rawCode = decodeURIComponent(codeAttr).trim();
      const uniqueId = `mermaid_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;

      mermaid
        .render(uniqueId, rawCode)
        .then(async ({ svg }) => {
          const pngDataUrl = await svgToPngDataUrl(svg);
          block.setAttribute('data-rendered', 'true');
          block.innerHTML = `
            <div class="mermaid-diagram-wrap" data-png-url="${pngDataUrl || ''}">
              <div class="diagram-toolbar">
                <span class="diagram-label">Mermaid 流程图</span>
                <button class="diagram-export-btn" onclick="window.__downloadMermaidSvg && window.__downloadMermaidSvg('${uniqueId}')" title="下载高清 SVG 矢量图">
                  下载 SVG
                </button>
              </div>
              <div class="diagram-svg-container" id="${uniqueId}-container">
                ${svg}
              </div>
              ${pngDataUrl ? `<img class="mermaid-img" src="${pngDataUrl}" alt="流程图" style="display:none;" />` : ''}
            </div>
          `;
        })
        .catch(err => {
          console.warn('Mermaid render error for chart', idx, err);
          block.innerHTML = `
            <div class="md2post-mermaid-error">
              <div class="err-header">⚠️ Mermaid 图表语法解析错误</div>
              <div class="err-desc">${escapeHtml(err?.message || '图表语法存在格式错误')}</div>
              <pre class="err-code"><code>${escapeHtml(rawCode)}</code></pre>
            </div>
          `;
        });
    });

    // Provide global svg download function
    (window as any).__downloadMermaidSvg = (id: string) => {
      const container = document.getElementById(`${id}-container`);
      const svgEl = container?.querySelector('svg');
      if (svgEl) {
        const svgContent = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mermaid-${id}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
  }, [htmlContent, primaryColor]);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const handleDesktopRef = (el: HTMLDivElement | null) => {
    desktopContainerRef.current = el;
    if (previewMode !== 'mobile' && previewContainerRef) {
      (previewContainerRef as any).current = el;
    }
  };

  const handleMobileRef = (el: HTMLDivElement | null) => {
    mobileScrollRef.current = el;
    if (previewMode === 'mobile' && previewContainerRef) {
      (previewContainerRef as any).current = el;
    }
  };

  // Keep previewContainerRef pointing to whichever element is currently scrolling
  useEffect(() => {
    if (!previewContainerRef) return;
    if (previewMode === 'mobile') {
      (previewContainerRef as any).current = mobileScrollRef.current;
    } else {
      (previewContainerRef as any).current = desktopContainerRef.current;
    }
  }, [previewMode, previewContainerRef]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      const target = e.currentTarget;
      const maxScroll = target.scrollHeight - target.clientHeight;
      const ratio = maxScroll > 0 ? target.scrollTop / maxScroll : 0;
      onScroll(ratio);
    }
  };

  const renderedBody = (
    <div className="md2post-rendered-content" ref={contentRef}>
      {/* Rendered HTML */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );

  if (previewMode === 'mobile') {
    return (
      <div className="preview-pane mode-mobile">
        <div className="mobile-phone-chassis">
          {/* Permanent Top Phone Header: Notch + Status Bar */}
          <div className="mobile-phone-header">
            <div className="phone-notch">
              <span className="notch-speaker" />
              <span className="notch-camera" />
            </div>
            <div className="phone-status-bar">
              <span className="status-time">9:41</span>
              <div className="status-icons">
                <span className="signal-icon">5G</span>
                <span className="battery-icon">🔋</span>
              </div>
            </div>
          </div>

          {/* Scrollable Phone Screen Content */}
          <div
            className="mobile-screen-scroll"
            ref={handleMobileRef}
            onScroll={handleScroll}
          >
            {renderedBody}
          </div>

          {/* Bottom Home Indicator */}
          <div className="mobile-phone-footer">
            <div className="phone-home-indicator" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop Mode
  return (
    <div
      className="preview-pane mode-desktop"
      ref={handleDesktopRef}
      onScroll={handleScroll}
    >
      <div className="preview-viewport">
        {renderedBody}
      </div>
    </div>
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
