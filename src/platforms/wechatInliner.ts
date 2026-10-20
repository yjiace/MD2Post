import type { ThemeConfig } from '../types';
import { getCodeThemeInlinePalette } from '../themes/codeThemes';
import { svgToPngDataUrl } from '../utils/svgRasterizer';

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
      const containerTag = isWechat ? 'section' : 'p';
      const diagramWrap = document.createElement(containerTag);
      diagramWrap.className = 'md2post-diagram-section';
      diagramWrap.setAttribute(
        'style',
        `display: block; margin: 16px 0 !important; padding: 6px 0; text-align: center; background-color: #ffffff; ${isWechat ? 'box-sizing: border-box !important;' : ''}`
      );

      const cleanImg = document.createElement('img');
      cleanImg.setAttribute('src', pngUrl);
      cleanImg.setAttribute('alt', '流程图');
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

  // Also clean up any loose .mermaid-diagram-wrap not inside .md2post-mermaid
  const looseWraps = clone.querySelectorAll('.mermaid-diagram-wrap');
  for (const wrap of Array.from(looseWraps)) {
    const imgEl = wrap.querySelector('.mermaid-img') as HTMLImageElement | null;
    const dataPng = wrap.getAttribute('data-png-url');
    const pngUrl = (imgEl && imgEl.src.startsWith('data:image/')) ? imgEl.src : (dataPng && dataPng.startsWith('data:image/')) ? dataPng : '';

    if (pngUrl) {
      const containerTag = isWechat ? 'section' : 'p';
      const diagramWrap = document.createElement(containerTag);
      diagramWrap.setAttribute('style', 'display: block; margin: 14px 0 !important; padding: 6px 0; text-align: center;');
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
        sup.setAttribute('style', `color: ${primaryColor}; font-weight: bold; margin-left: 2px; font-size: 0.75em;`);
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

  // 4. Images: Clean up <figure>, remove onerror and loading attributes which WeChat/Zhihu strip
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

      const wrapTag = isWechat ? 'section' : 'p';
      const imgWrap = document.createElement(wrapTag);
      imgWrap.setAttribute('style', 'margin: 16px 0 !important; text-align: center;');
      imgWrap.appendChild(img);

      if (caption) {
        const capTag = isWechat ? 'section' : 'span';
        const capEl = document.createElement(capTag);
        capEl.setAttribute('style', 'display: block; font-size: 13px; color: #64748b; margin-top: 6px; text-align: center;');
        capEl.textContent = caption;
        imgWrap.appendChild(capEl);
      }
      fig.parentNode?.replaceChild(imgWrap, fig);
    } else {
      fig.remove();
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

  // 5. Headings
  clone.querySelectorAll('h1').forEach(el => {
    el.setAttribute(
      'style',
      `font-size: 24px; font-weight: 700; color: #111827; margin: 28px 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid ${primaryColor}; line-height: 1.35;`
    );
  });

  clone.querySelectorAll('h2').forEach(el => {
    el.setAttribute(
      'style',
      `font-size: 20px; font-weight: 600; color: #1f2937; margin: 24px 0 10px 0; padding-left: 10px; border-left: 4px solid ${primaryColor}; line-height: 1.4;`
    );
  });

  clone.querySelectorAll('h3').forEach(el => {
    el.setAttribute('style', `font-size: 17px; font-weight: 600; color: #374151; margin: 18px 0 8px 0; line-height: 1.45;`);
  });

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
    let icon = 'ℹ️';
    let titleText = '注意';

    if (isTip) {
      borderColor = '#1a7f37';
      bgColor = '#f0fbf0';
      titleColor = '#1a7f37';
      icon = '💡';
      titleText = '提示';
    } else if (isImportant) {
      borderColor = '#8250df';
      bgColor = '#fbf0ff';
      titleColor = '#8250df';
      icon = '❗️';
      titleText = '重点';
    } else if (isWarning) {
      borderColor = '#bf8700';
      bgColor = '#fff8ea';
      titleColor = '#bf8700';
      icon = '⚠️';
      titleText = '警告';
    } else if (isCaution) {
      borderColor = '#cf222e';
      bgColor = '#fff0f0';
      titleColor = '#cf222e';
      icon = '🛑';
      titleText = '危险';
    }

    const titleEl = el.querySelector('.callout-title');
    if (titleEl && titleEl.textContent?.trim()) {
      titleText = titleEl.textContent.trim();
    }
    const iconEl = el.querySelector('.callout-icon');
    if (iconEl && iconEl.textContent?.trim()) {
      icon = iconEl.textContent.trim();
    }

    // Extract body content without the header
    const bodyEl = el.querySelector('.callout-body');
    const bodyHtml = bodyEl ? bodyEl.innerHTML : el.innerHTML;

    if (isWechat) {
      // WeChat: Use <section> with inline emoji and bold title (never a block image)
      const calloutSection = document.createElement('section');
      calloutSection.className = 'md2post-callout-section';
      calloutSection.setAttribute(
        'style',
        `display: block; margin: 12px 0 14px 0 !important; padding: 12px 16px !important; background-color: ${bgColor} !important; border-left: 4px solid ${borderColor} !important; border-radius: 4px; box-sizing: border-box !important;`
      );
      calloutSection.innerHTML = `
        <section style="display: block; margin: 0 0 6px 0; line-height: 1.4;">
          <span style="display: inline-block; margin-right: 6px; font-size: 16px; vertical-align: middle;">${icon}</span>
          <strong style="color: ${titleColor}; font-size: 15px; vertical-align: middle; font-weight: 700;">${titleText}</strong>
        </section>
        <section style="display: block; margin: 0; padding: 0; color: #374151; font-size: 14.5px; line-height: 1.7;">
          ${bodyHtml}
        </section>
      `;
      calloutSection.querySelectorAll('p').forEach(p => {
        p.setAttribute('style', 'margin: 0 0 6px 0; font-size: 14.5px; line-height: 1.7; color: #374151;');
      });
      el.parentNode?.replaceChild(calloutSection, el);
    } else {
      // Toutiao / Zhihu / Universal: Use standard <blockquote> with inline emoji title
      const bq = document.createElement('blockquote');
      bq.setAttribute(
        'style',
        `display: block; margin: 14px 0; padding: 12px 16px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; color: #374151; font-size: 14.5px; line-height: 1.7;`
      );
      bq.innerHTML = `
        <p style="margin: 0 0 6px 0; font-weight: bold; color: ${titleColor}; font-size: 15px;">
          <span style="margin-right: 6px; font-size: 16px;">${icon}</span>${titleText}
        </p>
        <div style="margin: 0; padding: 0; color: #374151; font-size: 14.5px; line-height: 1.7;">
          ${bodyHtml}
        </div>
      `;
      el.parentNode?.replaceChild(bq, el);
    }
  });

  // 8. Blockquotes (standard)
  clone.querySelectorAll('blockquote:not(.md2post-callout)').forEach(el => {
    el.setAttribute(
      'style',
      `margin: 14px 0 16px 0; padding: 10px 16px; color: #475569; background-color: #f8fafc; border-left: 4px solid ${primaryColor}; border-radius: 0 6px 6px 0; font-size: 14.5px; line-height: 1.65;`
    );
  });

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
  const codePalette = getCodeThemeInlinePalette(codeThemeId);

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

  // 11.3 Platform-Specific Code Container Architecture:
  if (isZhihu) {
    // Zhihu: MUST use clean native <pre><code class="language-..."> without extra <section> wrappers or line numbers
    // Zhihu's rich text editor automatically converts standard <pre><code> into its native code block component!
    clone.querySelectorAll('.md2post-code-container').forEach(container => {
      const langEl = container.querySelector('.code-lang');
      const lang = langEl?.textContent?.trim().toLowerCase() || '';

      // Extract raw code text without line numbers
      const lineSpans = container.querySelectorAll('.line-content');
      let cleanCode = '';
      if (lineSpans.length > 0) {
        cleanCode = Array.from(lineSpans).map(s => s.textContent || '').join('\n');
      } else {
        const codeTag = container.querySelector('code');
        cleanCode = codeTag?.textContent || '';
      }

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      if (lang) {
        code.className = `language-${lang}`;
      }
      code.textContent = cleanCode;
      pre.appendChild(code);
      container.parentNode?.replaceChild(pre, container);
    });
  } else if (isWechat) {
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
        `display: block; padding: 6px 12px; background-color: ${codePalette.macHeaderBg}; border-bottom: 1px solid ${codePalette.macHeaderBorder}; box-sizing: border-box !important;`
      );
      headerSection.innerHTML = `
        <table style="width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; border-collapse: collapse !important; background: transparent !important;">
          <tbody>
            <tr>
              <td style="border: none !important; padding: 0 !important; text-align: left; vertical-align: middle;">
                <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ff5f56; margin-right: 5px; vertical-align: middle;"></span>
                <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #ffbd2e; margin-right: 5px; vertical-align: middle;"></span>
                <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background-color: #27c93f; vertical-align: middle;"></span>
              </td>
              <td style="border: none !important; padding: 0 !important; text-align: right; vertical-align: middle; font-size: 11px; text-transform: uppercase; color: #9da5b4; font-family: monospace; letter-spacing: 0.05em;">
                ${escapeHtml(lang)}
              </td>
            </tr>
          </tbody>
        </table>
      `;
      header.parentNode?.replaceChild(headerSection, header);
    });

    clone.querySelectorAll('.md2post-pre').forEach(pre => {
      const codePreSection = document.createElement('section');
      codePreSection.className = 'md2post-code-body';
      codePreSection.setAttribute(
        'style',
        `display: block; margin: 0 !important; padding: 8px 12px !important; overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; box-sizing: border-box !important; background-color: ${codePalette.preBg}; color: ${codePalette.textColor}; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13px; line-height: 1.45; white-space: pre !important; word-break: normal;`
      );
      codePreSection.innerHTML = pre.innerHTML;
      pre.parentNode?.replaceChild(codePreSection, pre);
    });

    clone.querySelectorAll('code.hljs').forEach(codeEl => {
      codeEl.setAttribute(
        'style',
        `font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 13px; line-height: 1.45; color: ${codePalette.textColor}; background-color: transparent; white-space: pre !important;`
      );
    });

    clone.querySelectorAll('.line').forEach(line => {
      line.setAttribute('style', 'display: block; line-height: 1.45; min-height: 1.45em; white-space: pre !important; margin: 0; padding: 0;');
    });

    clone.querySelectorAll('.line-num').forEach(num => {
      num.setAttribute(
        'style',
        `display: inline-block; width: 2.5em; margin-right: 0.8em; text-align: right; color: ${codePalette.lineNumColor}; user-select: none; line-height: 1.45; font-size: 12px;`
      );
    });
  } else {
    // Toutiao & Universal: Use styled <pre><code class="hljs"> with auto-wrap
    clone.querySelectorAll('.md2post-code-container').forEach(container => {
      const pre = container.querySelector('.md2post-pre');
      if (pre) {
        pre.setAttribute(
          'style',
          `margin: 14px 0; padding: 10px 14px; background-color: ${codePalette.preBg}; color: ${codePalette.textColor}; border-radius: 6px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-break: break-all;`
        );
        container.parentNode?.replaceChild(pre, container);
      }
    });

    clone.querySelectorAll('.line').forEach(line => {
      line.setAttribute('style', 'display: block; line-height: 1.45;');
    });

    clone.querySelectorAll('.line-num').forEach(num => {
      num.setAttribute(
        'style',
        `display: inline-block; width: 2.4em; margin-right: 0.8em; text-align: right; color: ${codePalette.lineNumColor}; font-size: 12px;`
      );
    });
  }

  // 12. Inline Code
  clone.querySelectorAll(':not(pre) > code').forEach(code => {
    code.setAttribute(
      'style',
      `font-family: Consolas, Monaco, monospace; font-size: 13px; padding: 2px 5px; margin: 0 2px; background-color: #f1f5f9; color: #e11d48; border-radius: 4px; border: 1px solid #e2e8f0;`
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
  clone.querySelectorAll('hr').forEach(hr => {
    hr.setAttribute('style', 'height: 1px; background-color: #e2e8f0; border: none; margin: 20px 0;');
  });

  // 15. Strip redundant whitespace text nodes between top-level block elements
  const childNodes = Array.from(clone.childNodes);
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      node.remove();
    }
  }

  // 16. Wrap in Platform-Specific Root Container:
  // WeChat: <section class="md2post-wechat-wrapper">
  // Toutiao, Zhihu, Universal: <div class="md2post-wrapper"> (Zhihu & Toutiao strip <section> tags)
  const rootTag = isWechat ? 'section' : 'div';
  const wrapper = document.createElement(rootTag);
  wrapper.className = isToutiao ? 'md2post-toutiao-wrapper' : isZhihu ? 'md2post-zhihu-wrapper' : `md2post-${platform}-wrapper`;
  wrapper.setAttribute(
    'style',
    `font-family: ${theme.fontFamily}; font-size: ${theme.fontSize}px; line-height: ${theme.lineHeight}; color: ${theme.textColor}; background-color: #ffffff; letter-spacing: 0.02em; word-break: break-word;`
  );
  wrapper.innerHTML = clone.innerHTML;

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
