/**
 * Line-based synchronized scrolling between editor textarea and preview container.
 * Uses exact textarea mirror measurement + Markdown source landmarks for pixel-accurate alignment.
 */

// Cache of line offsets for editor to avoid recalculating on every scroll frame
let cachedLineTops: number[] = [];
let cachedContent: string = '';
let cachedClientWidth: number = 0;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getEditorLineTops(editor: HTMLTextAreaElement): number[] {
  const content = editor.value;
  const width = editor.clientWidth;

  if (cachedLineTops.length > 0 && content === cachedContent && width === cachedClientWidth) {
    return cachedLineTops;
  }

  let mirror = document.getElementById('md2post-scroll-mirror') as HTMLDivElement;
  if (!mirror) {
    mirror = document.createElement('div');
    mirror.id = 'md2post-scroll-mirror';
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.pointerEvents = 'none';
    mirror.style.left = '-9999px';
    mirror.style.top = '-9999px';
    document.body.appendChild(mirror);
  }

  const computed = window.getComputedStyle(editor);
  mirror.style.width = `${width}px`;
  mirror.style.fontFamily = computed.fontFamily;
  mirror.style.fontSize = computed.fontSize;
  mirror.style.lineHeight = computed.lineHeight;
  mirror.style.paddingTop = computed.paddingTop;
  mirror.style.paddingBottom = computed.paddingBottom;
  mirror.style.paddingLeft = computed.paddingLeft;
  mirror.style.paddingRight = computed.paddingRight;
  mirror.style.boxSizing = computed.boxSizing;
  mirror.style.whiteSpace = computed.whiteSpace;
  mirror.style.wordBreak = computed.wordBreak;
  mirror.style.overflowWrap = computed.overflowWrap;

  const lines = content.split('\n');
  mirror.innerHTML = lines
    .map((l, i) => `<div data-idx="${i + 1}" style="min-height: ${computed.lineHeight};">${escapeHtml(l) || '&nbsp;'}</div>`)
    .join('');

  const tops: number[] = [];
  const children = mirror.children;
  for (let i = 0; i < children.length; i++) {
    tops.push((children[i] as HTMLElement).offsetTop);
  }

  cachedLineTops = tops;
  cachedContent = content;
  cachedClientWidth = width;

  return tops;
}

interface Landmark {
  line: number;
  editorTop: number;
  previewTop: number;
}

function getLandmarks(editor: HTMLTextAreaElement, previewContainer: HTMLElement): Landmark[] {
  const lineTops = getEditorLineTops(editor);
  const elements = Array.from(previewContainer.querySelectorAll<HTMLElement>('[data-line]'));

  const containerRect = previewContainer.getBoundingClientRect();
  const landmarks: Landmark[] = [];

  for (const el of elements) {
    const line = parseInt(el.getAttribute('data-line') || '0', 10);
    if (line > 0 && line <= lineTops.length) {
      const elRect = el.getBoundingClientRect();
      const previewTop = elRect.top - containerRect.top + previewContainer.scrollTop;
      const editorTop = lineTops[line - 1];
      landmarks.push({ line, editorTop, previewTop });
    }
  }

  return landmarks.sort((a, b) => a.editorTop - b.editorTop);
}

export function syncEditorToPreview(
  editor: HTMLTextAreaElement,
  previewContainer: HTMLElement
) {
  const editorScrollTop = editor.scrollTop;
  const editorMaxScroll = editor.scrollHeight - editor.clientHeight;
  const previewMaxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;

  if (editorMaxScroll <= 0 || previewMaxScroll <= 0) return;

  if (editorScrollTop <= 4) {
    previewContainer.scrollTop = 0;
    return;
  }
  if (editorScrollTop >= editorMaxScroll - 6) {
    previewContainer.scrollTop = previewMaxScroll;
    return;
  }

  const landmarks = getLandmarks(editor, previewContainer);
  if (landmarks.length === 0) {
    const ratio = editorScrollTop / editorMaxScroll;
    previewContainer.scrollTop = ratio * previewMaxScroll;
    return;
  }

  // Find bounding landmarks
  let prev: Landmark = { line: 1, editorTop: 0, previewTop: 0 };
  let next: Landmark = { line: 999999, editorTop: editorMaxScroll, previewTop: previewMaxScroll };

  for (let i = 0; i < landmarks.length; i++) {
    if (landmarks[i].editorTop <= editorScrollTop) {
      prev = landmarks[i];
    } else {
      next = landmarks[i];
      break;
    }
  }

  const editorSpan = next.editorTop - prev.editorTop;
  const progress = editorSpan > 0 ? (editorScrollTop - prev.editorTop) / editorSpan : 0;
  const targetPreviewTop = prev.previewTop + progress * (next.previewTop - prev.previewTop);

  previewContainer.scrollTop = Math.max(0, Math.min(previewMaxScroll, targetPreviewTop));
}

export function syncPreviewToEditor(
  previewContainer: HTMLElement,
  editor: HTMLTextAreaElement
) {
  const previewScrollTop = previewContainer.scrollTop;
  const previewMaxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
  const editorMaxScroll = editor.scrollHeight - editor.clientHeight;

  if (previewMaxScroll <= 0 || editorMaxScroll <= 0) return;

  if (previewScrollTop <= 4) {
    editor.scrollTop = 0;
    return;
  }
  if (previewScrollTop >= previewMaxScroll - 6) {
    editor.scrollTop = editorMaxScroll;
    return;
  }

  const landmarks = getLandmarks(editor, previewContainer);
  if (landmarks.length === 0) {
    const ratio = previewScrollTop / previewMaxScroll;
    editor.scrollTop = ratio * editorMaxScroll;
    return;
  }

  let prev: Landmark = { line: 1, editorTop: 0, previewTop: 0 };
  let next: Landmark = { line: 999999, editorTop: editorMaxScroll, previewTop: previewMaxScroll };

  for (let i = 0; i < landmarks.length; i++) {
    if (landmarks[i].previewTop <= previewScrollTop) {
      prev = landmarks[i];
    } else {
      next = landmarks[i];
      break;
    }
  }

  const previewSpan = next.previewTop - prev.previewTop;
  const progress = previewSpan > 0 ? (previewScrollTop - prev.previewTop) / previewSpan : 0;
  const targetEditorTop = prev.editorTop + progress * (next.editorTop - prev.editorTop);

  editor.scrollTop = Math.max(0, Math.min(editorMaxScroll, targetEditorTop));
}
