import React from 'react';
import type { MindMapNode } from '../types';

interface MindMapRendererProps {
  nodes: MindMapNode[];
  title?: string;
  primaryColor?: string;
}

export const MindMapRenderer: React.FC<MindMapRendererProps> = ({
  nodes,
  title = '文章核心知识图谱',
  primaryColor = '#0969da'
}) => {
  if (!nodes || nodes.length === 0) return null;

  // Flatten tree for tree layout visualization
  return (
    <div className="md2post-mindmap-card">
      <div className="mindmap-header">
        <div className="mindmap-title-row">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={primaryColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="mindmap-title">{title}</span>
        </div>
        <span className="mindmap-badge" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
          知识图谱
        </span>
      </div>

      <div className="mindmap-content">
        {nodes.map(node => (
          <MindMapNodeItem key={node.id} node={node} primaryColor={primaryColor} isRoot={true} />
        ))}
      </div>
    </div>
  );
};

const MindMapNodeItem: React.FC<{
  node: MindMapNode;
  primaryColor: string;
  isRoot?: boolean;
}> = ({ node, primaryColor, isRoot }) => {
  return (
    <div className={`mindmap-node-block ${isRoot ? 'node-root' : 'node-child'}`}>
      <div
        className="mindmap-node-pill"
        style={{
          borderLeftColor: isRoot ? primaryColor : undefined,
          background: isRoot ? `${primaryColor}0d` : '#f8fafc'
        }}
      >
        <span
          className="node-dot"
          style={{
            backgroundColor: isRoot ? primaryColor : '#94a3b8'
          }}
        />
        <span className="node-text">{node.text}</span>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="mindmap-children-list">
          {node.children.map(child => (
            <MindMapNodeItem key={child.id} node={child} primaryColor={primaryColor} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
};
