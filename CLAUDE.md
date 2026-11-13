- 目的：制作适合 SNS 传播、介绍旅游信息的几十秒小短片。
- 形式：HTML 动画。
- 交付：提供可以直接打开、播放的 HTML。
- 参考作品：`viz/summer/nagaoka-hanabi-a.html`（长冈花火 A）。

字体与设计语言：参考但不限定

- 中文：思源黑体（Source Han Sans），简体使用 SC，繁体使用 TC。
- 英文与数字：Sora。
- 设计语言：现代、简洁、有电影感。以画面为主体，文字作为叙事辅助。
- 排版参考长冈花火：左上角地名与标题、标题下方的动态旁白、中下方的大字与补充信息。
- 字体通过字重、字号和字距建立层次；标题可使用金属质感与场景光影。
- 色彩以暖白、雾蓝为基础，金色用于强调，具体配色随画面调整。
- 参考画布比例：9:16，1080×1920。

已有工具：

- `viz/tools/inspect-animation.cjs`：无需依赖截图，通过渲染采样、像素哈希、运行状态和错误检测检查动画。
- 使用说明：`docs/AI_INSPECTION.md`。
- `viz/tools/record.js`：把动画整片录成 MP4（需要 `window.render(t)`、`LOOP_SECONDS`、`?record`）。
- `viz/tools/export-pages.cjs`：按 `PLAN` 逐页导出循环 GIF + 静帧 PNG，适合发图集让人左右切。用法：`node viz/tools/export-pages.cjs <页面.html> <输出目录> [宽度=720] [fps=12]`。
