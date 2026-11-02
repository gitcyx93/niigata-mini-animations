# Niigata Mini Animations

新潟小动画：用网页绘制的新潟旅行短片。高田夜樱、长冈花火、弥彦红叶与山海、越后汤泽滑雪和温泉。

这是**动画作品与制作工程**，不是统计看板。2026-11-02 从旧数据仓库（现名 [`gitcyx93/niigata-data-archive`](https://github.com/gitcyx93/niigata-data-archive)）的动画工作分支迁出，保留原提交历史、试作版本、共用代码、工具、资料与视频。

## 从这里打开

GitHub 文件页显示源码，不会直接播放 HTML。克隆或下载本仓库后，双击下面的 HTML；也可以在仓库根目录运行 `python3 -m http.server 8000`，通过 `http://localhost:8000/viz/` 打开。

| 季节 | 作品入口 | 说明 |
|---|---|---|
| 春 | [高田夜樱 v2](viz/spring/takada-yozakura-v2.html) · [台湾繁体](viz/spring/takada-yozakura-v2-tw.html) | 当前 v2 页面与新稿 |
| 夏 | [长冈花火 A](viz/summer/nagaoka-hanabi-a.html) · [台湾繁体](viz/summer/nagaoka-hanabi-a-tw.html) | 保留原已发布版本，不改画面或文案 |
| 秋 | [弥彦 v16](viz/autumn/yahiko-v16.html) | 迁移基线分支中编号最新的试作，**不等于已经定稿** |
| 冬 | [越后汤泽](viz/winter/yuzawa-yukiguni.html) · [台湾繁体](viz/winter/yuzawa-yukiguni-tw.html) | 三维滑雪、SNS 运镜与新稿；保留原 20 秒循环 |

其他版本：

- [弥彦 v11 精修](viz/autumn/yahiko-v11-refined.html) · [对应台湾繁体](viz/autumn/yahiko-v11-refined-tw.html)：繁体版不是 v16 的翻译。
- [弥彦 v12](viz/autumn/yahiko-v12.html) · [对应台湾繁体](viz/autumn/yahiko-v12-tw.html)、[v13](viz/autumn/yahiko-v13.html) · [对应台湾繁体](viz/autumn/yahiko-v13-tw.html)、[v14](viz/autumn/yahiko-v14.html)、[v15](viz/autumn/yahiko-v15.html)：保留作比较，不自动选定最终版本。
- [佐渡木盆船](viz/summer/sado-taraibune.html)：早期试作。
- [汤泽日文试作](viz/winter/yuzawa-yukiguni-ja.html)：已有历史版本，不代表系列改为维护日文。
- 其他旧版保留在各季目录；未把不同分支的试作擅自合并。

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

原统计看板 `dashboard/`、它的 `scripts/` 和 `reference/niigata-cinema-zh.html` **不属于本项目的当前工作树**，继续留在原数据仓库。为了完整保留历史，它们仍可能出现在旧提交或归档标签所指向的历史中。

保留 `viz/` 路径是为了不破坏生成脚本、历史版本比对和文档引用；不在迁移时批量改文件名、重嵌字体或重建动画。

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

## 版本与来源

- 主分支以源仓库 `519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a` 为迁移基线；没有用落后的源仓库 `main` 覆盖动画。
- 所有源分支 tip 保存为同名归档标签 `archive/source/*`；迁移时最初保留的 8 个快照分支现已转为标签，工作分支只保留 `main`。存在尚未合入基线的弥彦试作，提交完整保留，不自动合并。
- 恢复示例：`git fetch --tags origin`，再执行 `git switch --detach refs/tags/archive/source/gpt/yahiko-v11-refine`。
- [迁移说明与完整分支映射](docs/MIGRATION.md)
- [迁移前的项目 README](https://github.com/gitcyx93/niigata-mini-animations/blob/519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a/README.md)

本仓库未新增许可证；作品、字体和第三方库的权利及许可声明保持原状。
