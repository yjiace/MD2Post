import React, { useState } from 'react';
import type { ArticleItem } from '../types';

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: ArticleItem[];
  activeId: string;
  onSelectArticle: (id: string) => void;
  onCreateArticle: () => void;
  onRenameArticle: (id: string, newTitle: string) => void;
  onDeleteArticle: (id: string) => void;
  onClearAll: () => void;
}

export const ArticlesModal: React.FC<ArticlesModalProps> = ({
  isOpen,
  onClose,
  articles,
  activeId,
  onSelectArticle,
  onCreateArticle,
  onRenameArticle,
  onDeleteArticle,
  onClearAll
}) => {
  if (!isOpen) return null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (art: ArticleItem) => {
    setEditingId(art.id);
    setEditingTitle(art.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameArticle(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (articles.length <= 1) {
      alert('请保留至少一篇文章草稿！');
      return;
    }
    if (window.confirm(`确定要删除文章《${title}》吗？此操作不可逆。`)) {
      onDeleteArticle(id);
    }
  };

  const handleClear = () => {
    if (window.confirm('警告：确定要清空本地所有文章草稿和排版设置吗？数据仅保存在当前浏览器，删除后无法恢复！')) {
      onClearAll();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog articles-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📚</span>
            <h3>本地文章草稿管理</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="articles-toolbar">
          <button className="primary-modal-btn create-art-btn" onClick={onCreateArticle}>
            + 新建文章
          </button>
          <span className="privacy-badge">🔒 隐私说明：数据仅存本地浏览器 LocalStorage，不上传任何服务器</span>
        </div>

        <div className="modal-body articles-list">
          {articles.map(art => {
            const isActive = art.id === activeId;
            const isEditing = art.id === editingId;

            return (
              <div key={art.id} className={`article-item-card ${isActive ? 'active' : ''}`}>
                <div className="art-item-main" onClick={() => onSelectArticle(art.id)}>
                  {isEditing ? (
                    <div className="art-rename-row" onClick={e => e.stopPropagation()}>
                      <input
                        className="rename-input"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveRename(art.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button className="save-btn" onClick={() => handleSaveRename(art.id)}>
                        保存
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="art-title-row">
                        <span className="art-title">{art.title}</span>
                        {isActive && <span className="active-tag">当前编辑中</span>}
                      </div>
                      <div className="art-meta-row">
                        <span>{art.content.length} 字符</span>
                        <span className="meta-sep">•</span>
                        <span>更新于 {new Date(art.updatedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="art-actions">
                    <button
                      className="art-action-btn"
                      onClick={() => handleStartRename(art)}
                      title="重命名文章"
                    >
                      ✏️ 重命名
                    </button>
                    <button
                      className="art-action-btn delete-btn"
                      onClick={() => handleDelete(art.id, art.title)}
                      title="删除文章"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modal-footer articles-footer">
          <button className="danger-btn" onClick={handleClear} title="清除本地所有缓存">
            清空全部本地数据
          </button>
          <button className="secondary-modal-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
