# 弥彦 v25 · 原片画风的小坡路温泉街（待确认）

第三张 GPT 图**只参考场景布局**：坡路、右后方老旅馆、左前方商铺、右侧温泉庭院和两位黑色剪影。曾尝试直接用生成图作背景，用户明确否定；该贴图方案未发布，已从此版移除。

本版使用 v24 的 Canvas 绘制方式重新画场景，复用同一套 `nightCrown`、枫叶轮廓、`branch`、杉树、光晕和夜空。人物沿用桥段的近黑色相依剪影；建筑使用分面的木构、格栅和瓦屋面，不把 AI 图片内嵌为背景。

- 静帧：`reference/yahiko-v25/frame-23-5.png`
- 无声源码：`viz/autumn/yahiko-v25.html`
- 环境音源码：`viz/autumn/yahiko-v25-sound.html`
- 新场景绘制：`viz/autumn/yahiko-v25-town.js`
- 构图参考：`reference/yahiko-v25/selected-concept-03.png`（仅参考，不被页面读取）

基于 `1320e6f` 的 v24，仅替换 20.6–24.6 秒的小镇代码。总长仍为 24.6 秒，其他镜头、字幕原文与位置、音频内容不变。分层视差、温泉热气和水面细动已写入，但本轮先确认画风，尚未完成本次重画后的全片播放与转场验收，不把旧贴图版的检查结果用于此版。

重建：`node viz/tools/build-yahiko-v25.cjs`。脚本只需 Node 标准库，输出独立无声与环境音 HTML；环境音直接复用 v24 原音频，不重新混音。`viz/tools/check-yahiko-v25.cjs` 为后续播放与回归检查入口，需要 Playwright、Edge 与本地 HTTP 服务；本次未重跑其完整流程。

自由设计场景，不代表真实旅馆「みのや」的外观。原字幕保留，后续文案如需调整另行确认。
