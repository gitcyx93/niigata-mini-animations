# Niigata Mini Animations

用网页绘制的新潟旅行短片，以及可重复使用的制作工具。当前维护弥彦、高田、长冈和越后汤泽；作品与语言入口统一记录在 [`animations.json`](animations.json)。

## 当前作品

| 作品 | 页面 | 时长 |
|---|---|---|
| 弥彦 V38 | [简体](viz/autumn/yahiko-v38.html) · [English](viz/autumn/yahiko-v38-en.html) · [繁體](viz/autumn/yahiko-v38-tw.html) | 27.8 秒，环境音，无配乐 |
| 高田夜樱 v2 | [简体](viz/spring/takada-yozakura-v2.html) · [繁體](viz/spring/takada-yozakura-v2-tw.html) | 20 秒 |
| 长冈花火 A | [简体](viz/summer/nagaoka-hanabi-a.html) · [繁體](viz/summer/nagaoka-hanabi-a-tw.html) | 20 秒，已发布版本 |
| 越后汤泽 | [简体](viz/winter/yuzawa-yukiguni.html) · [繁體](viz/winter/yuzawa-yukiguni-tw.html) | 20 秒，含三维滑雪 |

页面内嵌绘制代码和字体。弥彦播放声音还需同目录下的 `audio/yahiko-v38/`；保留整个目录或使用本地预览服务。

## 开始制作

Node.js 22+；`.nvmrc` 指定 Node 24。依赖版本由 `package-lock.json` 锁定。

```sh
npm ci
npx playwright install chromium
npm run dev
```

打开 **http://127.0.0.1:8941/** 选择作品和语言。旧的 `/yahiko`、`/en`、`/tw` 入口仍可用；`npm run dev -- --port 8000` 可改端口。只看页面无需安装制作依赖。

| 命令 | 用途 |
|---|---|
| `npm run build` | 从 V38 源码生成三种语言的独立 HTML |
| `npm run build:check` | 检查生成页面是否与源码一致，不写文件 |
| `npm run check` | 检查当前 9 个页面的脚本、字体、画布尺寸、时长与采样渲染 |
| `npm run check -- --id yuzawa` | 只检查一部作品，包含三维滑雪时段 |
| `npm run check -- --static` | 不启动浏览器，检查入口、素材和脚本语法 |
| `npm run inspect -- <页面.html> --times 0,5,13,25` | 输出指定时间的状态、像素哈希与渲染耗时 |
| `npm run record -- yahiko --locale en --out output/yahiko-en.mp4` | 确定性逐帧导出；弥彦自动使用已认可音轨 |
| `npm run build:audio` | 按当前声音配置重建试听，写入 `output/audio/yahiko-v38/` |
| `npm test` | 运行预览、输出保护与录制参数的工具测试 |

导出 MP4 需要 `ffmpeg` 和 `ffprobe`；声音重建在浏览器不支持源编码时也会调用 FFmpeg。`FFMPEG`、`FFPROBE` 可指定可执行文件。已有浏览器或 Playwright 可通过 `BROWSER_EXE`、`BROWSER_CHANNEL`、`PLAYWRIGHT_MODULE` 使用；`BROWSER_ARGS` 接受 JSON 字符串数组。

原有 Python 字体、繁体转换及汤泽环境音工具继续保留，分别需要 `fonttools` / `brotli`、`opencc-python-reimplemented`、`numpy`；它们是可选工具，V38 的普通构建不依赖 Python、OpenCC 或在线字体下载。

## V38 的可编辑源码

入口在 [`src/yahiko-v38/`](src/yahiko-v38/README.md)：

- `animation.js`：场景、时间轴、叶片和对象运动。
- `player.js`：播放、音频时钟与控制。
- `page.html`、`styles.css`：页面壳与界面。
- `series.js`：当前作品认可的系列绘制快照。
- `locales/*.json`：已批准的语言差异与字体清单。
- `fonts/`：按内容去重的内嵌字体原件。

编辑源码后运行 `npm run build`。生成的 `viz/autumn/yahiko-v38*.html` 保留原有独立页面格式。语言差异采用精确匹配，源段落改变却未更新对应语言时会停止构建，避免静默改错。通用 `viz/common/series.js` 与此作品快照各有用途，不要直接互相覆盖。

落叶轨迹按原来的固定时间步计算并缓存。拖动、倒放检查和随机时间采样仍返回同一状态；缓存有固定上限。

其他三部作品继续使用其既有源文件。`npm run build:ski` 重建汤泽嵌入的 Three.js 场景；此命令沿用该画面所用的 Three.js / esbuild 版本。

## 声音与发布

V38 的 [声音目录](viz/autumn/audio/yahiko-v38/README.md) 收齐了实际使用的原料、[来源与授权](viz/autumn/audio/yahiko-v38/LICENSES.md) 和 [可执行混音配置](viz/autumn/audio/yahiko-v38/build-config.json)。构建不再从旧提交、旧 HTML 或旧视频目录提取原料。

- `build-config.json` 控制每层开关、增益和总增益；`mix.json` 是已认可母带的生成记录。
- 默认重建产生独立试听文件。明确更新成品时才使用 `npm run build:audio -- --update-release`。
- `npm run record:yahiko` 导出英文、繁体；`-- --locales zh,en,tw` 导出三种语言。
- 导出采用固定帧时刻、H.264/AAC、yuv420p、BT.709 和 fast-start；FFprobe 检查后才发布目标文件。
- 已有视频需 `--force` 才替换。失败时保留原成品；每个新视频附带来源哈希、版本和媒体验证 JSON。
- 发布署名见 [`output/autumn/yahiko-v38-social/PUBLISHING.md`](output/autumn/yahiko-v38-social/PUBLISHING.md)。

## 目录与维护

| 路径 | 内容 |
|---|---|
| `src/` | 可编辑的 V38 源码与共享字体资源 |
| `viz/` | 当前独立页面、其他作品源文件、有效音频与工具 |
| `stories/` | 调研、分镜、用户意见与制作记录 |
| `data/` | 事实来源与系列资料 |
| `reference/` | 实际照片参考及第三方许可证 |
| `output/` | 保留的已发布成品、发布文案；新导出与检查结果默认不进 Git |
| `docs/` | 制作约定、检查说明及迁移事实 |

修改作品前读 [`CLAUDE.md`](CLAUDE.md) 与 [`docs/YAHIKO_ITERATION.md`](docs/YAHIKO_ITERATION.md)。本次技术整理保留这些既有规则。长冈已发布版本、汤泽时长、V38 字幕和已认可音轨继续按原约定处理。

2026-11-10 清理移除了已被替代的弥彦版本、旧视频与音频副本、一次性比较图、历史专用检查/构建器及未使用的统计看板数据。原始资料、用户意见和已发布长冈/汤泽 MP4 保留。历史文件可从清理前提交 `28cc9f540ea0481c4dd721d12da19121eb152048` 找回；旧记录中的路径按当时提交解读。

持续检查仅针对当前作品与制作工具，不重新生成视频或音轨。仓库未新增作品许可证，字体、第三方库和声音的许可声明继续保留。[迁移事实](docs/MIGRATION.md) · [检查工具说明](docs/AI_INSPECTION.md)
