import React, { useRef } from 'react';
import type { AppSettings } from '../types';
import { PRESET_PRIMARY_COLORS, FONT_FAMILY_OPTIONS } from '../themes/themeDefinitions';
import { BUILT_IN_CODE_THEMES } from '../themes/codeThemes';
import { exportSettingsJson, importSettingsJson } from '../utils/exportHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importSettingsJson(file);
        onUpdateSettings(imported);
        alert('样式配置已成功导入恢复！');
      } catch (err: any) {
        alert(err.message || '导入配置失败');
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog settings-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">⚙️</span>
            <h3>排版与代码高亮详细配置</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* Section 1: Brand & Theme Color */}
          <div className="setting-section">
            <h4 className="section-title">🎨 品牌主题色联动 (US-B2)</h4>
            <p className="section-desc">调整后，文章主标题下划线、二级标题边框、引用线、表头底色、链接强调色将全自动联动更新。</p>
            <div className="color-palette-row">
              {PRESET_PRIMARY_COLORS.map(c => (
                <button
                  key={c.color}
                  className={`color-preset-dot ${settings.primaryColor === c.color ? 'active' : ''}`}
                  style={{ backgroundColor: c.color }}
                  onClick={() => onUpdateSettings({ primaryColor: c.color })}
                  title={c.name}
                />
              ))}
              <div className="custom-color-input-wrap">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => onUpdateSettings({ primaryColor: e.target.value })}
                  title="自定义任意十六进制颜色"
                />
                <span className="color-val-text">{settings.primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Typography & Sizing */}
          <div className="setting-section">
            <h4 className="section-title">✍️ 字体族与排版间距 (US-B3)</h4>
            <div className="setting-grid">
              <div className="setting-field">
                <label>字体族 (Font Family)</label>
                <select
                  className="setting-select"
                  value={settings.fontFamily}
                  onChange={e => onUpdateSettings({ fontFamily: e.target.value })}
                >
                  {FONT_FAMILY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-field">
                <label>正文字号: {settings.fontSize}px</label>
                <input
                  type="range"
                  min="14"
                  max="19"
                  step="0.5"
                  value={settings.fontSize}
                  onChange={e => onUpdateSettings({ fontSize: parseFloat(e.target.value) })}
                />
              </div>

              <div className="setting-field">
                <label>行高比例: {settings.lineHeight}</label>
                <input
                  type="range"
                  min="1.5"
                  max="2.1"
                  step="0.05"
                  value={settings.lineHeight}
                  onChange={e => onUpdateSettings({ lineHeight: parseFloat(e.target.value) })}
                />
              </div>

              <div className="setting-field">
                <label>段落间距: {settings.paragraphSpacing}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="2"
                  value={settings.paragraphSpacing}
                  onChange={e => onUpdateSettings({ paragraphSpacing: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Code Block Settings */}
          <div className="setting-section">
            <h4 className="section-title">💻 代码块高亮与外观 (US-B5, US-B6)</h4>
            <div className="setting-field" style={{ marginBottom: '14px' }}>
              <label>代码高亮配色主题 (内置 6 套)</label>
              <select
                className="setting-select"
                value={settings.codeSettings.themeId}
                onChange={e =>
                  onUpdateSettings({
                    codeSettings: { ...settings.codeSettings, themeId: e.target.value }
                  })
                }
              >
                {BUILT_IN_CODE_THEMES.map(th => (
                  <option key={th.id} value={th.id}>
                    {th.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox-options-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.codeSettings.showMacButtons}
                  onChange={e =>
                    onUpdateSettings({
                      codeSettings: { ...settings.codeSettings, showMacButtons: e.target.checked }
                    })
                  }
                />
                <span>Mac 风格三色圆点窗口装饰</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.codeSettings.showLineNumbers}
                  onChange={e =>
                    onUpdateSettings({
                      codeSettings: { ...settings.codeSettings, showLineNumbers: e.target.checked }
                    })
                  }
                />
                <span>显示代码行号</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.codeSettings.showLanguageBadge}
                  onChange={e =>
                    onUpdateSettings({
                      codeSettings: { ...settings.codeSettings, showLanguageBadge: e.target.checked }
                    })
                  }
                />
                <span>显示编程语言徽章标签</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.codeSettings.wrapLines}
                  onChange={e =>
                    onUpdateSettings({
                      codeSettings: { ...settings.codeSettings, wrapLines: e.target.checked }
                    })
                  }
                />
                <span>代码长行自动换行 (关闭则横向滚动)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Interaction Preferences */}
          <div className="setting-section">
            <h4 className="section-title">⚡ 交互偏好设置</h4>
            <div className="checkbox-options-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.syncScroll}
                  onChange={e => onUpdateSettings({ syncScroll: e.target.checked })}
                />
                <span>开启双栏同步滚动 (编辑器与右侧预览联动，默认开启)</span>
              </label>
            </div>
          </div>

          {/* Section 5: Platform Extras */}
          <div className="setting-section">
            <h4 className="section-title">🌐 平台发布偏好设置</h4>
            <div className="checkbox-options-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.convertWechatFootnotes}
                  onChange={e => onUpdateSettings({ convertWechatFootnotes: e.target.checked })}
                />
                <span>微信复制时外链自动转文末脚注 [1] (US-E6)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showImageCaptions}
                  onChange={e => onUpdateSettings({ showImageCaptions: e.target.checked })}
                />
                <span>图片 Alt 自动渲染为居中图注 (US-D4)</span>
              </label>
            </div>
          </div>

          {/* Section 5: Custom CSS */}
          <div className="setting-section">
            <div className="section-title-row">
              <h4 className="section-title">🎨 追加自定义 CSS (US-B4)</h4>
              <button
                className="text-action-btn"
                onClick={() => onUpdateSettings({ customCss: '' })}
              >
                清空自定义样式
              </button>
            </div>
            <textarea
              className="custom-css-textarea"
              value={settings.customCss}
              onChange={e => onUpdateSettings({ customCss: e.target.value })}
              placeholder="/* 在此输入个性化 CSS 样式，将直接作用于预览与导出结果 */&#10;.md2post-rendered-content h1 { font-style: italic; }"
            />
          </div>

          {/* Section 6: Team Config Share */}
          <div className="setting-section">
            <h4 className="section-title">👥 团队配置共享 (US-B7)</h4>
            <div className="config-share-row">
              <button
                className="secondary-modal-btn"
                onClick={() => exportSettingsJson(settings)}
              >
                📤 导出配置为 JSON 文件
              </button>
              <label className="secondary-modal-btn import-btn-label">
                📥 导入团队配置文件
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportConfig}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="danger-btn" onClick={onResetSettings}>
            恢复默认排版设置
          </button>
          <button className="primary-modal-btn" onClick={onClose}>
            完成并应用
          </button>
        </div>
      </div>
    </div>
  );
};
