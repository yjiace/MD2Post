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
        htmlLabels: false, // Critical: pure SVG <text> instead of <foreignObject> prevents styling cascade pollution and ensures 100% canvas rasterization success
        fontSize: 13,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        flowchart: {
          htmlLabels: false,
          useMaxWidth: false,
          curve: 'linear',
          subGraphTitleMargin: {
            top: 18,
            bottom: 12
          }
        },
        sequence: {
          useMaxWidth: false
        },
        themeVariables: {
          primaryColor: primaryColor,
          primaryTextColor: '#1f2937',
          primaryBorderColor: primaryColor,
          lineColor: '#64748b',
          edgeColor: '#64748b',
          arrowheadColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#ffffff',
          fontSize: '13px'
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
          // Clean SVG root for fluid responsive display without breaking geometric coordinates
          const processedSvg = cleanMermaidSvg(svg);

          const pngDataUrl = await svgToPngDataUrl(processedSvg);
          block.setAttribute('data-rendered', 'true');
          block.innerHTML = `
            <div class="mermaid-diagram-wrap" data-png-url="${pngDataUrl || ''}">
              <div class="diagram-toolbar">
                <span class="diagram-label">Mermaid 流程图</span>
                <div class="diagram-actions">
                  <button class="diagram-export-btn" onclick="window.__copyMermaidPng && window.__copyMermaidPng('${uniqueId}', this)" title="复制高清图片到剪贴板 (可直接在掘金等编辑器内按 Ctrl+V 粘贴为官方图床图片)">
                    复制图片
                  </button>
                  <button class="diagram-export-btn" onclick="window.__downloadMermaidSvg && window.__downloadMermaidSvg('${uniqueId}')" title="下载 SVG 矢量图">
                    SVG
                  </button>
                  <button class="diagram-export-btn" onclick="window.__downloadMermaidPng && window.__downloadMermaidPng('${uniqueId}')" title="下载 PNG 图片">
                    PNG
                  </button>
                </div>
              </div>
              <div class="diagram-svg-container" id="${uniqueId}-container">
                ${processedSvg}
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

    // Provide global png download function
    (window as any).__downloadMermaidPng = async (id: string) => {
      const container = document.getElementById(`${id}-container`);
      const wrap = container?.closest('.mermaid-diagram-wrap') as HTMLElement;
      let pngUrl = wrap?.getAttribute('data-png-url');

      if (!pngUrl) {
        const svgEl = container?.querySelector('svg');
        if (svgEl) {
          const svgContent = new XMLSerializer().serializeToString(svgEl);
          pngUrl = await svgToPngDataUrl(svgContent);
        }
      }

      if (pngUrl) {
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `mermaid-${id}.png`;
        a.click();
      }
    };

    // Provide global copy PNG image to clipboard function (works seamlessly with Juejin, Zhihu, etc.)
    (window as any).__copyMermaidPng = async (id: string, btnEl?: HTMLElement) => {
      try {
        const container = document.getElementById(`${id}-container`);
        const wrap = container?.closest('.mermaid-diagram-wrap') as HTMLElement;
        let pngUrl = wrap?.getAttribute('data-png-url');

        if (!pngUrl) {
          const svgEl = container?.querySelector('svg');
          if (svgEl) {
            const svgContent = new XMLSerializer().serializeToString(svgEl);
            pngUrl = await svgToPngDataUrl(svgContent);
          }
        }

        if (pngUrl) {
          const res = await fetch(pngUrl);
          const blob = await res.blob();
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          if (btnEl) {
            const oldText = btnEl.textContent;
            btnEl.textContent = '已复制!';
            btnEl.style.backgroundColor = '#10b981';
            btnEl.style.color = '#ffffff';
            setTimeout(() => {
              btnEl.textContent = oldText;
              btnEl.style.backgroundColor = '';
              btnEl.style.color = '';
            }, 1800);
          }
        }
      } catch (err) {
        console.error('Failed to copy mermaid image to clipboard:', err);
        alert('复制图片到剪贴板失败，您可以通过旁边的 PNG 按钮直接下载图片');
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
      <div id="nice" dangerouslySetInnerHTML={{ __html: htmlContent }} />
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

function cleanMermaidSvg(rawSvg: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return rawSvg;

    // Fluid SVG styling without mutating inner geometric nodes/coordinates
    svgEl.setAttribute(
      'style',
      'max-width: 100%; height: auto; display: block; margin: 0 auto;'
    );

    // Ensure subgraph cluster titles have comfortable padding from the top border
    const clusters = doc.querySelectorAll('.cluster');
    clusters.forEach(cluster => {
      const rect = cluster.querySelector('rect');
      const label = cluster.querySelector('.cluster-label');
      if (rect && label) {
        const rectY = parseFloat(rect.getAttribute('y') || '0');
        const transform = label.getAttribute('transform') || '';
        const match = transform.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          if (y - rectY < 14) {
            label.setAttribute('transform', `translate(${x}, ${rectY + 18})`);
          }
        }
      }
    });

    return new XMLSerializer().serializeToString(doc);
  } catch (e) {
    console.warn('cleanMermaidSvg warning:', e);
    return rawSvg;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
