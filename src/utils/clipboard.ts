/**
 * Robust Cross-Browser Clipboard copy utility for HTML and PlainText
 */
export async function copyRichTextToClipboard(htmlContent: string, plainText: string): Promise<boolean> {
  // Method 1: Modern navigator.clipboard.write with ClipboardItem
  if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
    try {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new window.ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      console.warn('ClipboardItem copy failed, falling back to selection copy:', err);
    }
  }

  // Method 2: Fallback with temporary contenteditable element
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.opacity = '0';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const success = document.execCommand('copy');

    if (selection) {
      selection.removeAllRanges();
    }
    document.body.removeChild(container);

    if (success) return true;
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
  }

  // Method 3: Plain text copy fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch (err) {
      console.error('writeText fallback failed:', err);
    }
  }

  return false;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed:', err);
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
