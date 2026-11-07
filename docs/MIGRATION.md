# 迁移记录：Niigata Mini Animations

迁移日期：2026-11-02。

2026-11-07：用户已撤销迁移时的全量历史留存要求。本文仅记录当时的迁移事实与来源映射，不再要求持续保留旧文件、试作副本或旧分支；清理范围以用户当前指示为准。

## 名称与边界

- 新仓库：`gitcyx93/niigata-mini-animations`，中文名“新潟小动画”。
- 源仓库原名：`gitcyx93/niigata-data-viz`；同日整理后现名为 [`gitcyx93/niigata-data-archive`](https://github.com/gitcyx93/niigata-data-archive)，只读归档。
- 对象是四季旅行动画，而不是默认分支中的统计交互页。原默认分支没有动画工程，不能只复制它。
- 新 `main` 以源动画整合分支 `claude/adoring-darwin-982h4c` 的 `519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a` 为基线。它包含当前四季动画、三维汤泽滑雪、三集新稿及弥彦 v16；采用这份快照不是替用户选定最新试作即最终成品。

## 文件处理

- 当时迁入了 `viz/`、`output/`、`data/`、动画比较材料及 `stories/`；早期调研对统计交互页的引用改为原仓库的固定提交链接。
- 从新 `main` 排除原统计看板的 `dashboard/`、`scripts/` 和 `reference/niigata-cinema-zh.html`。这些文件仍在源仓库以及本仓库的历史提交中。
- 重写作品入口 README，更新 `reference/README.txt`，在 `CLAUDE.md` 添加迁移提示；没有修改任何动画 HTML、共享代码、构建/导出工具、视频或文案。
- 迁移时未改文件路径；后续清理或调整路径时需同步实际工具与文档引用。
- 本次没有部署网页、重新生成字体、导出视频、改画面、合并试作或删除源分支。

## 分支与历史

迁移时没有重写原提交。每个源分支的 tip 最初保存为新仓库的 `archive/source/<源分支名>` 快照分支；2026-11-02 在用户批准整理后，转为**同名附注标签**，再移除分支名。标签剥离后的提交 SHA 与下表完全相同；独立试作没有丢失。

| 源分支 | 固定 tip | 新仓库归档标签 |
|---|---|---|
| `main` | `c41d6674a1a6537a708bc92fdb280a2a50447421` | `archive/source/main` |
| `claude/adoring-darwin-982h4c` | `519ec9a3a5e9a2208cd65f8c6b6d48e6cbe5cd8a` | `archive/source/claude/adoring-darwin-982h4c` |
| `gpt/three-films-copy` | `83393b4cfcf6bfaf16240169818c6af6c4a8f9aa` | `archive/source/gpt/three-films-copy` |
| `gpt/yahiko-refine-2026-10-24` | `03d13b6d37f093488f3c07feea69ee4e13e13a63` | `archive/source/gpt/yahiko-refine-2026-10-24` |
| `gpt/yahiko-v11-refine` | `d369de8b414320d6a305288faecbfb6e30a60996` | `archive/source/gpt/yahiko-v11-refine` |
| `gpt/yuzawa-ski-3d` | `5c575b30eee16f88f7f99782e1ec532b87fa14c7` | `archive/source/gpt/yuzawa-ski-3d` |
| `gpt/yuzawa-ski-sns` | `a95ecb8afbdf384d5b29837723bb1383f73ccdba` | `archive/source/gpt/yuzawa-ski-sns` |
| `gpt/yuzawa-visual-refine` | `032bf6ec4cfbbe7c71a1a504f97b8c9098dfe9fd` | `archive/source/gpt/yuzawa-visual-refine` |

注意两条分叉：

- `gpt/yahiko-refine-2026-10-24` 有 11 个不在迁移基线中的提交。
- `gpt/yahiko-v11-refine` 有 2 个不在迁移基线中的提交。

都已保留完整历史，没有因为“不是主版本”而删除，也没有未经比较就混入主分支。

示例：查看归档标签，或回溯到特定版本。

```sh
git fetch --tags origin
git switch --detach refs/tags/archive/source/gpt/yahiko-v11-refine
git show 5c575b3:viz/winter/yuzawa-yukiguni.html
```

## 原仓库

迁移时，原仓库默认分支增加了新仓库入口，动画后续改在新仓库维护。统计看板和统计交互页当时没有迁入新 main。文档中的分支映射用于区分“迁移时快照”与各仓库的后续更改，不是继续保存原仓库或旧分支的要求。

## 验证

原迁移阶段的机器可读检查记录见 [`migration-check.json`](migration-check.json)；其中分支检查记录描述的是转为标签之前的状态。当前归档引用以本文的标签说明为准。验证区分原样复制、脚本/依赖检查、逐时刻渲染和实时播放采样；旧 `reference/` 检查结果不冒充本次检查。迁移不会自动修复历史试作自身的缺陷或重新核验旅游事实。
