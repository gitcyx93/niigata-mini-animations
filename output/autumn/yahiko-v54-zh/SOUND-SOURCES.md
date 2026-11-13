# 弥彦 V53 中文发布版：实际使用的音乐与音效

本版使用用户认可的B式音效、已修正的脚步、替换后的索道/猫叫，以及已认可的Reverie配乐融合版。本轮仅将连续风铃降低2dB，其他音频PCM底层与音乐包络保持不变。音效是后期声音设计，不是弥彦现场录音。没有AI生成音乐或C版合成气流。

## 音乐（发布必须署名）

**Reverie — Scott Buckley**
- 官方作品页：https://www.scottbuckley.com.au/library/reverie/
- 许可：CC BY 4.0，https://creativecommons.org/licenses/by/4.0/
- 官方MP3：https://www.scottbuckley.com.au/library/wp-content/uploads/2020/03/sb_reverie.mp3
- 改动：截取0–28.1秒，100Hz高通、1.5:1轻压缩、音乐电平调整、淡入淡出，以及随音效触发的避让。没有变速、变调或新生成音符。本轮风铃调低后没有重新计算音乐包络。
- 许可允许署名商用。作者要求YouTube视频说明中包含署名，缺署名可能收到Content ID声明；不保证平台永不误报。不能署名须另行获得许可，本次未购买许可。

## 海声（发布必须署名）

**Oceanwavescrushing — Luftrum**
- 来源：https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg
- 许可：CC BY 3.0，https://creativecommons.org/licenses/by/3.0/
- 改动：截取12–16.5秒，滤波、降低音量及淡化，用作远海意象；原录音来自丹麦，不是弥彦现场，也不声称从山顶能实际听到这些海浪。

## 其他实际使用的声音

| 声音 | 作者 | 来源 | 许可 |
|---|---|---|---|
| 轻微风 | 1ratatosk1 | https://freesound.org/people/1ratatosk1/sounds/245824/ | CC0 1.0 |
| 实录风叶 | Garuda1982 | https://freesound.org/people/Garuda1982/sounds/575645/ | CC0 1.0 |
| 鸟鸣 | rawhiteman7 | https://freesound.org/people/rawhiteman7/sounds/389977/ | CC0 1.0 |
| 索道机械拟音 | indieground | https://freesound.org/people/indieground/sounds/223829/ | CC0 1.0 |
| 细水 | kyles | https://freesound.org/people/kyles/sounds/637977/ | CC0 1.0 |
| 木滑门 | Diramus | https://freesound.org/people/Diramus/sounds/346776/ | CC0 1.0 |
| 相机快门 | ulose2piranha | https://freesound.org/people/ulose2piranha/sounds/231286/ | CC0 1.0 |
| 砂砾脚步 | SduggySounds | https://freesound.org/people/SduggySounds/sounds/721620/ | CC0 1.0 |
| 铺装路面脚步 | JohnsonBrandEditing | https://freesound.org/people/JohnsonBrandEditing/sounds/244310/ | CC0 1.0 |
| 短猫叫 | Jofae | https://freesound.org/people/Jofae/sounds/362953/ | CC0 1.0 |
| 连续风铃 | Esc861 | https://commons.wikimedia.org/wiki/File:Windchimes.ogg | Public Domain / PD-self |
| 窗框拟音 | Stephan | https://soundbible.com/1362-Old-Door-Creaking.html | Public Domain（既有来源页记录） |

CC0许可：https://creativecommons.org/publicdomain/zero/1.0/

Freesound素材使用公开HQ MP3预览，未冒充原始WAV。音效已按画面裁切、短淡化、滤波、轻压缩、调整声像和远近音量；脚步按可见落脚对齐；风铃为连续录音，不复制单次敲击；门吱声作为窗框拟音，不冒充现场窗声。

索道片段为223829的24.75–28.05秒；猫叫为362953的0.070–0.535秒，落在影片19.85秒。旧索道concretica、旧猫叫Mike Koenig、旧登山靴/砂砾脚步和历史AI配乐均不参与本版。

## 冻结与重建

- `master.flac`：最终权威PCM母带；`master.mp3`用于HTML内嵌播放。
- `locked-other.flac`：已认可混音扣除原风铃后的整数PCM底层，包含已认可音乐。不得再处理。
- `original-chime.flac`：降音量前的风铃；`stems/chime.flac`：整体-2dB后风铃。
- `stems/`：13类当前分轨，保持成片电平。此前独立分轨的量化误差意味着简单重新相加可能差几个LSB，不能据此替换权威母带。
- `build-yahiko-v53.py` 验证非风铃PCM底层逐样本不变，并验证-2dB。导出只重采样到48kHz再编码AAC，不做总线归一化或限制。

这些许可覆盖所列音频，不为动画、字体或其他内容重新授权。发布时请使用输出目录的PUBLISH-CREDITS.txt保留必要署名、来源、许可与改动说明。
