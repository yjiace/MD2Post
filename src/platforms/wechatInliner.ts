import type { ThemeConfig } from '../types';
import { getCodeThemeInlinePalette } from '../themes/codeThemes';
import { svgToPngDataUrl } from '../utils/svgRasterizer';
import juice from 'juice/client';
import { WEIYAN_BASIC_CSS } from '../themes/weiyanThemes';

export interface InlineOptions {
  theme: ThemeConfig;
  primaryColor: string;
  codeThemeId?: string;
  convertFootnotes: boolean;
  platform: string;
}

/**
 * Transforms preview HTML into WeChat / Toutiao / Zhihu / Juejin compatible HTML with inlined styles.
 * Tailored specifically for each platform's HTML sanitizer:
 * - WeChat: Uses <section> containers, avoids <pre> to prevent warnings, emojis in headers, no <figure>.
 * - Toutiao: Uses <div> and native <table> with border="1", standard <blockquote>, no <section>.
 * - Zhihu: Uses clean standard HTML (<div>, <p>, <blockquote>, <table>, native <pre><code>), no <section>.
 * - Universal: High-resolution PNGs for all SVGs, inline token colors, non-breaking spaces in code.
 */
export async function transformToInlinedHtml(
  containerElement: HTMLElement,
  options: InlineOptions
): Promise<{ inlinedHtml: string; plainText: string }> {
  // Clone element to avoid modifying the active preview DOM
  const clone = containerElement.cloneNode(true) as HTMLElement;

  const { theme, primaryColor, codeThemeId, convertFootnotes, platform } = options;
  const isWechat = platform === 'wechat';
  const isToutiao = platform === 'toutiao';
  const isZhihu = platform === 'zhihu';
  const codePalette = getCodeThemeInlinePalette(codeThemeId);

  // 1. Process Mermaid Diagrams: Replace all diagrams with crisp PNG images
  const mermaidBlocks = clone.querySelectorAll('.md2post-mermaid');
  for (const block of Array.from(mermaidBlocks)) {
    let pngUrl = '';
    const imgEl = block.querySelector('.mermaid-img') as HTMLImageElement | null;
    if (imgEl && imgEl.src && imgEl.src.startsWith('data:image/')) {
      pngUrl = imgEl.src;
    } else {
      const wrapEl = block.querySelector('.mermaid-diagram-wrap');
      const dataPng = wrapEl?.getAttribute('data-png-url');
      if (dataPng && dataPng.startsWith('data:image/')) {
        pngUrl = dataPng;
      } else {
        const svgEl = block.querySelector('svg');
        if (svgEl) {
          pngUrl = await svgToPngDataUrl(svgEl);
        }
      }
    }

    if (pngUrl) {
      const containerTag = isWechat ? 'section' : isZhihu ? 'figure' : 'p';
      const diagramWrap = document.createElement(containerTag);
      diagramWrap.className = 'md2post-diagram-section';
      diagramWrap.setAttribute(
        'style',
        `display: block; margin: 18px 0 !important; padding: 6px 0; text-align: center; background-color: #ffffff; ${isWechat ? 'box-sizing: border-box !important;' : ''}`
      );

      const cleanImg = document.createElement('img');
      cleanImg.setAttribute('src', pngUrl);
      cleanImg.setAttribute('alt', '流程图');
      if (isZhihu) {
        cleanImg.className = 'origin_image zh-lightbox-thumb';
        cleanImg.setAttribute('data-actualsrc', pngUrl);
        cleanImg.setAttribute('data-original', pngUrl);
      }
      cleanImg.setAttribute(
        'style',
        'max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);'
      );

      diagramWrap.appendChild(cleanImg);
      block.parentNode?.replaceChild(diagramWrap, block);
    } else {
      // Fallback
      const codeAttr = block.getAttribute('data-code');
      const rawCode = codeAttr ? decodeURIComponent(codeAttr) : '';
      if (isZhihu) {
        const pre = document.createElement('pre');
        pre.className = 'md2post-pre';
        pre.setAttribute(
          'style',
          `display: block; margin: 16px 0 !important; padding: 14px 16px !important; background-color: ${codePalette.containerBg || '#282c34'}; color: ${codePalette.textColor || '#abb2bf'}; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13.5px; line-height: 1.6; border-radius: 6px; overflow-x: auto; white-space: pre !important; word-break: normal;`
        );
        const code = document.createElement('code');
        code.className = 'language-mermaid';
        code.setAttribute('style', 'font-family: inherit; font-size: inherit; background-color: transparent; white-space: pre !important;');
        code.textContent = rawCode;
        pre.appendChild(code);
        block.parentNode?.replaceChild(pre, block);
      } else {
        const fallback = document.createElement(isWechat ? 'section' : 'blockquote');
        fallback.setAttribute(
          'style',
          'display: block; margin: 14px 0 !important; padding: 12px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; text-align: center; font-size: 13px; color: #64748b;'
        );
        fallback.innerHTML = `<div style="font-weight: 600; color: #475569; margin-bottom: 6px;">[流程图]</div>${
          rawCode ? `<div style="text-align: left; background: #ffffff; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin: 0; color: #334155; font-family: monospace; white-space: pre-wrap;">${escapeHtml(rawCode)}</div>` : ''
        }`;
        block.parentNode?.replaceChild(fallback, block);
      }
    }
  }

  // Also clean up any loose .mermaid-diagram-wrap not inside .md2post-mermaid
  const looseWraps = clone.querySelectorAll('.mermaid-diagram-wrap');
  for (const wrap of Array.from(looseWraps)) {
    const imgEl = wrap.querySelector('.mermaid-img') as HTMLImageElement | null;
    const dataPng = wrap.getAttribute('data-png-url');
    const pngUrl = (imgEl && imgEl.src.startsWith('data:image/')) ? imgEl.src : (dataPng && dataPng.startsWith('data:image/')) ? dataPng : '';

    if (pngUrl) {
      const containerTag = isWechat ? 'section' : isZhihu ? 'figure' : 'p';
      const diagramWrap = document.createElement(containerTag);
      diagramWrap.setAttribute('style', 'display: block; margin: 16px 0 !important; padding: 6px 0; text-align: center;');
      const cleanImg = document.createElement('img');
      cleanImg.setAttribute('src', pngUrl);
      cleanImg.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px;');
      diagramWrap.appendChild(cleanImg);
      wrap.parentNode?.replaceChild(diagramWrap, wrap);
    } else {
      wrap.remove();
    }
  }

  // 2. Universal SVG-to-Image Check:
  // Convert any remaining raw <svg> elements (such as user-inserted SVGs) into PNG <img>
  const remainingSvgs = Array.from(clone.querySelectorAll('svg'));
  for (const svgEl of remainingSvgs) {
    if (svgEl.closest('.preview-only') || svgEl.closest('.diagram-toolbar')) {
      svgEl.remove();
      continue;
    }
    const pngUrl = await svgToPngDataUrl(svgEl);
    if (pngUrl) {
      const img = document.createElement('img');
      img.setAttribute('src', pngUrl);
      img.setAttribute('alt', '图片');
      img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 4px;');
      svgEl.parentNode?.replaceChild(img, svgEl);
    } else {
      svgEl.remove();
    }
  }

  // Convert any <img> with data:image/svg+xml to PNG
  const allImgs = Array.from(clone.querySelectorAll('img'));
  for (const img of allImgs) {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml')) {
      const pngUrl = await svgToPngDataUrl(src);
      if (pngUrl) {
        img.setAttribute('src', pngUrl);
      }
    }
  }

  // Remove preview-only widgets and diagram toolbars
  clone.querySelectorAll('.diagram-toolbar, .diagram-svg-container, .mermaid-raw-svg, .preview-only').forEach(el => el.remove());

  // 3. Process Footnotes (convert <a> to <sup>[n]</sup> and collect list for WeChat)
  const footnotes: { index: number; title: string; href: string }[] = [];
  if (convertFootnotes) {
    const links = clone.querySelectorAll('a');
    let counter = 1;
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const title = a.textContent?.trim() || href;
        const currentIdx = counter++;
        footnotes.push({ index: currentIdx, title, href });

        const sup = document.createElement('sup');
        sup.setAttribute('style', `color: ${primaryColor}; font-weight: bold; margin-left: 2px; font-size: 0.75em; line-height: 1.2 !important; vertical-align: super;`);
        sup.textContent = `[${currentIdx}]`;

        const span = document.createElement('span');
        span.setAttribute('style', `color: ${primaryColor}; font-weight: 500;`);
        span.textContent = title;

        a.parentNode?.replaceChild(sup, a);
        sup.parentNode?.insertBefore(span, sup);
      }
    });

    if (footnotes.length > 0) {
      const footnoteTag = isWechat ? 'section' : 'div';
      const footnoteSection = document.createElement(footnoteTag);
      footnoteSection.setAttribute(
        'style',
        `margin-top: 30px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #64748b; line-height: 1.6;`
      );

      const titleEl = document.createElement('h4');
      titleEl.setAttribute('style', `font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;`);
      titleEl.textContent = '参考资料与引用链接';
      footnoteSection.appendChild(titleEl);

      const listEl = document.createElement('div');
      footnotes.forEach(fn => {
        const item = document.createElement('div');
        item.setAttribute('style', `margin-bottom: 5px; word-break: break-all;`);
        item.innerHTML = `<span style="color: ${primaryColor}; font-weight: bold; margin-right: 4px;">[${fn.index}]</span> <span style="color: #334155;">${escapeHtml(fn.title)}:</span> <span style="color: #64748b; font-family: monospace;">${escapeHtml(fn.href)}</span>`;
        listEl.appendChild(item);
      });
      footnoteSection.appendChild(listEl);
      clone.appendChild(footnoteSection);
    }
  } else {
    clone.querySelectorAll('a').forEach(a => {
      a.setAttribute('style', `color: ${primaryColor}; text-decoration: none; font-weight: 500; border-bottom: 1px dotted ${primaryColor};`);
    });
  }

  // 4. Images: Clean up <figure>, normalize URLs, and adapt for WeChat/Zhihu/Toutiao
  clone.querySelectorAll('img').forEach(img => {
    let src = img.getAttribute('src') || '';
    if (src.startsWith('//')) {
      img.setAttribute('src', 'https:' + src);
    }
  });

  clone.querySelectorAll('.md2post-image-figure, figure').forEach(fig => {
    const img = fig.querySelector('img');
    const caption = fig.querySelector('figcaption')?.textContent?.trim() || '';
    if (img) {
      img.removeAttribute('onerror');
      img.removeAttribute('loading');
      img.removeAttribute('class');
      img.setAttribute(
        'style',
        'max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);'
      );

      if (isZhihu) {
        // Zhihu Draft.js natively recognizes <figure><img><figcaption></figcaption></figure> as Image Atomic Block
        const zhihuFig = document.createElement('figure');
        zhihuFig.setAttribute('style', 'margin: 18px auto !important; text-align: center; display: block;');
        zhihuFig.appendChild(img);
        if (caption) {
          const capEl = document.createElement('figcaption');
          capEl.setAttribute('style', 'display: block; font-size: 13px; color: #8590a6; margin-top: 6px; text-align: center;');
          capEl.textContent = caption;
          zhihuFig.appendChild(capEl);
        }
        fig.parentNode?.replaceChild(zhihuFig, fig);
      } else {
        const wrapTag = isWechat ? 'section' : 'p';
        const imgWrap = document.createElement(wrapTag);
        imgWrap.setAttribute('style', 'margin: 16px 0 !important; text-align: center;');
        imgWrap.appendChild(img);

        // Toutiao does NOT support HTML captions and converts any sibling caption into regular body paragraph text.
        // Therefore, do not append a caption text node for Toutiao (alt stays inside the img element).
        if (caption && !isToutiao) {
          const capTag = isWechat ? 'section' : 'span';
          const capEl = document.createElement(capTag);
          capEl.setAttribute('style', 'display: block; font-size: 13px; color: #64748b; margin-top: 6px; text-align: center;');
          capEl.textContent = caption;
          imgWrap.appendChild(capEl);
        }
        fig.parentNode?.replaceChild(imgWrap, fig);
      }
    } else {
      fig.remove();
    }
  });

  clone.querySelectorAll('.md2post-image-container').forEach(container => {
    const img = container.querySelector('img');
    if (img) {
      img.removeAttribute('onerror');
      img.removeAttribute('loading');
      img.removeAttribute('class');
      img.setAttribute(
        'style',
        'max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);'
      );
      const wrapTag = isWechat ? 'section' : 'p';
      const imgWrap = document.createElement(wrapTag);
      imgWrap.setAttribute('style', 'margin: 16px 0 !important; text-align: center;');
      imgWrap.appendChild(img);
      container.parentNode?.replaceChild(imgWrap, container);
    }
  });

  clone.querySelectorAll('.md2post-img').forEach(img => {
    img.removeAttribute('onerror');
    img.removeAttribute('loading');
    img.removeAttribute('class');
    img.setAttribute(
      'style',
      'max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 14px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.06);'
    );
  });

  // 5. Headings: Apply manual fallback styling.
  // For WeChat, the active theme CSS defines heading styles (.content left border, badges, etc.).
  // For Zhihu, use clean semantic headings without heavy borders that disrupt Zhihu editor.
  // For Toutiao and Universal, explicit styling is inlined on h1-h6.
  if (isZhihu) {
    clone.querySelectorAll('h1').forEach(el => {
      el.setAttribute(
        'style',
        'font-size: 22px; font-weight: 700; color: #121212; margin: 24px 0 12px 0; line-height: 1.5; text-align: left;'
      );
    });

    clone.querySelectorAll('h2').forEach(el => {
      el.setAttribute(
        'style',
        'font-size: 20px; font-weight: 600; color: #121212; margin: 20px 0 10px 0; line-height: 1.5; text-align: left;'
      );
    });

    clone.querySelectorAll('h3').forEach(el => {
      el.setAttribute(
        'style',
        'font-size: 17px; font-weight: 600; color: #121212; margin: 16px 0 8px 0; line-height: 1.5; text-align: left;'
      );
    });

    clone.querySelectorAll('h4, h5, h6').forEach(el => {
      el.setAttribute(
        'style',
        'font-size: 15px; font-weight: 600; color: #374151; margin: 14px 0 6px 0; line-height: 1.5; text-align: left;'
      );
    });
  } else if (!isWechat) {
    clone.querySelectorAll('h1').forEach(el => {
      el.setAttribute(
        'style',
        `font-size: 24px; font-weight: 700; color: #121212; margin: 28px 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid ${primaryColor}; line-height: 1.6;`
      );
    });

    clone.querySelectorAll('h2').forEach(el => {
      el.setAttribute(
        'style',
        `font-size: 20px; font-weight: 600; color: #121212; margin: 24px 0 10px 0; padding-left: 10px; border-left: 4px solid ${primaryColor}; line-height: 1.6;`
      );
    });

    clone.querySelectorAll('h3').forEach(el => {
      el.setAttribute('style', `font-size: 17px; font-weight: 600; color: #1f2937; margin: 18px 0 8px 0; line-height: 1.6;`);
    });

    clone.querySelectorAll('h4, h5, h6').forEach(el => {
      el.setAttribute('style', `font-size: 15px; font-weight: 600; color: #374151; margin: 14px 0 6px 0; line-height: 1.6;`);
    });
  } else {
    // WeChat: Only ensure line-height >= 1.6 to prevent WeChat editor structure warnings,
    // without injecting conflicting border-left or border-bottom that cause double colored bars.
    clone.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6').forEach(el => {
      if (!el.style.lineHeight) {
        el.style.lineHeight = '1.6';
      }
    });
  }

  // 6. Paragraphs
  const pMarginBottom = Math.min(theme.paragraphSpacing || 12, 12);
  clone.querySelectorAll('p').forEach(el => {
    const inBox = el.closest('.md2post-callout') || el.closest('blockquote') || el.closest('.md2post-callout-section');
    el.setAttribute(
      'style',
      `margin: 0 0 ${inBox ? '6px' : pMarginBottom + 'px'} 0; font-size: ${theme.fontSize}px; line-height: ${theme.lineHeight}; color: ${theme.textColor}; letter-spacing: 0.02em;`
    );
  });

  // 7. GitHub Style Callout boxes: Emojis + platform-tailored containers
  clone.querySelectorAll('.md2post-callout').forEach(el => {
    const isTip = el.classList.contains('md2post-callout-tip');
    const isImportant = el.classList.contains('md2post-callout-important');
    const isWarning = el.classList.contains('md2post-callout-warning');
    const isCaution = el.classList.contains('md2post-callout-caution');

    let borderColor = primaryColor;
    let bgColor = '#f0f7ff';
    let titleColor = primaryColor;
    let badgeIcon = 'ℹ';
    let emojiIcon = 'ℹ️';
    let titleText = '注意';

    if (isTip) {
      borderColor = '#1a7f37';
      bgColor = '#f0fbf0';
      titleColor = '#1a7f37';
      badgeIcon = '💡';
      emojiIcon = '💡';
      titleText = '提示';
    } else if (isImportant) {
      borderColor = '#8250df';
      bgColor = '#fbf0ff';
      titleColor = '#8250df';
      badgeIcon = '!';
      emojiIcon = '📌';
      titleText = '重点';
    } else if (isWarning) {
      borderColor = '#bf8700';
      bgColor = '#fff8ea';
      titleColor = '#bf8700';
      badgeIcon = '!';
      emojiIcon = '⚠️';
      titleText = '警告';
    } else if (isCaution) {
      borderColor = '#cf222e';
      bgColor = '#fff0f0';
      titleColor = '#cf222e';
      badgeIcon = '✕';
      emojiIcon = '🚨';
      titleText = '危险';
    }

    const titleEl = el.querySelector('.callout-title');
    if (titleEl && titleEl.textContent?.trim()) {
      titleText = titleEl.textContent.trim();
    }

    // Extract body content: match .callout-content or .callout-body and strip any duplicate header
    const bodyEl = el.querySelector('.callout-content') || el.querySelector('.callout-body');
    let bodyHtml = bodyEl ? bodyEl.innerHTML : el.innerHTML;
    bodyHtml = bodyHtml.replace(/<div class="callout-header"[\s\S]*?<\/div>/gi, '').trim();

    if (isWechat) {
      // WeChat: Use <section> with styled circular badge icon and <span> title (NEVER <strong> to avoid theme quotes)
      const calloutSection = document.createElement('section');
      calloutSection.className = 'md2post-callout-section';
      calloutSection.setAttribute(
        'style',
        `display: block; margin: 14px 0 !important; padding: 12px 16px !important; background-color: ${bgColor} !important; border-left: 4px solid ${borderColor} !important; border-radius: 4px; box-sizing: border-box !important; text-align: left !important;`
      );
      calloutSection.innerHTML = `
        <section style="display: flex; align-items: center; margin: 0 0 6px 0; line-height: 1.6; text-align: left;">
          <span style="display: inline-block; width: 18px; height: 18px; line-height: 18px; text-align: center; border-radius: 50%; background-color: ${titleColor}; color: #ffffff; font-size: 12px; font-weight: bold; margin-right: 8px; flex-shrink: 0; vertical-align: middle;">${badgeIcon}</span>
          <span style="color: ${titleColor}; font-size: 15px; font-weight: 700; line-height: 1.6; vertical-align: middle;">${escapeHtml(titleText)}</span>
        </section>
        <section style="display: block; margin: 0; padding: 0; color: #374151; font-size: 14.5px; line-height: 1.75; text-align: left;">
          ${bodyHtml}
        </section>
      `;
      calloutSection.querySelectorAll('p').forEach(p => {
        if (!p.textContent?.trim() && !p.querySelector('img, svg')) {
          p.remove();
          return;
        }
        while (p.firstChild && (p.firstChild.nodeName === 'BR' || (p.firstChild.nodeType === Node.TEXT_NODE && !p.firstChild.textContent?.trim()))) {
          p.removeChild(p.firstChild);
        }
        p.setAttribute('style', 'margin: 0 0 6px 0; font-size: 14.5px; line-height: 1.75; color: #374151; text-align: left;');
      });
      const lastP = calloutSection.querySelector('p:last-of-type') as HTMLElement | null;
      if (lastP) {
        lastP.style.marginBottom = '0';
      }
      el.parentNode?.replaceChild(calloutSection, el);
    } else if (isZhihu) {
      // Zhihu Draft.js: <blockquote> MUST only contain direct children (<p> elements).
      // Nested <div> causes Zhihu's editor to close the blockquote prematurely and eject the body!
      const bq = document.createElement('blockquote');
      bq.setAttribute(
        'style',
        `display: block; margin: 16px 0; padding: 12px 16px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; color: #374151; font-size: 14.5px; line-height: 1.75; text-align: left;`
      );

      // Title header as a standard left-aligned <p>
      const headerP = document.createElement('p');
      headerP.setAttribute(
        'style',
        `margin: 0 0 6px 0 !important; font-size: 15px !important; font-weight: 700 !important; color: ${titleColor} !important; line-height: 1.6 !important; text-align: left !important;`
      );
      headerP.innerHTML = `<span style="margin-right: 6px; font-style: normal; font-size: 15px; vertical-align: baseline;">${emojiIcon}</span><strong style="color: ${titleColor}; font-weight: 700;">${escapeHtml(titleText)}</strong>`;
      bq.appendChild(headerP);

      // Parse body paragraphs directly into bq
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bodyHtml;

      Array.from(tempDiv.children).forEach(child => {
        if (child.tagName === 'P') {
          const p = child as HTMLElement;
          p.setAttribute('style', 'margin: 0 0 6px 0 !important; font-size: 14.5px !important; line-height: 1.75 !important; color: #374151 !important; text-align: left !important;');
          bq.appendChild(p);
        } else if (child.tagName === 'OL' || child.tagName === 'UL') {
          const isOl = child.tagName === 'OL';
          Array.from(child.children).forEach((li, idx) => {
            if (li.tagName === 'LI') {
              const p = document.createElement('p');
              p.setAttribute('style', 'margin: 0 0 6px 0 !important; font-size: 14px !important; line-height: 1.7 !important; color: #374151 !important; text-align: left !important; padding-left: 2px;');
              const marker = isOl ? `${idx + 1}、` : '• ';
              p.innerHTML = `<span style="font-weight: 600; color: ${titleColor}; margin-right: 4px;">${marker}</span>${li.innerHTML}`;
              bq.appendChild(p);
            }
          });
        } else {
          bq.appendChild(child);
        }
      });

      // If tempDiv had only raw text or no block children
      if (tempDiv.children.length === 0 && tempDiv.textContent?.trim()) {
        const textP = document.createElement('p');
        textP.setAttribute('style', 'margin: 0; font-size: 14.5px !important; line-height: 1.75 !important; color: #374151 !important; text-align: left !important;');
        textP.textContent = tempDiv.textContent.trim();
        bq.appendChild(textP);
      }

      const lastBqChild = bq.lastElementChild as HTMLElement | null;
      if (lastBqChild && lastBqChild.tagName === 'P') {
        lastBqChild.style.marginBottom = '0';
      }

      el.parentNode?.replaceChild(bq, el);
    } else {
      // Toutiao / Universal: Standard <blockquote> container
      const bq = document.createElement('blockquote');
      bq.setAttribute(
        'style',
        `display: block; margin: 14px 0; padding: 12px 16px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; color: #374151; font-size: 14.5px; line-height: 1.75; text-align: left;`
      );

      // Clean body content paragraphs first
      const bodyDiv = document.createElement('div');
      bodyDiv.setAttribute('style', 'margin: 0; padding: 0; color: #374151; font-size: 14.5px; line-height: 1.75; text-align: left;');
      bodyDiv.innerHTML = bodyHtml;

      bodyDiv.querySelectorAll('p').forEach(p => {
        if (!p.textContent?.trim() && !p.querySelector('img, svg')) {
          p.remove();
          return;
        }
        while (p.firstChild && (p.firstChild.nodeName === 'BR' || (p.firstChild.nodeType === Node.TEXT_NODE && !p.firstChild.textContent?.trim()))) {
          p.removeChild(p.firstChild);
        }
        p.setAttribute('style', 'margin: 0 0 6px 0; font-size: 14.5px; line-height: 1.75; color: #374151; text-align: left;');
      });

      const lastBqP = bodyDiv.querySelector('p:last-of-type') as HTMLElement | null;
      if (lastBqP) {
        lastBqP.style.marginBottom = '0';
      }

      // Title header as a standard left-aligned <p> without flex or text-align: center to prevent Toutiao editor from centering the icon
      const headerP = document.createElement('p');
      headerP.setAttribute(
        'style',
        `margin: 0 0 8px 0 !important; font-size: 15px !important; font-weight: 700 !important; color: ${titleColor} !important; line-height: 1.6 !important; text-align: left !important;`
      );
      headerP.innerHTML = `<span style="margin-right: 6px; font-style: normal; font-size: 15px; vertical-align: baseline;">${emojiIcon}</span><span style="color: ${titleColor}; font-weight: 700;">${escapeHtml(titleText)}</span>`;

      bq.appendChild(headerP);
      bq.appendChild(bodyDiv);
      el.parentNode?.replaceChild(bq, el);
    }
  });

  // 8. Blockquotes (standard)
  if (!isWechat) {
    clone.querySelectorAll('blockquote:not(.md2post-callout)').forEach(el => {
      el.setAttribute(
        'style',
        `margin: 14px 0 16px 0; padding: 10px 16px; color: #475569; background-color: #f8fafc; border-left: 4px solid ${primaryColor}; border-radius: 0 6px 6px 0; font-size: 14.5px; line-height: 1.65;`
      );
    });
  }

  // 9. Tables: Platform-Specific Table Architecture
  if (isWechat) {
    // WeChat: Wrap in <section> with horizontal scroll
    clone.querySelectorAll('.md2post-table-wrapper').forEach(wrapper => {
      const tableSection = document.createElement('section');
      tableSection.className = 'md2post-table-section';
      tableSection.setAttribute(
        'style',
        'display: block; margin: 8px 0 10px 0 !important; padding: 0; box-sizing: border-box !important; overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; border: 1px solid #dfe2e5; border-radius: 6px;'
      );
      tableSection.innerHTML = wrapper.innerHTML;
      wrapper.parentNode?.replaceChild(tableSection, wrapper);
    });

    clone.querySelectorAll('table').forEach(table => {
      table.setAttribute(
        'style',
        'display: table; width: 100% !important; max-width: 100% !important; margin: 0 !important; border-collapse: collapse !important; border-spacing: 0 !important; font-size: 13.5px; text-align: left; background-color: transparent;'
      );
    });
  } else {
    // Toutiao / Zhihu: UNWRAP .md2post-table-wrapper and provide standard native <table> with border="1"
    clone.querySelectorAll('.md2post-table-wrapper').forEach(wrapper => {
      const table = wrapper.querySelector('table');
      if (table) {
        table.setAttribute('border', '1');
        table.setAttribute('cellpadding', '8');
        table.setAttribute('cellspacing', '0');
        table.setAttribute(
          'style',
          'width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #dfe2e5; font-size: 13.5px; text-align: left;'
        );
        wrapper.parentNode?.replaceChild(table, wrapper);
      } else {
        wrapper.remove();
      }
    });

    clone.querySelectorAll('table').forEach(table => {
      table.setAttribute('border', '1');
      table.setAttribute('cellpadding', '8');
      table.setAttribute('cellspacing', '0');
      table.setAttribute(
        'style',
        'width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #dfe2e5; font-size: 13.5px; text-align: left;'
      );
    });
  }

  clone.querySelectorAll('thead').forEach(thead => {
    thead.setAttribute('style', 'background-color: #f6f8fa;');
  });

  clone.querySelectorAll('tr').forEach((tr, index) => {
    const isEven = index % 2 === 1;
    tr.setAttribute('style', `border-bottom: 1px solid #dfe2e5; ${isEven ? 'background-color: #fcfcfc;' : 'background-color: #ffffff;'}`);
  });

  clone.querySelectorAll('th').forEach(th => {
    th.setAttribute(
      'style',
      'padding: 8px 12px; border: 1px solid #dfe2e5; background-color: #f6f8fa; color: #1f2937; font-weight: 600; font-size: 13.5px; line-height: 1.5; word-break: break-all; text-align: left;'
    );
  });

  clone.querySelectorAll('td').forEach(td => {
    td.setAttribute(
      'style',
      'padding: 8px 12px; border: 1px solid #dfe2e5; color: #334155; font-size: 13px; line-height: 1.5; word-break: break-all; text-align: left;'
    );
  });

  // 10. Math Formulas (KaTeX) processing for Zhihu, WeChat, Toutiao
  if (isZhihu) {
    clone.querySelectorAll('.md2post-math-block').forEach(block => {
      const formulaAttr = block.getAttribute('data-formula');
      if (formulaAttr) {
        const formula = decodeURIComponent(formulaAttr);
        const img = document.createElement('img');
        img.className = 'Formula-image';
        img.setAttribute('data-eeimg', 'true');
        img.setAttribute('src', `https://www.zhihu.com/equation?tex=${encodeURIComponent(formula)}`);
        img.setAttribute('alt', formula);
        img.setAttribute('style', 'max-width: 100%; vertical-align: middle; margin: 4px 0;');

        const p = document.createElement('p');
        p.setAttribute('style', 'margin: 16px 0; text-align: center;');
        p.appendChild(img);
        block.parentNode?.replaceChild(p, block);
      }
    });

    clone.querySelectorAll('.md2post-math-inline').forEach(inlineEl => {
      const formulaAttr = inlineEl.getAttribute('data-formula');
      if (formulaAttr) {
        const formula = decodeURIComponent(formulaAttr);
        const img = document.createElement('img');
        img.className = 'Formula-image';
        img.setAttribute('data-eeimg', 'true');
        img.setAttribute('src', `https://www.zhihu.com/equation?tex=${encodeURIComponent(formula)}`);
        img.setAttribute('alt', formula);
        img.setAttribute('style', 'vertical-align: middle; margin: 0 2px;');
        inlineEl.parentNode?.replaceChild(img, inlineEl);
      }
    });
  } else {
    clone.querySelectorAll('.katex-mathml').forEach(el => el.remove());
    clone.querySelectorAll('.md2post-math-block').forEach(block => {
      block.setAttribute(
        'style',
        'margin: 16px 0; padding: 10px 14px; text-align: center; overflow-x: auto; -webkit-overflow-scrolling: touch; background-color: #fafbfc; border-radius: 6px; font-size: 15px; color: #1f2937;'
      );
    });
    clone.querySelectorAll('.md2post-math-inline').forEach(inlineEl => {
      inlineEl.setAttribute('style', 'margin: 0 2px; font-size: 14.5px; color: #1f2937;');
    });
  }

  // 11. Code Blocks & Syntax Highlighting: CRITICAL FIRST STEP - Apply token colors BEFORE replacing tags!

  // 11.1 Inline all highlight.js syntax token colors directly onto spans (WORKS ACROSS ALL PLATFORMS)
  const hljsSpans = clone.querySelectorAll<HTMLSpanElement>('span[class*="hljs-"]');
  hljsSpans.forEach(span => {
    const classList = Array.from(span.classList);
    let matchedColor = '';
    let isItalic = false;
    let isBold = false;

    for (const cls of classList) {
      if (cls.startsWith('hljs-')) {
        const tokenName = cls.replace('hljs-', '');
        if (codePalette.tokens[tokenName]) {
          matchedColor = codePalette.tokens[tokenName];
        }
        if (tokenName === 'comment' || tokenName === 'quote') {
          isItalic = true;
        }
        if (tokenName === 'keyword' || tokenName === 'title' || tokenName === 'section') {
          isBold = true;
        }
      }
    }

    if (matchedColor) {
      const existingStyle = span.getAttribute('style') || '';
      span.setAttribute(
        'style',
        `${existingStyle} color: ${matchedColor} !important; ${isItalic ? 'font-style: italic;' : ''} ${isBold ? 'font-weight: 600;' : ''}`
      );
    }
  });

  // 11.2 Replace regular spaces in code text nodes with \u00A0 (non-breaking space)
  // to prevent WeChat / Toutiao from merging keywords (e.g. varqaAdvisor=)
  clone.querySelectorAll('.md2post-code-container code, pre code').forEach(codeEl => {
    const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode.textContent) {
        currentNode.textContent = currentNode.textContent.replace(/ /g, '\u00A0');
      }
      currentNode = walker.nextNode();
    }
  });

  // 11.2 Inline Syntax Highlighting Token Colors
  // Crucial: WeChat / Toutiao / Zhihu strip <style> blocks and CSS class names upon pasting,
  // so every single .hljs-* token must be explicitly inlined with its theme palette color!
  const tokenMap = codePalette.tokens as Record<string, string>;
  clone.querySelectorAll('.md2post-code-container').forEach(container => {
    container.querySelectorAll<HTMLElement>('[class*="hljs-"]').forEach(span => {
      const classNames = span.className.split(/\s+/);
      for (const cls of classNames) {
        if (cls.startsWith('hljs-')) {
          const tokenKey = cls.replace('hljs-', '');
          const color = tokenMap[tokenKey];
          if (color) {
            const isBold = ['keyword', 'title', 'selector-tag', 'section', 'tag', 'name'].includes(tokenKey);
            const isItalic = ['comment', 'quote'].includes(tokenKey);
            const existingStyle = span.getAttribute('style') || '';
            span.setAttribute(
              'style',
              `${existingStyle} color: ${color} !important; ${isBold ? 'font-weight: 600;' : ''} ${isItalic ? 'font-style: italic;' : ''}`
            );
            break;
          }
        }
      }
    });
  });

  // 11.3 Platform-Specific Code Container Architecture:
  if (isWechat) {
    // WeChat: Use <section> wrappers (no <pre>) to completely eliminate the "内容结构检测: pre 标签使用" popup!
    clone.querySelectorAll('.md2post-code-container').forEach(container => {
      const codeSection = document.createElement('section');
      codeSection.className = 'md2post-code-section';
      codeSection.setAttribute(
        'style',
        `display: block; margin: 8px 0 10px 0 !important; padding: 0; box-sizing: border-box !important; background-color: ${codePalette.containerBg}; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12);`
      );
      codeSection.innerHTML = container.innerHTML;
      container.parentNode?.replaceChild(codeSection, container);
    });

    clone.querySelectorAll('.code-mac-header').forEach(header => {
      const langEl = header.querySelector('.code-lang');
      const lang = langEl?.textContent?.trim() || '';

      const headerSection = document.createElement('section');
      headerSection.setAttribute(
        'style',
        `display: block; padding: 7px 12px; background-color: ${codePalette.macHeaderBg}; border-bottom: 1px solid ${codePalette.macHeaderBorder}; box-sizing: border-box !important; overflow: hidden; line-height: 1.6;`
      );
      headerSection.innerHTML = `
        <section style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box;">
          <section style="display: flex; align-items: center; gap: 5px;">
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ff5f56;"></span>
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ffbd2e;"></span>
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #27c93f;"></span>
          </section>
          ${lang ? `<section style="font-size: 11px; text-transform: uppercase; color: #9da5b4; font-family: monospace; letter-spacing: 0.05em; font-weight: 500;">${escapeHtml(lang)}</section>` : ''}
        </section>
      `;
      header.parentNode?.replaceChild(headerSection, header);
    });

    clone.querySelectorAll('.md2post-pre').forEach(pre => {
      const codePreSection = document.createElement('section');
      codePreSection.className = 'md2post-code-body';
      codePreSection.setAttribute(
        'style',
        `display: block; margin: 0 !important; padding: 8px 10px !important; overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; box-sizing: border-box !important; background-color: ${codePalette.preBg}; color: ${codePalette.textColor}; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 12.5px; line-height: 1.48; letter-spacing: 0 !important; word-spacing: 0 !important; white-space: pre !important; word-break: normal;`
      );
      codePreSection.innerHTML = pre.innerHTML;
      pre.parentNode?.replaceChild(codePreSection, pre);
    });

    clone.querySelectorAll('code.hljs').forEach(codeEl => {
      codeEl.setAttribute(
        'style',
        `display: block !important; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 12.5px; line-height: 1.48; letter-spacing: 0 !important; word-spacing: 0 !important; color: ${codePalette.textColor}; background-color: transparent; white-space: pre !important;`
      );
    });

    clone.querySelectorAll('.line').forEach(line => {
      line.setAttribute(
        'style',
        'display: flex !important; align-items: flex-start; line-height: 1.48; min-height: 1.48em; margin: 0; padding: 0; box-sizing: border-box; letter-spacing: 0 !important; word-spacing: 0 !important;'
      );
    });

    clone.querySelectorAll('.line-num').forEach(num => {
      num.setAttribute(
        'style',
        `flex-shrink: 0 !important; width: 1.9em !important; margin-right: 0.45em; text-align: right; color: ${codePalette.lineNumColor}; user-select: none; line-height: 1.48; font-size: 11.5px; letter-spacing: 0 !important; opacity: 0.5;`
      );
    });

    clone.querySelectorAll('.line-content').forEach(content => {
      content.setAttribute(
        'style',
        'flex: 1 !important; min-width: 0 !important; line-height: 1.48; font-size: 12.5px; letter-spacing: 0 !important; white-space: pre !important;'
      );
    });

  } else if (isZhihu || isToutiao) {
    // Zhihu & Toutiao: Clean standard <pre><code class="language-..."> without line numbers,
    // without Mac window header dots, and with syntax token colors inlined and explicit newlines (\n)!
    // This allows Zhihu & Toutiao rich-text editors (Draft.js / ProseMirror) to cleanly recognize official
    // multi-line code blocks without line-number corruption or collapsing onto a single line!
    clone.querySelectorAll('.md2post-code-container').forEach(container => {
      const langEl = container.querySelector('.code-lang');
      const lang = langEl?.textContent?.trim() || '';

      const lines = container.querySelectorAll('.line');
      let codeHtml = '';
      if (lines.length > 0) {
        const lineParts: string[] = [];
        lines.forEach(l => {
          const contentEl = l.querySelector('.line-content');
          lineParts.push(contentEl ? contentEl.innerHTML : l.innerHTML);
        });
        codeHtml = lineParts.join('\n');
      } else {
        const codeEl = container.querySelector('code');
        codeHtml = codeEl ? codeEl.innerHTML : '';
      }

      const pre = document.createElement('pre');
      pre.className = 'md2post-pre';
      pre.setAttribute(
        'style',
        `display: block; margin: 16px 0 !important; padding: 14px 16px !important; background-color: ${codePalette.containerBg || '#282c34'}; color: ${codePalette.textColor || '#abb2bf'}; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13.5px; line-height: 1.6; border-radius: 6px; overflow-x: auto; white-space: pre !important; word-break: normal;`
      );

      const codeEl = document.createElement('code');
      if (lang) {
        codeEl.className = `language-${lang}`;
      }
      codeEl.setAttribute('style', 'font-family: inherit; font-size: inherit; background-color: transparent; white-space: pre !important;');
      codeEl.innerHTML = codeHtml;

      pre.appendChild(codeEl);
      container.parentNode?.replaceChild(pre, container);
    });
  } else {
    // Universal: Use standard styled <div> container with Mac window header,
    // inlined syntax token colors, and <pre><code> preserving full formatting and indentation!
    clone.querySelectorAll('.md2post-code-container').forEach(container => {
      container.setAttribute(
        'style',
        `display: block; margin: 14px 0 !important; padding: 0; box-sizing: border-box; background-color: ${codePalette.containerBg}; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12);`
      );

      const header = container.querySelector('.code-mac-header');
      if (header) {
        const langEl = header.querySelector('.code-lang');
        const lang = langEl?.textContent?.trim() || '';
        header.setAttribute(
          'style',
          `display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; background-color: ${codePalette.macHeaderBg}; border-bottom: 1px solid ${codePalette.macHeaderBorder}; box-sizing: border-box;`
        );
        header.innerHTML = `
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ff5f56;"></span>
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ffbd2e;"></span>
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #27c93f;"></span>
          </div>
          ${lang ? `<span style="font-size: 11px; text-transform: uppercase; color: #9da5b4; font-family: monospace; letter-spacing: 0.05em; font-weight: 500;">${escapeHtml(lang)}</span>` : ''}
        `;
      }

      const pre = container.querySelector('.md2post-pre');
      if (pre) {
        pre.setAttribute(
          'style',
          `display: block; margin: 0 !important; padding: 12px 14px !important; overflow-x: auto; background-color: ${codePalette.preBg}; color: ${codePalette.textColor}; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13px; line-height: 1.5; white-space: pre !important; word-break: normal;`
        );
      }

      const codeEl = container.querySelector('code.hljs');
      if (codeEl) {
        codeEl.setAttribute(
          'style',
          `display: block !important; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13px; line-height: 1.5; color: ${codePalette.textColor}; background-color: transparent; white-space: pre !important;`
        );
      }

      container.querySelectorAll('.line').forEach(line => {
        line.setAttribute(
          'style',
          'display: flex !important; align-items: flex-start; line-height: 1.5; min-height: 1.5em; margin: 0; padding: 0; box-sizing: border-box;'
        );
      });

      container.querySelectorAll('.line-num').forEach(num => {
        num.setAttribute(
          'style',
          `flex-shrink: 0 !important; width: 2em !important; margin-right: 0.6em; text-align: right; color: ${codePalette.lineNumColor}; user-select: none; line-height: 1.5; font-size: 12px; opacity: 0.5;`
        );
      });

      container.querySelectorAll('.line-content').forEach(content => {
        content.setAttribute(
          'style',
          'flex: 1 !important; min-width: 0 !important; line-height: 1.5; font-size: 13px; white-space: pre !important;'
        );
      });
    });
  }

  // 11.4 Prevent adjacent code blocks (or diagrams degraded to code) from merging in Zhihu / Draft.js:
  // In Draft.js (Zhihu), consecutive 'code-block' elements without an intervening 'unstyled' paragraph (<p>)
  // are automatically aggregated and rendered inside the SAME visual code block wrapper.
  // To guarantee strict block isolation, insert a clean paragraph separator (<p><br></p>) between any adjacent code blocks.
  const codeBlockHolders = Array.from(clone.querySelectorAll('pre, .md2post-code-container')).filter(
    el => !el.parentElement?.closest('.md2post-code-container')
  );
  codeBlockHolders.forEach(blockEl => {
    let nextNode = blockEl.nextSibling;
    // Skip empty whitespace text nodes
    while (nextNode && nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent?.trim()) {
      nextNode = nextNode.nextSibling;
    }

    // If the next meaningful element is also a code block container or pre, insert an empty paragraph separator between them
    if (
      nextNode &&
      nextNode.nodeType === Node.ELEMENT_NODE &&
      ((nextNode as Element).tagName.toLowerCase() === 'pre' ||
        (nextNode as Element).classList.contains('md2post-code-container'))
    ) {
      const separator = document.createElement('p');
      separator.className = 'md2post-code-separator';
      separator.setAttribute(
        'style',
        isZhihu
          ? 'margin: 14px 0 !important; padding: 0 !important; line-height: 1.68; font-size: 16px;'
          : 'margin: 12px 0 !important; padding: 0 !important; line-height: 1.6; font-size: 14px;'
      );
      separator.innerHTML = '<br>';
      blockEl.parentNode?.insertBefore(separator, nextNode);
    }
  });

  // 12. Inline Code (strictly target inline code, NEVER code inside code blocks)
  clone.querySelectorAll('code').forEach(code => {
    // Strictly skip code blocks
    if (
      code.classList.contains('hljs') ||
      code.closest('.md2post-code-container') ||
      code.closest('.md2post-code-section') ||
      code.closest('.md2post-code-body') ||
      code.closest('pre')
    ) {
      return;
    }
    code.setAttribute(
      'style',
      'font-family: Consolas, Monaco, monospace; font-size: 13.5px; padding: 2px 5px; margin: 0 2px; background-color: #f1f5f9; color: #e11d48; border-radius: 4px; border: 1px solid #e2e8f0;'
    );
  });

  // 13. Lists
  clone.querySelectorAll('ul, ol').forEach(list => {
    list.setAttribute('style', `padding-left: 22px; margin: 0 0 12px 0; color: ${theme.textColor}; font-size: ${theme.fontSize}px; line-height: ${theme.lineHeight};`);
  });
  clone.querySelectorAll('li').forEach(li => {
    li.setAttribute('style', 'margin-bottom: 5px;');
  });

  // 14. Horizontal Rules
  if (!isWechat) {
    clone.querySelectorAll('hr').forEach(hr => {
      hr.setAttribute('style', 'height: 1px; background-color: #ebebeb; border: none; margin: 20px 0;');
    });
  }

  // 15. Strip redundant whitespace text nodes between top-level block elements
  const childNodes = Array.from(clone.childNodes);
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      node.remove();
    }
  }

  // 16. Wrap in Platform-Specific Root Container and apply Weiyan Theme Juice inlining with Placeholder Protection
  // We temporarily extract code blocks and diagrams into slots to prevent Weiyan global CSS and Juice from overwriting code themes
  const protectedSlots: string[] = [];

  // Protect diagrams (PNG images)
  clone.querySelectorAll('.md2post-diagram-section').forEach(diag => {
    const slotId = protectedSlots.length;
    protectedSlots.push(diag.outerHTML);
    const placeholder = document.createElement('div');
    placeholder.setAttribute('data-md2post-slot', String(slotId));
    diag.parentNode?.replaceChild(placeholder, diag);
  });

  // Protect transformed code blocks
  clone.querySelectorAll('.md2post-code-section, .md2post-code-container, pre.md2post-pre').forEach(codeBlock => {
    const slotId = protectedSlots.length;
    protectedSlots.push(codeBlock.outerHTML);
    const placeholder = document.createElement('div');
    placeholder.setAttribute('data-md2post-slot', String(slotId));
    codeBlock.parentNode?.replaceChild(placeholder, codeBlock);
  });

  let processedHtml = clone.innerHTML;
  if (isWechat) {
    try {
      const fullCss = `${WEIYAN_BASIC_CSS}\n${theme.customCss || ''}`;
      const wrappedHtml = `<div id="nice">${processedHtml}</div>`;
      const inlined = juice.inlineContent(wrappedHtml, fullCss, {
        inlinePseudoElements: true,
        preserveImportant: true
      });
      const match = inlined.match(/<div id="nice"[^>]*>([\s\S]*)<\/div>/i);
      if (match) {
        processedHtml = match[1];
      } else {
        processedHtml = inlined;
      }
    } catch (e) {
      console.warn('Juice inlining fallback:', e);
    }
  }

  // Restore protected slots (code blocks & diagrams) with exact styles intact
  processedHtml = processedHtml.replace(/<div data-md2post-slot="(\d+)"[^>]*><\/div>/g, (_match, id) => {
    const idx = parseInt(id, 10);
    return protectedSlots[idx] || '';
  });

  const rootTag = isWechat ? 'section' : 'div';
  const wrapper = document.createElement(rootTag);
  if (isZhihu) {
    wrapper.setAttribute('style', 'color: #121212; font-size: 16px; line-height: 1.68; word-break: break-word;');
  } else {
    wrapper.id = 'nice';
    wrapper.className = isToutiao ? 'md2post-toutiao-wrapper' : `md2post-${platform}-wrapper`;
    wrapper.setAttribute(
      'style',
      `font-family: ${theme.fontFamily}; font-size: ${theme.fontSize}px; line-height: ${theme.lineHeight}; color: ${theme.textColor}; background-color: #ffffff; letter-spacing: 0.02em; word-break: break-word;`
    );
  }
  wrapper.innerHTML = processedHtml;

  // Safety pass: Scan and normalize any abnormal line-height (e.g. line-height: 0) to guarantee WeChat #1.3 compliance
  wrapper.querySelectorAll('*').forEach(el => {
    const style = el.getAttribute('style');
    if (style && /line-height\s*:\s*(0|0px|0em|0pt)\b/i.test(style)) {
      el.setAttribute('style', style.replace(/line-height\s*:\s*(0|0px|0em|0pt)\b/gi, 'line-height: 1.2'));
    }
  });

  return {
    inlinedHtml: wrapper.outerHTML,
    plainText: clone.innerText || clone.textContent || ''
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
