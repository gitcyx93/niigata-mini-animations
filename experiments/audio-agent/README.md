# 弥彦开源音效 Agent 试验

2026-11-09。试点：V38 山顶看海段，12.8–17.1 秒。现有 V38 成品与音轨不变。

## 默认先用真实录音

三个项目都是声音生成模型，不是 Agent。此试点默认选择仓库已有的 Luftrum 海浪实录；AudioLDM2 作为可选对照。Agent 的主要工作是需求、素材选择、剪辑时段与增益，而不是必须生成声音。本次没有实现联网素材库搜索，也没有自动听觉评分。

在仓库根目录执行以下命令即可走真实素材路径，无需安装生成模型：

```sh
python3 experiments/audio-agent/pilot.py plan --out output/audio-agent/recorded-sea-01
python3 experiments/audio-agent/pilot.py select --out output/audio-agent/recorded-sea-01
afplay output/audio-agent/recorded-sea-01/audition.wav
YAHIKO_SEA_EXPERIMENT="$PWD/output/audio-agent/recorded-sea-01/mixer-input.json" PLAYWRIGHT_MODULE=/absolute/path/to/playwright node viz/tools/build-yahiko-v38-audio.cjs
```

默认候选来源、12 秒源偏移与 CC BY 3.0 署名从现有工程记录确定。外部候选必须填写作者、来源和许可；模型候选从生成记录验证 SHA256 并带入模型授权。

## 本次实现

- Agent 阅读 stories/yahiko-v38.md、V38 mix.json、来源记录和混音脚本，为看海段提出远景海浪需求与英文提示词。
- pilot.py plan 从现有 mix.json 读取时段、滤波参数，输出 cue.json。提示词是本次 Agent 写入的镜头方案；脚本本身没有调用 LLM，也没有实现通用视频理解。
- generate 使用官方 cvssp/audioldm2 的 Diffusers 实现，MPS float32，5 秒、50 步、种子 38/39 各一条。记录模型 revision、SHA256、加载与每条推理时间。50 步用于初筛，可在 cue.json 改为 200 步后用新目录运行。
- select 显式选择一条候选，检查时长、有限采样值、静音；按滤波后 RMS 与峰值计算增益，输出 mixer-input.json 和 4.3 秒 audition.wav。
- 原 build-yahiko-v38-audio.cjs 新增 YAHIKO_SEA_EXPERIMENT 配置入口。只替换海浪来源、源偏移和增益；复用原 WebAudio 混音、淡化、其他分轨及 WAV 编码。实验结果写入新目录，已有输出拒绝覆盖。未提供变量时保留原构建行为。
- 没有新增播放器或混音引擎；试听使用 afplay，整片仍由原工具混音。

## 三个方案核对

| 方案 | 代码与模型使用条件 | Mac 路线 | 部署成本判断 |
|---|---|---|---|
| AudioLDM2 | 仓库 LICENSE 为 CC-BY-NC-SA-4.0；setup.py 却标 MIT，元数据有冲突。官方 cvssp/audioldm2 模型卡明确 CC-BY-NC-SA-4.0。此次按非商业研究使用模型，发布需另选许可合适的来源或取得授权 | 原项目 README 明确支持 MPS，提示约 20GB RAM。48GB Mac 有尝试空间；原生依赖较旧，含 numpy<=1.23.5、transformers 4.30.2。试点采用官方也推荐的 Diffusers 路线 | 无 API 调用费；本机算力和下载。建议预留 15–25GB 磁盘作为环境与缓存预算（估计，非实测下载量）。首次安装规划 30–90 分钟，网络和兼容问题可能延长；推理时间由 generation.json 实测 |
| MMAudio | 代码 MIT；官方 README 明确 Hugging Face checkpoints 为 CC-BY-NC 4.0 | 官方只验证 Ubuntu；PyTorch 2.5.1+。演示脚本默认 8 秒，官方报告 16bit 推理约 6GB GPU 内存。未验证 MPS，不能把 6GB CUDA 数字直接当 Mac 用量 | 模型免费获取；本机移植投入高于 AudioLDM2。直接部署优先 Linux/NVIDIA；此次不租云 GPU，没有产生算力费用，未给未经实测的单条价格 |
| Foley-Omni | 原创代码 Apache-2.0；自身 v2st.pth MIT。第三方 EDM2 工具含 CC-BY-NC-SA，配套 MMAudio 权重保留上游条件；MIT 不覆盖整套管线 | 验证环境 Python3.10/CUDA12.4/PyTorch2.6/FlashAttention2.7.4；公开模型建议 <=10秒。没有可直接照抄的 Mac 安装路线 | 环境与权重组件最多，本次不选。官方没有提供足以估计本机耗时或云端单条费用的测试数据；需 Linux GPU 基准测试后报价 |

代码许可与模型许可分开记录，不能从仓库的 MIT 标签推导模型可商用。旅游公司用途优先继续用现有可署名素材；本次模型实验用于个人研究与试听。

核对来源：
- https://github.com/haoheliu/AudioLDM2/blob/main/README.md
- https://github.com/haoheliu/AudioLDM2/blob/main/LICENSE
- https://github.com/haoheliu/AudioLDM2/blob/main/setup.py
- https://huggingface.co/cvssp/audioldm2/blob/main/README.md
- https://github.com/hkchengrex/MMAudio/blob/main/README.md
- https://github.com/SAIL-PRLab/Foley-Omni/blob/main/README.md
- https://github.com/SAIL-PRLab/Foley-Omni/blob/main/MODEL_LICENSE
- https://github.com/SAIL-PRLab/Foley-Omni/blob/main/THIRD_PARTY_NOTICES.md

## 可选：在 Mac 上生成候选作对照

在此实验分支的仓库根目录执行。需要 Python 3.10、FFmpeg；本次依赖版本是固定试验配方，尚未完成安装与模型推理验证。独立环境避免影响其他项目。

```sh
python3.10 -m venv .venv-audio-agent
source .venv-audio-agent/bin/activate
python -m pip install -r experiments/audio-agent/requirements-mps.txt
python -c 'import torch; print(torch.__version__); print(torch.backends.mps.is_available())'
python experiments/audio-agent/pilot.py plan --out output/audio-agent/sea-01
PYTORCH_ENABLE_MPS_FALLBACK=1 python experiments/audio-agent/pilot.py generate --out output/audio-agent/sea-01
python -m pip freeze > output/audio-agent/sea-01/environment.txt
afplay output/audio-agent/sea-01/candidate-38.wav
afplay output/audio-agent/sea-01/candidate-39.wav
```

MPS 检测应为 True。CPU fallback 只允许不支持的算子回落，不能让不可用的 MPS 变为可用。两条按顺序生成，避免批量峰值内存。该实现以 CPU Generator 产生随机噪声，再在 MPS 推理；float32 避免直接复制 CUDA float16 配方。

选择听感较好的候选（以下以 38 为例），检查没有人声、音乐、突兀拍击和失真：

```sh
python experiments/audio-agent/pilot.py select --out output/audio-agent/sea-01 --candidate output/audio-agent/sea-01/candidate-38.wav
afplay output/audio-agent/sea-01/audition.wav
YAHIKO_SEA_EXPERIMENT="$PWD/output/audio-agent/sea-01/mixer-input.json" PLAYWRIGHT_MODULE=/absolute/path/to/playwright node viz/tools/build-yahiko-v38-audio.cjs
afplay output/audio-agent/sea-01/full-mix/master.wav
```

PLAYWRIGHT_MODULE 沿用原工程的 Playwright 安装。原混音器调用 headless Microsoft Edge（channel=msedge），需要本机已有 Edge；该依赖本次没有替换。原脚本用 git show HEAD 读历史分轨，需完整 Git checkout 中可取到这些路径，不能仅复制脚本运行。

输出：cue.json（需求）、candidate-38/39.wav（候选）、generation.json（模型与耗时）、selection.json（选择、电平及来源）、mixer-input.json（原混音器输入）、audition.wav（本镜头试听）、full-mix/master.wav、effects.wav、mix.json（27.8 秒整片）。配置包含本机绝对路径，换机器后重新 select。

暂时不装模型也能跑真实素材路径，复用 V38 已有 Luftrum 海浪：

```sh
python3 experiments/audio-agent/pilot.py plan --out output/audio-agent/sea-recording-01
python3 experiments/audio-agent/pilot.py select --out output/audio-agent/sea-recording-01 --candidate viz/autumn/audio/yahiko-v38/sea-source.ogg --offset 12 --license 'Luftrum, Oceanwavescrushing, CC BY 3.0; see viz/autumn/audio/yahiko-v38/LICENSES.md'
afplay output/audio-agent/sea-recording-01/audition.wav
YAHIKO_SEA_EXPERIMENT="$PWD/output/audio-agent/sea-recording-01/mixer-input.json" PLAYWRIGHT_MODULE=/absolute/path/to/playwright node viz/tools/build-yahiko-v38-audio.cjs
```

这是素材选择路径；不会把已有录音标为 AI 生成。

原生 AudioLDM2 MPS 对照命令（另建 Python3.10 venv；不和上面的 Diffusers 环境混装）：

```sh
python -m pip install 'git+https://github.com/haoheliu/AudioLDM2.git@b5786c5dc0ae8f766337fdc1b67ab6046586d14d'
PYTORCH_ENABLE_MPS_FALLBACK=1 audioldm2 --model_name audioldm2-full --device mps -b 1 -n 1 --ddim_steps 50 --seed 38 -dur 5 -t 'Soft distant ocean surf, gentle continuous waves washing against a shore.' -s output/native-sea
```

原生命令参数按官方 README 核对；依赖安装、自动权重下载仍待联网 Mac 验证。当前仓库 requirements 与 setup.py 存在不同依赖版本，因此不优先同时维护这套环境。

## 实际验证

- 当前执行环境 macOS arm64、torch 2.1.2，MPS False；未安装 diffusers，无模型缓存。
- 终端 git clone 失败：Could not resolve host: github.com。通过 GitHub 连接器读取了源码、时间与授权记录；连接器无法 UTF-8 解码二进制音轨。
- 2 个测试通过：从真实 mix.json 读取时段；使用明确标为测试夹具的正弦波，实际调用 FFmpeg 检查 4.3 秒/32kHz/双声道、峰值约束、非法偏移和过短音频拒绝。
- 原混音脚本 node --check 通过；本次没有重建原 V38，没有声称测试夹具是海浪候选。
- AudioLDM2 推理、真实候选试听、完整 WebAudio 重建与音画同步仍待上面的 Mac 命令完成。没有可交付的 AI 生成海浪试听文件。

## 复用到其他动画

可以复用需求 JSON、固定种子候选生成、来源与模型版本记录、候选试听和增益测量。下一部动画由 Agent 读取其分镜，输出新的 cue；不需要另建播放器。当前 plan 与 V38 混音入口针对一个镜头，尚不是任意镜头自动编排器。先用这次两条候选确认听感和耗时，再决定是否扩展事件表接口。

最有价值的下一次反馈是：两条候选有没有一条可用、generation.json 的单条耗时、整片里是否听起来像远景。这三项会直接决定继续本机生成还是让 Agent 优先检索可商用素材。

