/**
 * CSDN 专用 Markdown 语法与结构适配器
 * 适配 CSDN Markdown 编辑器规范，修复防盗链图片失效、引用块断裂与连续代码块合并问题
 */

const KNOWN_ANTILEECH_HOSTS = [
  'mmbiz.qpic.cn',
  'qpic.cn',
  'zhimg.com',
  'zhihu.com',
  'upload-images.jianshu.io',
  'jianshu.io',
  'toutiaoimg.com',
  'byteimg.com',
  'csdnimg.cn'
];

/**
 * 判断图片 URL 是否可能存在防盗链限制
 */
export function isLikelyAntiLeechImage(url: string): boolean {
  try {
    const fullUrl = url.startsWith('//') ? 'https:' + url : url;
    const parsed = new URL(fullUrl);
    return KNOWN_ANTILEECH_HOSTS.some(host => parsed.hostname.includes(host));
  } catch {
    return false;
  }
}

/**
 * 对 Markdown 正文进行针对 CSDN 的深度优化转换
 */
export function adaptMarkdownForCsdn(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];

  let inCode = false;
  let inBq = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const isCodeFence = /^[ \t]*```/.test(line);

    if (isCodeFence) {
      if (!inCode) {
        inCode = true;
      } else {
        inCode = false;
        result.push(line);

        // 避免 CSDN Markdown 编辑器将相邻连续的两个代码块合并为一个
        let nextNonEmptyIdx = -1;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim()) {
            nextNonEmptyIdx = j;
            break;
          }
        }
        if (nextNonEmptyIdx !== -1 && /^[ \t]*```/.test(lines[nextNonEmptyIdx])) {
          result.push('');
          result.push('\u200B');
          result.push('');
          i = nextNonEmptyIdx - 1;
        }
        continue;
      }
    }

    // 在代码块之外处理图片与引用语法
    if (!inCode) {
      // 1. 将外链/防盗链图片转写为带有 referrerpolicy="no-referrer" 的 HTML <img> 标签
      // CSDN Markdown 编辑器原生支持内联 HTML <img> 标签并保留属性，从而完全避开防盗链拦截
      const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
      if (imgRegex.test(line)) {
        line = line.replace(imgRegex, (_match, alt, url) => {
          let cleanUrl = (url || '').trim();
          if (cleanUrl.startsWith('//')) {
            cleanUrl = 'https:' + cleanUrl;
          }
          const escapedAlt = alt ? alt.replace(/"/g, '&quot;') : '';
          return `<img src="${cleanUrl}" alt="${escapedAlt}" referrerpolicy="no-referrer" style="max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 4px;" />`;
        });
      }

      // 2. 转换 GitHub Alert 语法（[!NOTE] 等）为 CSDN 良好兼容的带图注引用块
      const isBqLine = /^[ \t]*>/.test(line);
      if (isBqLine) {
        inBq = true;
        const bqMatch = line.match(/^([ \t]*>[ \t]*)(.*)$/);
        const prefix = bqMatch ? bqMatch[1] : '> ';
        const content = bqMatch ? bqMatch[2] : '';

        const alertMatch = content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(.*)$/i);
        if (alertMatch) {
          const type = alertMatch[1].toUpperCase();
          const badge = `**${type}**`;

          const rawRest = (alertMatch[2] || '').trim().replace(/^[：:\s]+/, '').replace(/[:：]+$/, '');
          if (rawRest) {
            line = `${prefix}${badge}\n${prefix}${rawRest}`;
          } else {
            line = `${prefix}${badge}`;
          }
        } else {
          // 列表保护：避免 CSDN 引用块内嵌套列表语法产生换行截断
          const listMatch = content.match(/^(\d+)\.[ \t]+(.*)$/);
          const bulletMatch = content.match(/^[-*][ \t]+(.*)$/);
          if (listMatch) {
            line = `${prefix}${listMatch[1]}、${listMatch[2]}`;
          } else if (bulletMatch) {
            line = `${prefix}• ${bulletMatch[1]}`;
          }
        }
      } else {
        if (!line.trim()) {
          inBq = false;
        }
      }

      // 3. 保护引用块内部连续换行（软换行末尾追加 2 个空格强制硬换行）
      if (inBq && line.trim()) {
        const nextLine = lines[i + 1];
        if (nextLine !== undefined) {
          const isNextNewItem = /^[ \t]*>[ \t]*(📌|•|\d+、|[💡ℹ️⚠️📌🚨]|[*_]{2}|-|\d+\.)/.test(nextLine);
          if (isNextNewItem && !line.endsWith('  ')) {
            line = line + '  ';
          }
        }
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

