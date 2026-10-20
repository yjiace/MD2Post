import React, { useRef, useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onScroll?: (scrollTopRatio: number) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  onDropFile?: (file: File) => void;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  onScroll,
  editorRef,
  onDropFile
}) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Compute line count
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
    if (onScroll) {
      const maxScroll = target.scrollHeight - target.clientHeight;
      const ratio = maxScroll > 0 ? target.scrollTop / maxScroll : 0;
      onScroll(ratio);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key: insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl+B: Bold
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end) || '加粗文本';
      const newVal = value.substring(0, start) + `**${selected}**` + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = start + 2;
        ta.selectionEnd = start + 2 + selected.length;
      }, 0);
    }

    // Ctrl+I: Italic
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end) || '斜体文本';
      const newVal = value.substring(0, start) + `*${selected}*` + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = start + 1;
        ta.selectionEnd = start + 1 + selected.length;
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type.includes('text')) {
        if (onDropFile) {
          onDropFile(file);
        }
      }
    }
  };

  return (
    <div
      className={`editor-pane ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Line Numbers Gutter with bottom padding */}
      <div className="line-numbers-gutter" ref={lineNumbersRef}>
        {lineNumbers.map(num => (
          <div key={num} className="gutter-num">
            {num}
          </div>
        ))}
      </div>

      {/* Main Textarea with ample bottom scroll margin */}
      <textarea
        ref={editorRef || localRef}
        className="editor-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="在此直接输入或粘贴 Markdown 文章内容，支持拖拽 .md 文件至此..."
        spellCheck={false}
      />

      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-message">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>释放鼠标即可导入 Markdown 文档</span>
          </div>
        </div>
      )}
    </div>
  );
};
