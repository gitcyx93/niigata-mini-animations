# 弥彦 V53：中文发布版

用户已认可B式音效、脚步修正、替换后的索道与猫叫，以及现成配乐Reverie的融合处理。本轮只要求风铃稍轻、交换温泉街两句文字，并推送GitHub与导出中文MP4。

## 本轮改动

1. 连续风铃整体降低2dB；非风铃整数PCM底层逐样本保持。包括Reverie音乐及其现有避让包络，不因风铃变化重新计算、不重归一化。
2. 温泉街上方旁白换为「有的旅馆 已经开了 300 多年」。
3. 大标题「神社出来 是温泉小镇」下面的小字换为「不赶时间的话，住一晚再走吧。」。

只交换原文的位置；字号、字重、颜色、字体、显示时间和镜头全部不变。V53 FX与V50已认可画面代码之间只有这两个字符串差异。没有新增历史对比页面或改动此前定稿。

## 文件

- 当前简体中文页面：`viz/autumn/yahiko-v53-zh.html`，内嵌字体与最新MP3，可独立打开。
- 当前FX：`viz/autumn/yahiko-v53-fx.js`。
- 权威母带、13类分轨、冻结底层及许可：`viz/autumn/audio/yahiko-v53/`。
- 中文MP4、导出记录、文字检查与署名：`output/autumn/yahiko-v53-zh/`。
- 本次只导出当前简体中文版本，不擅自翻译或修改繁体/英文旧稿。

## 重建

依赖已安装Python/NumPy、FFmpeg、Node、Playwright和Chromium/Edge；编码后相关性检查另用SciPy。

```text
python viz/tools/build-yahiko-v53.py
PLAYWRIGHT_MODULE=/path/to/playwright node viz/tools/record-yahiko-v53-zh.cjs
python viz/tools/verify-yahiko-v53.py
```

构建脚本默认从本版本已提交的无损冻结层/分轨重建母带与HTML。`--import-approved`仅用于首次导入本机已认可素材，之后无需本机试稿文件。已存在音频若与预期不同则中止，不覆盖；导出脚本拒绝覆盖已存在MP4。

发布规格：1080×1920、30fps、843帧、28.1秒、H.264 High/yuv420p/BT.709、AAC双声道48kHz 256kbps、fast-start。原画面逐帧渲染，不将轻量预览放大或插帧。

## 检查与边界

脚本核对风铃增益、非目标PCM冻结、两句文字内容及小字幕宽度、字体加载、全片解码、帧数、时长和音视频流起点。具体结果见导出目录JSON。查看温泉街关键帧确认实际位置，编码后音频另做相关性检查。

用户已认可的是本轮修改前的整体声音；最终风铃-2dB是本次指定的小改。未冒称做了新的主观听审或平台上传检查。发布仍需附PUBLISH-CREDITS.txt中的音乐和海声署名，平台再次压缩及UI遮挡需上传后查看。
