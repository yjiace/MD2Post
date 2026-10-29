import type { DiagnosticItem } from '../types';
import { isLikelyAntiLeechImage } from '../platforms/csdnAdapter';

export function runPrecheck(markdownContent: string, renderedContainer?: HTMLElement | null): DiagnosticItem[] {
  const issues: DiagnosticItem[] = [];

  // 1. Table columns check (> 5 columns warning)
  const lines = markdownContent.split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const colCount = trimmed.split('|').filter(c => c.trim().length > 0).length;
      if (colCount > 5) {
        // Only warn once per table block
        const alreadyWarned = issues.some(i => i.category === 'table' && Math.abs((i.line || 0) - (index + 1)) < 8);
        if (!alreadyWarned) {
          issues.push({
            id: `table-wide-${index}`,
            type: 'warning',
            category: 'table',
            title: `检测到 ${colCount} 列超宽表格`,
            detail: '移动端或微信排版下超宽表格可能导致文字压缩换行，已自动为您开启响应式横向滑动容器。',
            line: index + 1,
            sourceSnippet: trimmed.slice(0, 60) + '...'
          });
        }
      }
    }
  });

  // 2. Math Formula syntax check
  const mathBlockMatches = markdownContent.match(/\$\$([\s\S]+?)\$\$/g);
  if (mathBlockMatches) {
    mathBlockMatches.forEach((m, idx) => {
      const openBraces = (m.match(/\{/g) || []).length;
      const closeBraces = (m.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({
          id: `math-err-${idx}`,
          type: 'error',
          category: 'math',
          title: '数学公式大括号不匹配',
          detail: '公式中的 "{" 与 "}" 数量不一致，可能导致渲染失败。',
          sourceSnippet: m.slice(0, 50) + '...'
        });
      }
    });
  }

  // 3. Images check (relative protocol, empty alt, or local paths)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let imgMatch;
  let imgIdx = 1;
  while ((imgMatch = imageRegex.exec(markdownContent)) !== null) {
    const alt = imgMatch[1];
    const url = imgMatch[2];

    if (!alt.trim()) {
      issues.push({
        id: `img-alt-${imgIdx}`,
        type: 'info',
        category: 'image',
        title: `第 ${imgIdx} 张图片缺少 Alt 描述`,
        detail: '为图片添加描述有利于图注显示与搜索引擎可访问性。',
        sourceSnippet: imgMatch[0]
      });
    }

    const cleanUrl = url.trim();
    const isProtocolRelative = cleanUrl.startsWith('//');
    const isHttp = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
    const isDataUri = cleanUrl.startsWith('data:image/');
    const isLocal = !isHttp && !isProtocolRelative && !isDataUri && (
      cleanUrl.startsWith('file://') ||
      /^[a-zA-Z]:\\/.test(cleanUrl) ||
      cleanUrl.startsWith('./') ||
      cleanUrl.startsWith('../') ||
      (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//'))
    );

    if (isLocal) {
      issues.push({
        id: `img-local-${imgIdx}`,
        type: 'error',
        category: 'image',
        title: `第 ${imgIdx} 张图片使用了本地私有路径`,
        detail: '本地路径在发布到微信/CSDN/知乎平台后读者无法加载，请上传至公开 CDN 或在线图床。',
        sourceSnippet: imgMatch[0]
      });
    } else if (isLikelyAntiLeechImage(cleanUrl)) {
      issues.push({
        id: `img-antileech-${imgIdx}`,
        type: 'info',
        category: 'image',
        title: `第 ${imgIdx} 张图片来自第三方防盗链图床`,
        detail: '检测到微信/知乎等可能存在防盗链的外部图床，已自动为您启用防盗链穿透（referrerpolicy=no-referrer），可放心复制至 CSDN 发布。',
        sourceSnippet: imgMatch[0]
      });
    }
    imgIdx++;
  }

  // 4. Mermaid syntax & declaration check
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)```/g;
  let mMatch;
  let mIdx = 1;
  while ((mMatch = mermaidRegex.exec(markdownContent)) !== null) {
    const code = mMatch[1].trim();
    if (!code) {
      issues.push({
        id: `mermaid-empty-${mIdx}`,
        type: 'warning',
        category: 'mermaid',
        title: `第 ${mIdx} 个 Mermaid 图表内容为空`,
        detail: '代码块内未定义任何图表语法，请补充图表定义。',
        sourceSnippet: mMatch[0]
      });
    } else {
      const firstLine = code.split('\n')[0].trim();
      const validTypes = [
        'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'gantt', 'pie',
        'quadrantChart', 'mindmap', 'timeline', 'gitGraph', 'sankey', 'journey'
      ];
      const hasValidStart = validTypes.some(vt => firstLine.startsWith(vt));
      if (!hasValidStart) {
        issues.push({
          id: `mermaid-syntax-${mIdx}`,
          type: 'error',
          category: 'mermaid',
          title: `第 ${mIdx} 个 Mermaid 图表声明无效`,
          detail: `首行 "${firstLine.slice(0, 30)}" 不是已知的 Mermaid 图表关键字（如 flowchart, sequenceDiagram 等）。`,
          sourceSnippet: mMatch[0]
        });
      }
    }
    mIdx++;
  }

  // 5. Unclosed Code Block check
  const backtickMatches = markdownContent.match(/^```/gm);
  if (backtickMatches && backtickMatches.length % 2 !== 0) {
    issues.push({
      id: 'unclosed-code-block',
      type: 'error',
      category: 'syntax',
      title: '存在未闭合的代码块 (```)',
      detail: '检测到奇数个三反引号 ```，可能导致下方正文全部被吞进代码块中。',
      sourceSnippet: '```'
    });
  }

  // 6. Check DOM for failed images or Mermaid errors if container exists
  if (renderedContainer) {
    const errorImgs = renderedContainer.querySelectorAll('img[data-failed="true"]');
    errorImgs.forEach((img, idx) => {
      issues.push({
        id: `dom-img-err-${idx}`,
        type: 'error',
        category: 'image',
        title: '网络图片加载失败',
        detail: `图片无法访问: ${(img as HTMLImageElement).src}`,
        sourceSnippet: (img as HTMLImageElement).src
      });
    });

    const mermaidErrors = renderedContainer.querySelectorAll('.md2post-mermaid-error');
    mermaidErrors.forEach((errEl, idx) => {
      issues.push({
        id: `dom-mermaid-err-${idx}`,
        type: 'error',
        category: 'mermaid',
        title: 'Mermaid 图表渲染异常',
        detail: errEl.textContent || '图表语法存在格式错误，请检查节点与连接线。'
      });
    });
  }

  return issues;
}
