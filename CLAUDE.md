# Niigata Mini Animations · 项目导航

## AI 协作

2026-11-10，Chen 撤销此前对 AI 的项目级改动限制。AI 可围绕当前任务自主调整画面、文案、排版、字体、声音、音乐、镜头、时长、循环、架构、依赖与技术栈，并选择适合的验证和交付方式。

旧文档中关于“已发布不改”“确认后冻结”“只改画面”“只做中文”、固定文字位置、固定时长、修改前再次确认、工具选择和检查次数的规定已撤销。`docs/`、`stories/` 和源码注释中的旧版本边界、用户反馈与试作结论用于理解历史，不构成当前 AI 的权限或流程限制。当前对话中的目标与选择决定本轮工作。

## 项目与作品

这是以新潟旅行体验为题材的短片工程，主要使用 Canvas 2D 绘制插画，汤泽滑雪镜头使用 Three.js。当前画布为 1080×1920，作品通常为 20–27.8 秒，可在浏览器预览并导出 MP4。

作品和语言入口见 [`animations.json`](animations.json)，运行命令见 [`README.md`](README.md)。当前有弥彦、高田夜樱、长冈花火、越后汤泽，语言包括简体、繁体和英文。

| 路径 | 用途 |
|---|---|
| `src/yahiko-v38/` | 弥彦可编辑源码、语言差异和字体原件 |
| `viz/` | 当前独立 HTML、其他作品源码、音频和制作工具 |
| `viz/common/series.js` | 原系列绘制工具；V38 当前另有自己的快照 |
| `stories/` | 调研、分镜、反馈与试作记录 |
| `data/SOURCES.md` | 旅游事实来源 |
| `reference/` | 照片参考与第三方许可资料 |
| `output/` | 视频、发布文案与本地检查结果 |

## 当前技术入口

- `npm run dev`：本地预览。
- `npm run build`：从 V38 源码生成三种语言的独立 HTML。
- `npm run check` / `npm run inspect`：页面和指定时间状态检查。
- `npm run record -- <作品ID> --out output/film.mp4`：固定帧时刻导出。
- `npm run build:audio`：用当前配置重建 V38 试听。
- `npm run build:ski`：将汤泽 Three.js 场景重新嵌入页面。

各作品已有 `render(t)` 和就绪状态，适合局部预览、任意时刻检查和确定性导出。画面造型、时间编排、素材、文字和音频可以逐步拆成可复用对象。

弥彦当前声音素材及来源见 `viz/autumn/audio/yahiko-v38/`，当前制作事实见 [`docs/YAHIKO_ITERATION.md`](docs/YAHIKO_ITERATION.md)。项目于 2026-11-02 从 `niigata-data-viz` 迁入，来源映射见 [`docs/MIGRATION.md`](docs/MIGRATION.md)；旧版本在 Git 历史中可查。
