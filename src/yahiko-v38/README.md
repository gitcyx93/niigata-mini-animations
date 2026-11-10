# V38 制作源码

三种语言的独立 HTML 都由这里构建，继续使用原来的 `viz/autumn/yahiko-v38*.html` 入口。

| 文件 | 用途 |
|---|---|
| `page.html`、`styles.css` | 页面结构与播放器排版 |
| `animation.js` | 场景、镜头、时间轴和画面文字的简体源 |
| `leaf-motion.js` | 确定性的 60 Hz 落叶积分与有界状态缓存 |
| `series.js` | V38 使用的系列代码快照；保留已确认的字体样式 |
| `player.js` | 环境音时钟、播放控制与分轨试听 |
| `fonts.js`、`fonts/` | 字体加载代码与按内容去重的 WOFF2 资源 |
| `locales/zh.json`、`en.json`、`tw.json` | 字体清单，以及已确认的语言和排版差异 |

在仓库根目录运行：

```sh
node viz/tools/build-yahiko-v38.cjs
node viz/tools/build-yahiko-v38.cjs --check
node viz/tools/check-leaf-motion.cjs
```

构建不需要翻译服务或字体下载。`--check` 只核对生成文件与源码是否一致；`--locale en,tw` 可只生成指定语言。原来的 `build-yahiko-v38-locales.cjs` 命令也仍可使用。

语言文件的 `overrides` 是已确认文本和排版的精确替换，每一项包含 `from` 和 `to`。构建要求每项恰好匹配一次，源代码改到对应位置时会明确报错；在核对该语言后更新对应替换。整个 JavaScript 不再经过自动繁简转换。

字体从原成品中提取，构建时按各语言清单重新内嵌。字体与音效授权继续保留在原来的许可文件中。需要新增字形时，更新字体资源及清单，再重建相关语言。

落叶采样仍按原来的 60 Hz 步进公式计算。相同叶片的已计算状态可直接复用，倒序和乱序定位得到相同结果。缓存只覆盖画面会使用的区间（至 6.4 秒），超出区间的查询继续计算，但不会增加缓存容量。
