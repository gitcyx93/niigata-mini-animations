# 弥彦 v16 修订版：声音源码

这份声音是**环境音，不是背景音乐／配乐**。当前发布组合为静林开场、无缆车机械拟音、上山远处鸟鸣；未把本地审片台全部候选自动当成定稿。

## 在代码里看什么

- `mix.json`：素材来源、出现位置、处理记录和实际参与混音的配置。
- `tracks[].start_seconds`：把该分轨放在时间线上的位置。两句鸟鸣分别从 **13.95 秒、15.25 秒**开始。
- `tracks[].gain_db`、`enabled`：重新构建时实际生效的额外音量及启用开关。
- `master_gain_db`：整体额外增益。比如改为 `-2`，会在已处理的基础上再轻 2dB。
- `baked_processing`：**已经烘焙进分轨**的处理记录：统一降低4dB、2.4kHz高架衰减2.5dB、鸟鸣极轻早期反射等。不要再次照表叠加同一处理。
- `stems/*.flac`：无损保存的已剪辑、EQ及淡化分轨。FLAC不意味着原下载的MP3恢复了原始无损质量。
- `master.flac`：可用于视频导出的完整混音；`master.m4a`：网页内嵌播放版本。
- `../../yahiko-v16-travel-sound.js`：播放、暂停、定位、静音和音画同步。声音媒体时钟驱动画面。

环境分轨内部已经做好树林与开阔风的交叠；如要进一步重选原始录音或重做内部时序，需回到来源素材，不能只修改 `source_window_seconds` 等说明字段。

## 重建

在仓库根目录运行（Python 3＋FFmpeg，无其他Python依赖）：

```sh
python3 viz/tools/build-yahiko-travel-sound.py
```

会重建 `master.flac`、`master.m4a`、`build.json`，以及独立可打开的 `viz/autumn/yahiko-v16-travel-sound.html`。只修改声音配置或控制逻辑后，用这个构建器；不要手改生成HTML里的base64音频。

画面源为 `viz/autumn/yahiko-v16-travel.html`。构建器核对其SHA256，避免画面时长或版本被改变后静默配错；如画面更新，应先核对时序，再更新配置中的固定哈希。

## 版本与授权

本目录只包含四种CC0来源及其处理结果，详见 `LICENSES.md`。没有上传 Pocket Sound 的吊厢原素材或本地比较页中的该候选，也没有上传背景音乐。所有素材不是弥彦现场实录；鸟种未确认。
