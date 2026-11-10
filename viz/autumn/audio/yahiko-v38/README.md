# V38 audio production inputs

The approved release is `master.wav`, byte-identical to `effects.wav`. Both are 27.8 seconds, stereo, 32 kHz, PCM 16-bit, with no background music. `mix.json` records that approved build; it is a report, not an editable recipe.

## Rebuild an audition

From the repository root:

```sh
node viz/tools/build-yahiko-v38-audio.cjs
node viz/tools/build-yahiko-v38-audio.cjs --out output/audio/another-audition
```

The default writes six WAVs and a measured `mix.json` to `output/audio/yahiko-v38/`. Existing audition output under the repository’s `output/` is replaced. For an existing same-named file elsewhere, add `--force`; symlink destinations are rejected. All WAVs are checked before replacement, with previous files restored if a replacement fails. It leaves the approved release untouched. Building requires Playwright and a Chromium-compatible browser; `PLAYWRIGHT_MODULE`, `BROWSER_EXE` and `BROWSER_CHANNEL` use the shared tooling configuration. If that browser lacks a source codec (such as AAC), an installed FFmpeg is used only to decode that input to float PCM; set `FFMPEG` if it is not on PATH.

`build-config.json` is the editable recipe:

- `sources`: the eleven local source files, resolved relative to the recipe file.
- `levels`: `enabled` and `gainDb` for each named layer. The `forest` layer is the quiet shrine breeze; `leaves` controls the two larger wind-leaf accents.
- `masterGainDb`: gain applied equally to all layers, including the solo audition WAVs.

All default gain offsets are 0 dB. Window motion is read from the current `src/yahiko-v38/animation.js`. The original timings, source crops, envelopes, filters, pans, motion-driven window gain and source-dependent normalization remain in the mixer. The result records the recipe, visual-source and audio-input hashes plus decoder versions. Decoder versions can produce small PCM differences; published playback continues to use the committed approved WAVs. A mix with excessive peak level fails before writing output.

Use `--config path/to/recipe.json` for a separate experiment. Only an explicit release update writes into this directory:

```sh
node viz/tools/build-yahiko-v38-audio.cjs --update-release
```

## Self-contained inputs

Seven inputs formerly hidden in old V18/V25 pages, outputs and review folders now live in `sources/`. They were copied byte-for-byte; `v25-quiet.m4a` was decoded from an existing base64 payload without transcoding. The four newer recordings retain their existing paths alongside this README. No Git history or old-version checkout is needed to rebuild.

[sources/manifest.json](sources/manifest.json) records each input's hash, size and previous path. Source authors, licences, edits and required publication attribution are in [LICENSES.md](LICENSES.md) and the retained records under `sources/`.
