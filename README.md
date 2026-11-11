# Niigata Mini Animations

新潟小动画：用网页绘制的新潟旅行短片。高田夜樱、长冈花火、弥彦红叶与山海、越后汤泽滑雪和温泉。

这是**动画作品与制作工程**，不是统计看板。2026-11-02 从旧数据仓库（现名 [`gitcyx93/niigata-data-archive`](https://github.com/gitcyx93/niigata-data-archive)）的动画工作分支迁出。

2026-11-07 用户已撤销迁移时的全量历史留存要求：旧稿、视频、比较材料与旧分支不再因迁移文档而必须保留。下列历史入口仅说明现有文件，不代表保留要求；后续清理按用户当前指示进行。

## 从这里打开

GitHub 文件页显示源码，不会直接播放 HTML。克隆或下载本仓库后，双击下面的 HTML；也可以在仓库根目录运行 `python3 -m http.server 8000`，通过 `http://localhost:8000/viz/` 打开。

| 季节 | 作品入口 | 说明 |
|---|---|---|
| 春 | [高田夜樱 v2](viz/spring/takada-yozakura-v2.html) · [台湾繁体](viz/spring/takada-yozakura-v2-tw.html) | 当前 v2 页面与新稿 |
| 夏 | [长冈花火 A](viz/summer/nagaoka-hanabi-a.html) · [台湾繁体](viz/summer/nagaoka-hanabi-a-tw.html) | 保留原已发布版本，不改画面或文案 |
| 秋 | [弥彦 V38](viz/autumn/yahiko-v38.html) · [English](viz/autumn/yahiko-v38-en.html) · [繁體](viz/autumn/yahiko-v38-tw.html) | 27.8 秒首尾循环，红叶谷与温泉街风叶互动；环境音、海浪、风铃、鸟鸣、猫叫与窗框声，**无配乐** |
| 冬 | [越后汤泽](viz/winter/yuzawa-yukiguni.html) · [台湾繁体](viz/winter/yuzawa-yukiguni-tw.html) | 三维滑雪、SNS 运镜与新稿；保留原 20 秒循环 |

### 弥彦 V43 / V42：试作（未确认）

- [V43 页面](viz/autumn/yahiko-v43.html) · [记录](stories/yahiko-v43.md)：最新试作。去掉开场地图的镜头顺序，日月主线和换景转场跟着调整，全片同一对两个人；无声。
- [V42 页面](viz/autumn/yahiko-v42.html) · [记录](stories/yahiko-v42.md)：V38 原顺序、转场和声音，换了山顶布景、人物、叶片画法和字的样式。V39–V41 是中间试作。

### 弥彦 V38：当前版本

- [完整动画](viz/autumn/yahiko-v38.html) · [本轮记录](stories/yahiko-v38.md) · [音效来源与授权](viz/autumn/audio/yahiko-v38/LICENSES.md)。
- 保留 `viz/autumn/audio/yahiko-v38/` 目录；运行 `node viz/tools/preview-yahiko-v38.cjs` 后打开 **http://127.0.0.1:8941/yahiko**。点击“有声播放”，可按时间表单听音效。英文预览 `/en`，繁体预览 `/tw`。
- 英文与繁体发布 MP4 正在本地录制，按用户要求稍后单独上传；当前先发布双语网页、无配乐母带及制作源码。目标规格：1080×1920、30fps、H.264＋AAC、27.8 秒。
- [发布说明与音效署名](output/autumn/yahiko-v38-social/PUBLISHING.md)。下方 v16/v25 视频是历史版本，不要误用。
- [纯音效／发布母带](viz/autumn/audio/yahiko-v38/master.wav) · [混音参数](viz/autumn/audio/yahiko-v38/mix.json)。
- [快改流程与已确认经验](docs/YAHIKO_ITERATION.md)。

### 弥彦 v16：历史视频与声音源码

画面修订与字幕来源见 [v16 修订记录](stories/yahiko-v16-travel.md)；声音及导出范围见 [环境音版记录](stories/yahiko-v16-travel-sound.md)。

- [v16 MP4（无声）](output/autumn/yahiko-v16-travel/yahiko-v16-travel-silent.mp4)
- [v16 画面＋环境音 MP4](output/autumn/yahiko-v16-travel/yahiko-v16-travel-ambience.mp4)：22.8 秒，1080×1920，30fps。
- [声音配置 `mix.json`](viz/autumn/audio/yahiko-v16-travel/mix.json)：能直接看到音轨、素材来源、音量和鸟鸣时间点。
- [声音播放／同步代码](viz/autumn/yahiko-v16-travel-sound.js) · [分轨、重建说明与授权](viz/autumn/audio/yahiko-v16-travel/README.md)

环境音 HTML 已内嵌音频，下载后可以独立打开，点击“有声播放”才出声。浏览器使用同一音频时钟驱动画面，支持暂停、拖动、章节跳转、音量、静音及循环。

其他版本：

- **弥彦 v25 完整动画：[环境音 MP4](output/autumn/yahiko-v25/yahiko-v25-ambience.mp4) · [无声 MP4](output/autumn/yahiko-v25/yahiko-v25-silent.mp4)**，24.6 秒、1080×1920、30fps。基于 v24，以原片 Canvas 插画画风重画最后 4 秒，第三张参考图仅用于布局，不作背景贴图；[可编辑无声页面](viz/autumn/yahiko-v25.html) · [环境音页面](viz/autumn/yahiko-v25-sound.html) · [说明](stories/yahiko-v25.md)。仅小镇旁白改为泛称弥彦温泉，前段场景及原环境音保留；新风铃等候选另行下载，尚未混入。

- [原始弥彦 v16](viz/autumn/yahiko-v16.html)：历史对照入口。

- [弥彦 v11 精修](viz/autumn/yahiko-v11-refined.html) · [对应台湾繁体](viz/autumn/yahiko-v11-refined-tw.html)：繁体版不是 v16 的翻译。
- [弥彦 v12](viz/autumn/yahiko-v12.html) · [对应台湾繁体](viz/autumn/yahiko-v12-tw.html)、[v13](viz/autumn/yahiko-v13.html) · [对应台湾繁体](viz/autumn/yahiko-v13-tw.html)、[v14](viz/autumn/yahiko-v14.html)、[v15](viz/autumn/yahiko-v15.html)：历史比较入口，不代表当前最终版本。
- [佐渡木盆船](viz/summer/sado-taraibune.html)：早期试作。
- [汤泽日文试作](viz/winter/yuzawa-yukiguni-ja.html)：已有历史版本，不代表系列改为维护日文。
- 各季目录中还存在其他旧版；不同分支的试作不一定已经合入当前版本。

## 文件放在哪里

| 路径 | 内容 |
|---|---|
| `viz/spring/`、`summer/`、`autumn/`、`winter/` | 动画 HTML 及独立场景源文件 |
| `viz/common/series.js` | 系列共用绘制代码 |
| `viz/tools/` | 字体内嵌、繁体转换、构建、检查与录制工具 |
| `stories/` | 每集调研、分镜、文案和试作记录 |
| `data/` | 事实来源与研究用数据快照；保留原出处与核验提醒 |
| `reference/` | 动画比较图、播放采样与旧检查结果，不是作品入口 |
| `output/` | 已有 MP4、发布文案与评审预览 |
| `docs/` | 迁移记录与本次检查结果 |

原统计看板 `dashboard/`、它的 `scripts/` 和 `reference/niigata-cinema-zh.html` **不属于本项目的当前工作树**；迁移时它们位于原数据仓库及历史提交中。

清理文件或调整 `viz/` 路径时，需同步实际使用的生成脚本与文档引用。

## 使用与制作

- **看动画无需安装依赖**。本次入口页面的字体和运行代码均已内嵌；验证范围见 [检查结果](docs/migration-check.json)。
- 修改作品前读 [`CLAUDE.md`](CLAUDE.md) 与该集的 `stories/` 记录。迁移没有重新确认旧文档中的待办、最终版本选择或发布状态。
- 原系列共用代码更新后，按对应版本说明重新内嵌；不要用旧的公共生成流程覆盖独立版本。
- 工具要求 Node.js 22+、Python 3；录制还需要 FFmpeg、Playwright 与 Chromium。字体处理需要 `fonttools` / `brotli`。三维构建及繁体生成的精确依赖见相应脚本和制作记录，**仅观看时不需要安装**。
- 某些历史检查工具通过 `git show <旧提交>:<文件>` 做回归比较；本仓库保留原提交，因此这些基线仍可访问。旧检查结果是当时的证据，不代表本次全部重跑。

```sh
# 无 npm 依赖的原三集脚本/字体检查；需要本机 Chrome/Chromium
node viz/tools/check-copy-pages.cjs

# 使用其他 Chrome/Chromium 路径
BROWSER_EXE=/path/to/chrome node viz/tools/check-copy-pages.cjs
```

### 重建弥彦声音与视频

V38 语言版：`NODE_PATH=/path/to/font-and-opencc/node_modules node viz/tools/build-yahiko-v38-locales.cjs`。发布录制：`PLAYWRIGHT_MODULE=/path/to/playwright FFMPEG=/path/to/ffmpeg node viz/tools/record-yahiko-v38-social.cjs`（已有输出须显式加 `--force`）。

V38 声音：已有 Playwright 安装时运行 `PLAYWRIGHT_MODULE=/path/to/playwright node viz/tools/build-yahiko-v38-audio.cjs`；快速检查为 `node viz/tools/check-yahiko-v38-loop.cjs`。其音频构建使用浏览器解码与 WAV 输出，不需要 FFmpeg。

以下命令针对历史 v16，不能用于覆盖 V38。需要 Python 3、FFmpeg；浏览器检查和录制另需可解析的 `playwright` 包及浏览器（可用 `BROWSER_EXE` 指定本机 Chrome）。

```sh
# 从已剪辑的无损分轨重建混音和独立有声 HTML
python3 viz/tools/build-yahiko-travel-sound.py
# 画面一致性、声音媒体时钟、完整播放和控制检查
node viz/tools/check-yahiko-sound.cjs
# 同时导出无声与环境音 MP4；--force 仅替换这两个生成的视频
node viz/tools/record-yahiko-sound.cjs --force
```

`mix.json` 的 `start_seconds`、`gain_db`、`enabled` 和 `master_gain_db` 会实际影响重建；`baked_processing` 是已经应用到分轨的处理说明，不会被重复执行。

## 版本与来源

- 主分支以源仓库 `519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a` 为迁移基线；没有用落后的源仓库 `main` 覆盖动画。
- 迁移时的 8 个源分支 tip 记录在 `archive/source/*` 标签中；这是迁移快照，不是当前工作分支清单，也不是继续保留旧分支的要求。当前分支以 GitHub 实际列表为准。
- 恢复示例：`git fetch --tags origin`，再执行 `git switch --detach refs/tags/archive/source/gpt/yahiko-v11-refine`。
- [迁移说明与完整分支映射](docs/MIGRATION.md)
- [迁移前的项目 README](https://github.com/gitcyx93/niigata-mini-animations/blob/519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a/README.md)

本仓库未新增许可证；作品、字体和第三方库的权利及许可声明保持原状。
