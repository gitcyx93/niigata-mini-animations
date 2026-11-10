# 动画检查与制作工具

## 当前作品检查

作品入口与规格统一来自根目录 `animations.json`。运行：

```sh
npm run check
npm run check -- --id yahiko --locale en
npm run check -- --static
```

默认检查脚本、字体、READY、尺寸、时长，以及开头、四分位、中点、四分之三和末帧附近的渲染。最后回到开头核对像素哈希，发现错误返回非零退出码。汤泽四分位采样覆盖三维滑雪场景。报告写入 `output/checks/latest.json`。

`npm run build:check` 另行核对 V38 可编辑源码与三语生成页面是否一致。它只校验，不写文件。

## 指定时间的详细检查

```sh
npm run inspect -- viz/autumn/yahiko-v38.html --times 0,3.3,12.8,20.6,27.7 --out output/checks/yahiko-detail.json
npm run inspect -- viz/autumn/yahiko-v38.html --compare /tmp/previous-yahiko.html --out output/checks/comparison.json
```

详细检查器通过独立无头 Chromium 的 `?record=1` 模式调用 `render(t)`，输出完整 RGBA SHA-256、乱序采样后的确定性、时间轴、页面已暴露的对象状态、字体、资源错误及同步渲染耗时。没有指定时间时，会按时间轴选择不超过 60 个样本。

`--compare` 在同一浏览器和光栅化设置下比较共同采样时刻；像素不同会明确列出时间，运行失败返回非零。检测到的基础相机字段不自动当成当前镜头的最终相机，未暴露的语义字段保留为空。

仓库内的 JSON 报告存放在 `output/`；也可写到仓库外的新 `.json`。已有文件只有带该工具的报告标记时才可替换，避免误覆盖源码、配置或素材。

## 环境

| 环境变量 | 用途 |
|---|---|
| `BROWSER_EXE` | 已安装 Chromium / Chrome / Edge 的可执行文件 |
| `BROWSER_CHANNEL` | Playwright 支持的浏览器 channel；指定 EXE 时优先使用 EXE |
| `PLAYWRIGHT_MODULE` | 复用现有 Playwright 安装，默认使用项目依赖 |
| `BROWSER_ARGS` | JSON 字符串数组，覆盖默认浏览器参数 |
| `FFMPEG` / `FFPROBE` | 录制、音频解码与媒体验证工具路径 |

检查器默认固定 Canvas 2D 的光栅化路径，比较前后版本时使用同一个浏览器。报告中的同步绘制耗时用于定位计算成本，实际播放帧率另行观察。

## 连续播放、声音与导出

`?record=1` 模式不启动正常声音控制器。修改播放或混音时，在 `npm run dev` 提供的正常页面检查对应操作与时段；播放检查与像素采样各自回答不同问题。

导出使用 `npm run record -- <作品ID或HTML> --out output/film.mp4`。逐帧渲染后用 FFprobe 验证完整解码帧数、时长、尺寸、帧率及音视频编码。新文件先在临时路径完成，成功后再发布；已有成品必须显式传 `--force`。

兼容入口 `viz/tools/check.js` 支持旧的 `--strip output/frames.png`、`--at`、`--compare`；它调用同一个详细检查器，不再维护另一套就绪/错误判断。旧的按 V11/V25/V31 复制的检查脚本已退役。

## 相关接口

- [Playwright evaluate](https://playwright.dev/docs/evaluating)：读取页面状态并调用指定时间的绘制。
- [Playwright browsers](https://playwright.dev/docs/browsers)：安装浏览器与选择现有浏览器。
- [FFprobe](https://ffmpeg.org/ffprobe.html)：机器可读的媒体验证。

GitHub Actions 运行当前工具测试、构建一致性和作品检查；生成结果与临时比较材料默认不纳入 Git。
