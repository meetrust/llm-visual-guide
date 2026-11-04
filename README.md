# 大模型可视化学习指南 · LLM Zero to One

以 Andrej Karpathy 的七个开源仓库（micrograd、nn-zero-to-hero、minbpe、nanoGPT、llm.c、nanochat、autoresearch）为主线，把“从零构建大模型”整理成一份可视化学习手册，内容包括依赖图谱、模块拆解、多维对比、数据看板和 17 周学习路线。

在线访问：https://meetrust.github.io/llm-visual-guide/

## 项目结构

```
index.html                     单文件页面（HTML + CSS + JS；图表全部为原生 HTML/CSS + 内联 SVG，只有 Google Fonts 走 CDN）
docs/handbook.md               同内容的 Markdown 版手册
tools/audit.js                 交付前的自动审计脚本（Playwright）
.github/workflows/deploy-pages.yml   推送到 main 后自动部署到 GitHub Pages
```

页面没有构建步骤，`index.html` 就是最终产物。

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/
```

## 部署

推送到 `main` 分支后，GitHub Actions 会把 `index.html` 打包并发布到 GitHub Pages；也可以在 Actions 页面手动运行 “Deploy to GitHub Pages”。

## 审计

```bash
npm i -D playwright
node tools/audit.js http://localhost:8000/ 1440   # 桌面宽度
node tools/audit.js http://localhost:8000/ 390    # 手机宽度
```

脚本会检查中英文排版、字符图标、元素尺寸、截断、横向溢出、锚点与外链、图表编号和数据一致性。

## 设计

页面遵循 Tight Surface 设计规范（暗夜底色、单一琥珀强调色、信息优先），与[《斯坦福 AI 课程地图》](https://meetrust.github.io/stanford-ai-courses/)属于同一设计系列。

数据核对于 2026-11-02；Star 数取自 GitHub 仓库页，耗时、难度和预算为经验估计。
