# 弥彦 v25 音效试听与 B 版选择

## 已交付

入口：`output/autumn/yahiko-v25-sound-review/listen.html`。

- 0：原环境音对照。
- A：夜景风叶 + 一声风铃。
- B：A + 温泉细流水。**用户已选择 B 作为继续修改的基础。**
- C：B + 低声索道运行。

四版画面码流与 v25 原片一致，全长 24.6 秒。所有版本统一增加 6 dB 试听增益，未分别归一化；原发布文件未修改。目录含完整 MP4、AAC、FLAC 母带、编辑后分轨、原素材与编辑后波形、精确裁切/滤波/淡化/音量参数及验证结果。

重建：`python3 viz/tools/build-yahiko-v25-sound-review.py`（依赖 FFmpeg、NumPy、SciPy、Matplotlib）。原素材已在 `reference/yahiko-v25/sound-candidates-v1/` 中；重建不下载、不覆盖原素材。

## 播放服务修复

Python 标准 `http.server` 不支持本次媒体所需的字节 Range：请求两个字节却返回整个视频。此前只用文件直开与 HTTP 200 验证不充分，不能据此保证网页播放。

使用支持 Range 的本机服务：

```sh
python3 viz/tools/serve-yahiko-review.py --port 61812
```

在运行服务的同一台电脑打开 `http://127.0.0.1:61812/listen.html`。此地址不是 GitHub 公网预览，GitHub 文件页面也不会执行播放器。服务仅绑定本机，不对外开放。

已验证首部/中间/尾部 Range 返回 206，越界返回 416；通过实际 HTTP 地址完成浏览器整段播放、切换保留时间、片段循环、390px 布局检查。验证脚本 `viz/tools/check-yahiko-v25-sound-review.cjs` 接受 `PLAYWRIGHT_MODULE`、`CHROME_PATH` 和 `REVIEW_URL` 环境变量。技术检查不等同于听感验收。

## 用户已提出、尚未制作的 B 版修订

1. 开头风声不合适，第二景开始的风声可以；拟用第二景声音衔接开头，尚未制作。
2. 风铃需要更密集，不再只有一声。
3. 用户在看海段听到类似海浪的声音，要求更轻、更远。不能凭分轨名为 `summit-wind` 就否定听感；还需检查原录音是否自带其他声源。
4. 已明确：结尾细流水提前到枫桥开始，一直延续进小镇；不另加桥水声。
5. 增加声音交叠淡化，减少切换突兀。

当前来源追查仅确认：v25 沿用 v24/v18 混音；山顶轨来自 v16 `environment` 的 16.6–20.9 秒，v16 包含 Borgory 的树叶风声与 Globofonia 的 `wind open field`。这只是处理记录，尚未证实原录音中有无海浪、乐器或其他背景声。不要把本次上传的 B 试听版称为已完成上述修订的最终版。

## 许可

风铃 ayustat2001 / Freesound 501168、风叶 Garuda1982 / 575645、细流水 kyles / 637977，均 CC0。候选为公开 MP3 预览，不是原始无损录音，也不是弥彦现场实录。

仅 C 使用索道：concretica，*09 - cableway - ropeway - ski-lift in the summer [.wav]*，https://freesound.org/people/concretica/sounds/240532/ ，CC BY 4.0：https://creativecommons.org/licenses/by/4.0/ 。使用公开预览，裁切 1–4.2 秒，滤波、淡入淡出、调整音量及声场宽度。原环境音的来源与许可保留在原混音配置中。
