import type { AppSettings } from '../types';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMarkdown(content: string, title: string = 'article') {
  const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '_').trim() || 'article';
  downloadFile(content, `${cleanTitle}.md`, 'text/markdown;charset=utf-8');
}

export function exportHtml(htmlBody: string, title: string = 'article', styles: string = '') {
  const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '_').trim() || 'article';
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle}</title>
  <style>
    body {
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
      background: #fdfdfd;
    }
    ${styles}
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  downloadFile(fullHtml, `${cleanTitle}.html`, 'text/html;charset=utf-8');
}

export function exportSettingsJson(settings: AppSettings) {
  const jsonStr = JSON.stringify(settings, null, 2);
  downloadFile(jsonStr, 'md2post-settings.json', 'application/json;charset=utf-8');
}

export function importSettingsJson(file: File): Promise<AppSettings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch (err) {
        reject(new Error('配置文件格式错误，请选择有效的 md2post-settings.json 文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
