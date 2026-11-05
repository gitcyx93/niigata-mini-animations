# 弥彦 v25 音效候选

已下载 **6 个音频：细流水 2 个，其余四类各 1 个**，均为 Freesound 无需登录的公开 **MP3 preview（非原件）**。未注册、未绕过原件登录限制、无背景音乐、未改动画或混音。原始候选保持下载时的内容。

## 当前选择

| 类别 | 本地文件 | 许可／作者 | 建议镜头与优先级 |
|---|---|---|---|
| 日式风铃 | [501168-furin-preview.mp3](01-wind-chime/501168-furin-preview.mp3) | CC0 1.0／ayustat2001 | **优先检查**。作者明确为日式 FUURIN，页面时长约4.27秒；在20.4–21.5秒转入小镇时选一个轻音，必要时22.5–23.8秒另选更轻一声，不整段重复。 |
| 风叶 | [575645-leaves-preview.mp3](02-leaves/575645-leaves-preview.mp3) | CC0 1.0／Garuda1982 | **优先检查**。大型树叶风中沙沙声，适合17–20.6秒的一阵风；选平缓短段，不逐片落叶配音。 |
| 细流水（当前优先） | [637977-small-water-trickle-preview.mp3](03-water/637977-small-water-trickle-preview.mp3) | CC0 1.0／kyles | **优先试听**。作者描述为 small water trickle，页面约74.23秒；20.6–24.6秒温泉街入水意象的候选，非温泉实录。公开 HQ MP3 preview，未裁切。 |
| 细流水 | [349076-trickling-stream-preview.mp3](03-water/349076-trickling-stream-preview.mp3) | CC0 1.0／Yoyodaman234 | **有条件备选**。作者称缓慢细流，但附近有急流；适合20.6–24.6秒温泉入水意象，若急流底过强则弃用，不冒充已确认的温泉入水口。 |
| 碎石脚步 | [257468-gravel-steps-preview.mp3](04-footsteps/257468-gravel-steps-preview.mp3) | CC0 1.0／mlsulli | 3.2–9.8秒明确步行的镜头备选，只取1–2步；片尾静立人物不使用。 |
| 索道 | [240532-ropeway-preview.mp3](05-ropeway/240532-ropeway-preview.mp3) | CC BY 4.0／concretica | 作者标注为乌克兰喀尔巴阡山真实索道现场录音，非火车替代。9.8–13秒备选；尚不能确认有适合极低持续运行声的干净段落，不合适便留空。 |

## 元数据与检查

- `manifest.json`：每个音频的文件名、作者、来源页、实际下载URL、许可链接、preview标记、格式、字节大小及来源页面时长。
- `DONE.json`：下载状态、成功数、分类数量与未完成项。
- `source-pages/`：搜索与来源HTML，**仅为来源记录，不计作音频**。
- `download-candidates.mjs`：本次下载脚本，拒绝覆盖同名音频；`search-sounds.mjs`：本次搜索脚本。无需安装依赖。
- 下载时对每个文件做了一次 MP3 文件头检查，排除了网页冒充音频；尚未做解码时长核对。页面时长不冒充预览文件的实测时长。

## 许可／署名

除索道外的五个文件为 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)，仍保留作者和来源方便追溯。索道为 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，使用时须署名并说明改动，例如：

> “09 - cableway - ropeway - ski-lift in the summer [.wav]” — concretica，Freesound：https://freesound.org/people/concretica/sounds/240532/ ，CC BY 4.0。使用公开预览版。（若后续裁切、调节音量或均衡，请如实添加改动说明。）

## 未完成与质量边界

- 五类都已有候选，但**未完成试听验收**，不是可直接混入动画的最终素材包。波形图、裁切和混音不是本次下载任务的交付要求，未执行。
- 目前推荐顺序按作者描述与镜头需求：先风铃与风叶，其次细流水，脚步及索道仅备选。
- 尚未确认各素材无人声、交通或其他干扰；尤其**干净温泉细流水与低稳索道低鸣仍属于待验证缺口**，不为了凑齐类别保证合格。
- 后续处理须保留这些下载的预览文件（不是原件），另存处理版，记录裁切起止与处理参数；不合成、不混音、不设置未经试听验证的最终音量。
- 未采用的来源包括：87801与108388为非优先的CC BY-NC；205903描述仅为游乐园，声源不够明确；360735为水落在金属上，不优先用作自然温泉入水声。
