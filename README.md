# MD2Post（Markdown 多平台排版工具）

> 一键将 Markdown 技术博客文章优雅转换为**微信公众号、头条号、掘金、知乎**等主流内容平台的排版工具。
> 纯前端离线架构，零服务器依赖，可直接托管部署于腾讯云 EdgeOne Pages。

---

## ✨ 核心特性

- **多平台智能适配引擎**：
  - **微信公众号**：排版 CSS 全量内联化注入（Inline Style），外链全自动转换为文末带标号的“参考资料与引用链接”脚注（`[1] 标题: URL`），Mermaid 图与脑图矢量化兼容。
  - **头条号**：兼容真实原生表格，代码块降级为防溢出等宽块，保留超链接。
  - **掘金**：一键切换为适配后的 Markdown 格式，清洗非标标签，原生表格与高亮保留。
  - **知乎专栏**：适配知乎富文本专栏结构，支持 LaTeX 数学公式与精美真实表格。
- **特色技术博客语法支持**：
  - **文首元信息头（Frontmatter）自动剥离**：自动识别文首 `---` 元数据块，不进入预览与复制结果，正文分隔线不受干扰。
  - **文首知识图谱组件（MindMapFloat）**：识别 `<MindMapFloat>` 标签内树形缩进数据，渲染为高颜值的静态思维导图，提供一键显示/隐藏开关。
  - **GitHub 风格 5 类提示框（Callouts）**：支持 `> [!NOTE]`、`> [!TIP]`、`> [!IMPORTANT]`、`> [!WARNING]`、`> [!CAUTION]`（大小写不敏感），各具独特语义图标、背景与强调边框，内含复杂列表、代码均可完整渲染。
  - **Mermaid 五类图表**：流程图（flowchart/graph）、甘特图（gantt）、时间线（timeline）、脑图（mindmap），语法错误原位高亮降级，支持单独一键导出 SVG。
  - **KaTeX 数学公式**：行内公式 `$E=mc^2$` 与块级公式 `$$\sum...$$` 极速渲染。
  - **CDN 协议相对路径图片**：自动将 `//cdn.xxx/image.png` 补全为 `https://`，支持 Alt 文本居中图注。
  - **全响应式宽表**：防溢出横滚容器，多列宽表移动端绝不撑破版心。
  - **盘古之白排版优化**：一键在中英文、数字与符号间规范化插入空格与标点修正。
- **现代化视觉与主题系统**：
  - 内置 5 套精美排版主题（经典技术蓝、极简石墨黑、活力前沿紫、墨绿自然护眼、暖阳琥珀橙）。
  - 品牌主题色全联动（标题边框、引用竖线、表头底色、链接强调色一键联动改变）。
  - 内置 6 套主流代码高亮配色（One Dark, GitHub Light, VS Code Dark+, Dracula, Solarized Light, Monokai Pro）。
  - Mac 风格三色圆点装饰、代码行号、语言徽章、长行折行/横滚自由切换。
  - 桌面宽度 / 375px 真实手机端视口自由切换。
- **安全与发布辅助**：
  - **排版预检报告（Pre-check）**：复制前智能排查超宽表、失效图片、公式异常并支持行号定位。
  - **本地数据安全保障**：所有草稿数据仅保存在用户浏览器的 `LocalStorage` 中，零数据上传，彻底保护文章隐私。
  - **文件导入与导出**：支持拖拽导入 `.md` 文件，支持导出 `.md`、独立含样式 `.html`、配置文件 `.json`。

---

## 🚀 本地开发与构建

### 1. 安装依赖
```bash
npm install
```

### 2. 启动本地开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:5173/](http://localhost:5173/) 即可使用。

### 3. 构建生产纯静态产物
```bash
npm run build
```
构建产物输出于 `dist/` 目录，为纯静态 HTML/CSS/JS 文件。

---

## ☁️ 腾讯云 EdgeOne Pages 部署指南

MD2Post 为纯前端单页应用（SPA），专为腾讯云 EdgeOne Pages 及边缘全球 CDN 优化：

### 部署步骤：
1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)。
2. 进入 **Pages（静态网站托管）**，点击 **新建项目**。
3. 关联代码仓库（GitHub / GitLab / Gitee）或直接上传打包后的 `dist/` 文件夹：
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
   - **Node.js 版本**：选择 18+ 或 20+
4. **自定义域名与 HTTPS（必须配置）**：
   - 绑定用户独立域名，并在 EdgeOne 中一键申请免费 SSL 证书。
   - > [!IMPORTANT] 浏览器 Clipboard API 写入富文本时强制要求安全上下文（`https://` 或 `localhost`），生产环境必须开启全站 HTTPS。
5. **边缘缓存与单页路由规则**：
   - 静态资源 `assets/*` 设置长效缓存（如 `Cache-Control: public, max-age=31536000, immutable`）。
   - HTML 页面设置无缓存（`Cache-Control: no-cache`），确保新版发布秒级生效。
   - 配置 404 重定向至 `index.html`（SPA 路由兜底）。

---

## 📄 授权与鸣谢

本项目遵循 MIT 开源许可协议。
感谢 `markdown-it`, `highlight.js`, `katex`, `mermaid`, `lucide-react` 等优秀开源项目支持。
