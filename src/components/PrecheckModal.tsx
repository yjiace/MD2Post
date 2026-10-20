import React, { useState } from 'react';
import type { DiagnosticItem } from '../types';

interface PrecheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: DiagnosticItem[];
  onLocateIssue?: (snippet?: string, line?: number) => void;
}

export const PrecheckModal: React.FC<PrecheckModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  onLocateIssue
}) => {
  if (!isOpen) return null;

  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

  const filtered = diagnostics.filter(d => {
    if (filter === 'all') return true;
    return d.type === filter;
  });

  const errorCount = diagnostics.filter(d => d.type === 'error').length;
  const warningCount = diagnostics.filter(d => d.type === 'warning').length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog precheck-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🛡️</span>
            <h3>跨平台排版发布预检报告</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="precheck-summary-bar">
          <div className="summary-stat-box">
            <span className="stat-label">总体健康状况</span>
            <span className={`stat-badge ${errorCount === 0 ? 'badge-ok' : 'badge-danger'}`}>
              {errorCount === 0 ? '✅ 适宜发布' : '⚠️ 存在需关注项'}
            </span>
          </div>
          <div className="filter-pill-group">
            <button
              className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部 ({diagnostics.length})
            </button>
            <button
              className={`pill-btn ${filter === 'error' ? 'active' : ''}`}
              onClick={() => setFilter('error')}
            >
              严重错误 ({errorCount})
            </button>
            <button
              className={`pill-btn ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              优化提醒 ({warningCount})
            </button>
          </div>
        </div>

        <div className="modal-body precheck-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🎉</span>
              <h4>太棒了，未检测到任何排版问题！</h4>
              <p>文档结构严谨，各平台均可放心复制发布。</p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className={`diagnostic-card card-${item.type}`}>
                <div className="diag-header">
                  <span className={`diag-tag tag-${item.type}`}>
                    {item.type === 'error' ? '错误' : item.type === 'warning' ? '警告' : '提示'}
                  </span>
                  <span className="diag-title">{item.title}</span>
                  {item.line && <span className="diag-line">第 {item.line} 行</span>}
                </div>
                <div className="diag-detail">{item.detail}</div>
                {item.sourceSnippet && (
                  <div className="diag-snippet">
                    <code>{item.sourceSnippet}</code>
                  </div>
                )}
                {onLocateIssue && (item.line || item.sourceSnippet) && (
                  <div className="diag-actions">
                    <button
                      className="locate-btn"
                      onClick={() => {
                        onLocateIssue(item.sourceSnippet, item.line);
                        onClose();
                      }}
                    >
                      定位到对应行
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-tip">
            提示：复制到微信公众号请确认图片已部署在公网 CDN 且无防盗链限制。
          </span>
          <button className="primary-modal-btn" onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
