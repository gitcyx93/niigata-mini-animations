# AI 动画检查：先读运行状态，再看关键帧

`viz/tools/inspect-animation.cjs` 是一个只读的采样检查入口。它使用独立的无头 Chromium，打开已有 HTML 的 `?record=1` 模式，调用现有 `render(t)`，输出 JSON。它不修改作品、内嵌字体、构建脚本或视频。

## 使用

需要 Node.js 22+、可解析的 `playwright` 包和对应 Chromium。已有工具环境可以继续使用；自选浏览器用 `BROWSER_EXE` 指定。以下命令从仓库根目录运行：

```sh
node viz/tools/inspect-animation.cjs --help
node viz/tools/inspect-animation.cjs viz/autumn/yahiko-v25.html --out /tmp/yahiko-inspection.json
node viz/tools/inspect-animation.cjs viz/winter/yuzawa-yukiguni.html --times 0,3.3,4.5,6.5,8.69,13,19.96 --out /tmp/yuzawa-inspection.json
node viz/tools/inspect-animation.cjs viz/autumn/yahiko-v25.html --compare viz/autumn/yahiko-v24.html --out /tmp/yahiko-comparison.json
```

可选环境变量：

| 变量 | 用途 |
|---|---|
| `BROWSER_EXE` | Chromium/Chrome 可执行文件的绝对路径；不依赖固定 Mac、Windows 或服务器目录 |
| `PLAYWRIGHT_MODULE` | 已安装的 Playwright 模块路径；未指定时使用 `require('playwright')` |
| `NODE_PATH` | Node 查找全局依赖的标准搜索路径，可复用原工具环境 |
| `BROWSER_ARGS` | 浏览器参数的 JSON 字符串数组，整组覆盖默认参数；例如 `'["--disable-accelerated-2d-canvas","--disable-dev-shm-usage"]'`。实际参数会记录在报告中 |

默认使用 `--disable-accelerated-2d-canvas` 固定 Canvas 2D 的光栅化路径，让连续像素回读期间的比较更稳定；没有默认关闭 GPU 或 WebGL。报告会记录 `canvas2DPolicy` 和完整启动参数。加速与软件后端的像素差异需要在同一种后端内复核，不能直接归因于作品逻辑；真实播放性能另用正常浏览器测量。

没有 `--times` 时，采样覆盖开头、四分位、结尾，以及可用 `PLAN` 的各镜头中点和切点前后约一帧。最多 60 个时刻，超出时均匀缩减并记录 `reduced`。指定时间必须满足 `0 <= t < duration`；页面的 `render(duration)` 往往会回到首帧，因此不将它误当作最后一帧。

## JSON 能告诉 AI 什么

| 字段 | 实际证据 |
|---|---|
| `source` | 输入文件 SHA-256、文件大小、所在工作树的 Git HEAD。文件哈希才代表实际被检查的内容；HEAD 不表示文件没有未提交修改 |
| `environment` | 浏览器版本、Node、视口、设备缩放和启动参数，便于判断两次结果是否可比 |
| `metadata.capabilities` | 页面实际暴露了哪些接口；缺失能力会保留为缺失，不记成通过 |
| `metadata.timeline / narration / textWindows` | 已存在的分镜、旁白和文字时段；未暴露时返回 `null`，不会从截图猜测 |
| `samples[].shot / sourceTime` | 通过现有函数得到当前镜头和映射后的源时间 |
| `samples[].state` | 已有相机、汤泽滑雪接地/屏幕边界/绘制统计，或新版弥彦小镇的风、脚、窗、猫、落叶状态 |
| `samples[].sha256` | 整张 Canvas 的全部 RGBA 字节哈希；三色与透明度全部参与，不是仅比较红色通道 |
| `samples[].determinism` | 同一时间先渲染、跳到另一时间、再返回，检验是否得到同一帧 |
| `samples[].renderMs / readbackMs` | 无头环境的同步渲染调用与像素回读耗时；它们不是实际显示帧率或用户设备性能 |
| `errors` | JavaScript 异常、控制台错误、请求失败、HTTP 错误、字体错误和采样异常 |

接口适配有明确边界：

- 顶层 `const`（如 `PLAN`、`STORY_C`、`SKI3D`）不一定属于 `window`，检查器在页面 JavaScript 环境中直接读取。
- 汤泽仅在三维滑雪时段读取 `SKI3D.getInfo()`，并检查返回的 `time`，避免把缓存的旧帧状态误报为当前状态。`webgl:false` 会保留其回退信息。
- 弥彦的旧 `cameraState(t, mode)` 不能代表所有新版镜头，因此检查器不会拿它冒充当前相机。没有可靠相机接口时输出 `actual_camera` 不可用。
- 弥彦小镇状态使用 `t - TOWN0` 作为局部时间；画面中不同对象的坐标仍按原函数的定义，工具不会自行声称它们都在同一坐标系。
- `render(t)` 不一定更新播放器的 `playTime`；报告的采样时间明确来自调用参数，不用播放器 UI 推断。

## 如何解读结果

`status: "completed"` 表示这次采样检查完成，未捕获运行错误或采样点确定性失败；不代表整片所有行为或美术质量已通过。退出码 `1` 表示检查运行失败或发现上述错误。参数错误、缺少浏览器和缺少标准渲染接口同样失败，不会静默跳过。

`--compare` 在同一浏览器环境中比较两个输入在共同采样时刻的像素哈希。`matches_at_samples: true` 只表示这些时刻相同。修改版存在差异可以是预期结果，因此差异独立报告，不自动改变退出码。时长不一致时报告 `durationMatches: false`，旧版无法覆盖的时间列入 `untestedSampleTimes`。

字体列表中没有条目不表示所需文字已验证。`null`、`unavailable`、`not_tested` 都表示缺乏这项证据。采样图片平均颜色是描述性统计，夜景偏暗不会据此自动判成错误。

声音、连续播放和视觉判断仍使用原有专项工具：

- 环境音代码遇到 `?record` 会跳过声音控制器。因此检查有声 HTML 的画面不能证明声音能播、拖动同步正确或无声画是否偏移；需要无 `record` 的正常播放页与 `YahikoSound.getState()`。
- `check-yahiko-sound.cjs`、`check-yahiko-v31.cjs` 和汤泽专项检查已有媒体时钟、播放/重播、接地、边界等断言，应保留。
- 检查器没有执行实时完整播放，也没有进行艺术评价或严格的离线依赖验证。这些范围明确记录在 `scope` 中。

## 下一步应该补什么

优先把新场景的已知语义整理成轻量的 `inspectAt(t)`：当前镜头、相机、主体在屏幕中的边界、当前文字、音画时间，以及有明确物理含义的接触点。绘制函数继续以时间为输入，读状态接口只返回普通 JSON。这样检查器不必长期依赖某一版本的内部变量名。

在自动检查中将机器能判定的事实作为断言，例如相同时间是否同一画面、脚是否离开水面、主体是否被裁切；对构图和节奏继续查看关键帧与连续视频。失败时保存对应证据，避免每次让 AI 重读所有历史 HTML 或大量截图。

## 相关官方工具

- [Playwright evaluate](https://playwright.dev/docs/evaluating)：在页面环境执行 JavaScript 并返回结构化数据，本检查器的核心能力。
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)：保留交互、DOM、控制台和请求上下文；适合调播放器交互，不会自动认识 Canvas 内的“猫”或“树”。
- [Playwright Clock](https://playwright.dev/docs/api/class-clock)：适合测试暂停、恢复和计时；`runFor` 与跳时 `fastForward` 的回调语义不同。它会替换 `performance` 等时钟，性能基准不应使用模拟时钟。
- [Chrome Performance](https://developer.chrome.com/docs/devtools/performance/reference)：查真实帧耗时、长任务、掉帧与渲染瓶颈。
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)：`renderer.info` 提供渲染统计，汤泽已经在使用。
- [Spector.js](https://github.com/BabylonJS/Spector.js)：可捕获 WebGL 绘制命令、着色器、纹理和状态；官方仓库也提供 [MCP 接口](https://github.com/BabylonJS/Spector.js/blob/master/mcp/README.md)。它适用于汤泽三维片段的深入排查，不是大多数 Canvas 2D 镜头的通用语义检查器。
