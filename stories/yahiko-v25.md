# 弥彦 v25 · 原片画风的小坡路温泉街（完整导出版）

第三张 GPT 图**只参考场景布局**：坡路、右后方老旅馆、左前方商铺、右侧温泉庭院和两位黑色剪影。曾尝试直接用生成图作背景，用户明确否定；该贴图方案未发布，已从此版移除。

本版使用 v24 的 Canvas 绘制方式重新画场景，复用同一套 `nightCrown`、枫叶轮廓、`branch`、杉树、光晕和夜空。人物沿用桥段的近黑色相依剪影；建筑使用分面的木构、格栅和瓦屋面，不把 AI 图片内嵌为背景。

- 完整环境音 MP4：`output/autumn/yahiko-v25/yahiko-v25-ambience.mp4`
- 完整无声 MP4：`output/autumn/yahiko-v25/yahiko-v25-silent.mp4`
- 两版均为 1080×1920、30 fps、738 帧、24.6 秒。
- 静帧：`reference/yahiko-v25/frame-23-5.png`
- 全片镜头概览：`reference/yahiko-v25/sequence-check.jpg`
- 无声源码：`viz/autumn/yahiko-v25.html`
- 环境音源码：`viz/autumn/yahiko-v25-sound.html`
- 新场景绘制：`viz/autumn/yahiko-v25-town.js`
- 构图参考：`reference/yahiko-v25/selected-concept-03.png`（仅参考，不被页面读取）

基于 `1320e6f` 的 v24，仅替换 20.6–24.6 秒的小镇代码。总长仍为 24.6 秒，其他镜头、字幕位置及音频内容不变。小镇旁白改为「下山后，住一晚弥彦温泉。」，其余字幕保留。本次已完成新小镇与前六段场景的整段导出，保留原换景方式和连续月亮时钟；小镇有分层视差、温泉热气和水面细动。检查确认前段源码除允许的版本标签及小镇旁白外不变，使用当前原生 Canvas 版本重新导出，不复用已否定的贴图版视频。

重建：`node viz/tools/build-yahiko-v25.cjs`。脚本只需 Node 标准库，输出独立无声与环境音 HTML；环境音直接复用 v24 原音频，不重新混音。`viz/tools/check-yahiko-v25.cjs` 用 Playwright、Edge 和完整 FFmpeg 导出固定 30 fps 视频，再连续播放最终编码文件。可用 `PLAYWRIGHT_MODULE`、`FFMPEG_EXE` 和 `YAHIKO_BASE_URL` 指定已安装工具与本地地址。环境音 AAC 直接复制，未改原音轨内容。当前结果见 `reference/yahiko-v25/validation.json`：编码视频为24.6秒、1080×1920，连续回放到结束，解码738帧；检查浏览器丢显示帧3帧，不是编码文件缺帧，未出现页面错误。声音已验证可解码，但不把它当成人工听感验收。

自由设计场景，不代表真实旅馆「みのや」的外观，因此小镇旁白不再点名该旅馆。片尾仍为「看完日落和夜红叶，／就在神社门前住一晚。」及「缆车末班要先查好哦」。音效追加建议见 [音效方案](yahiko-v25-sound-options.md)。下载任务独立执行，已取得6个候选（风铃1、风叶1、细水2、脚步1、索道1），保存在用户本机 `Documents/niigata-sound-download/`；都是公开MP3预览，来源清单另存该目录。风铃等新增音效尚未混入，最终听感需另选素材后调整。
