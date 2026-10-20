/**
 * SVG to High-Resolution PNG Data URL Rasterizer
 * Essential for WeChat, Toutiao, and Zhihu rich-text pasting,
 * since these platforms strip or black-out raw vector SVG tags.
 */

export function svgToPngDataUrl(svgStringOrElement: string | SVGElement): Promise<string> {
  return new Promise(resolve => {
    try {
      let rawSvg = '';
      let naturalW = 0;
      let naturalH = 0;

      if (typeof svgStringOrElement === 'string') {
        rawSvg = svgStringOrElement.trim();
      } else {
        if (svgStringOrElement.getBoundingClientRect) {
          const rect = svgStringOrElement.getBoundingClientRect();
          if (rect.width > 20 && rect.height > 20) {
            naturalW = rect.width;
            naturalH = rect.height;
          }
        }
        rawSvg = new XMLSerializer().serializeToString(svgStringOrElement).trim();
      }

      if (!rawSvg) {
        resolve('');
        return;
      }

      // Parse with DOMParser for reliable XML tree manipulation
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (!svgEl) {
        resolve('');
        return;
      }

      // 1. Determine natural dimensions from viewBox or attributes
      if (!naturalW || !naturalH) {
        const viewBox = svgEl.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
          if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
            naturalW = parts[2];
            naturalH = parts[3];
          }
        }
      }

      if (!naturalW || !naturalH) {
        const wAttr = parseFloat(svgEl.getAttribute('width') || '0');
        const hAttr = parseFloat(svgEl.getAttribute('height') || '0');
        if (wAttr > 0) naturalW = wAttr;
        if (hAttr > 0) naturalH = hAttr;
      }

      if (!naturalW || naturalW <= 0) naturalW = 750;
      if (!naturalH || naturalH <= 0) naturalH = 450;

      // 2. Set explicit width, height and namespaces on root <svg>
      svgEl.setAttribute('width', String(Math.round(naturalW)));
      svgEl.setAttribute('height', String(Math.round(naturalH)));
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgEl.removeAttribute('style');

      // 3. Convert any lingering <foreignObject> to <text> to avoid canvas security tainting
      svgEl.querySelectorAll('foreignObject').forEach(fo => {
        const text = fo.textContent?.trim() || '';
        if (text) {
          const textNode = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
          textNode.textContent = text;
          textNode.setAttribute('text-anchor', 'middle');
          textNode.setAttribute('dominant-baseline', 'central');
          const x = parseFloat(fo.getAttribute('x') || '0');
          const y = parseFloat(fo.getAttribute('y') || '0');
          const w = parseFloat(fo.getAttribute('width') || '0');
          const h = parseFloat(fo.getAttribute('height') || '0');
          textNode.setAttribute('x', String(x + w / 2));
          textNode.setAttribute('y', String(y + h / 2));
          textNode.setAttribute('fill', '#1f2937');
          textNode.setAttribute('font-size', '13px');
          textNode.setAttribute('font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
          fo.parentNode?.replaceChild(textNode, fo);
        } else {
          fo.remove();
        }
      });

      const serializedSvg = new XMLSerializer().serializeToString(doc.documentElement);

      // 4. Encode as Base64 Data URL (immune to Blob URL cross-origin / lifecycle bugs)
      const base64Data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(serializedSvg)));

      const img = new Image();

      img.onload = () => {
        try {
          const scale = 2; // 2x Retina resolution for sharp diagrams
          const canvasW = Math.max(Math.round(naturalW * scale), 200);
          const canvasH = Math.max(Math.round(naturalH * scale), 100);

          const canvas = document.createElement('canvas');
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Fill with pure white background so WeChat / Toutiao won't render transparent black boxes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.drawImage(img, 0, 0, canvasW, canvasH);

            const png = canvas.toDataURL('image/png');
            resolve(png);
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterize warning:', e);
        }
        resolve('');
      };

      img.onerror = e => {
        console.warn('Image rasterize load failed for SVG:', e);
        resolve('');
      };

      img.src = base64Data;
    } catch (err) {
      console.warn('svgToPngDataUrl unexpected error:', err);
      resolve('');
    }
  });
}
