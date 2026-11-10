#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawn, spawnSync} = require('node:child_process');
const {once} = require('node:events');
const assert = require('node:assert/strict');
const {launchBrowser, openAnimation, assertNoPageErrors} = require('./lib/browser.cjs');

const {ROOT, resolveAnimation} = require('./lib/catalog.cjs');
const HELP = `Usage:
  node viz/tools/record-animation.cjs <page.html> <output.mp4> [options]
  node viz/tools/record-animation.cjs <animation-id> --locale zh [options]
  node viz/tools/record-animation.cjs --animation yahiko --locale en [options]

  --out file.mp4        Output path; catalog entries have a default output path
  --seconds N           Duration to export; defaults to the page duration
  --start N             Starting time; defaults to the page START_SECONDS or zero
  --fps N               Frames per second (default 30)
  --audio file          Audio timeline; catalog entries supply their own audio
  --silent              Export without audio
  --report file.json    Export evidence (default: output.mp4.json)
  --force               Replace an existing export after a successful new export
  --help                Show help without loading Playwright or FFmpeg

Uses lossless PNG frames, H.264/yuv420p/BT.709 and AAC stereo 48 kHz.
Environment: PLAYWRIGHT_MODULE, BROWSER_EXE, BROWSER_CHANNEL, BROWSER_ARGS,
FFMPEG, FFPROBE. No installed Microsoft Edge or machine-specific paths required.`;

const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function canonicalDestination(file) {
  let existing = file;
  const tail = [];
  while (!fs.existsSync(existing)) {
    tail.unshift(path.basename(existing));
    const parent = path.dirname(existing);
    if (parent === existing) break;
    existing = parent;
  }
  return path.resolve(fs.realpathSync(existing), ...tail);
}

function validateReportTarget(report, {source, audio, out, force}) {
  if (path.extname(report).toLowerCase() !== '.json') throw Error('Report must have a .json extension');
  const destination = canonicalDestination(report);
  const root = fs.realpathSync(ROOT);
  if (destination.startsWith(root + path.sep) && !destination.startsWith(path.join(root, 'output') + path.sep)) {
    throw Error('Reports inside the repository must be written under output/');
  }
  if ([source, audio, out].filter(Boolean).some(file => canonicalDestination(file) === destination)) {
    throw Error('Report must not overwrite an input or video');
  }
  if (fs.existsSync(report)) {
    if (fs.lstatSync(report).isSymbolicLink() || !fs.statSync(report).isFile()) throw Error('Report target must be a regular file');
    if (!force) throw Error(`Report exists: ${report}. Use --force to replace this export and its report.`);
    let previous;
    try {previous = JSON.parse(fs.readFileSync(report, 'utf8'));}
    catch {throw Error(`Refusing to overwrite an unrelated report file: ${report}`);}
    if (previous.tool !== 'record-animation' || previous.schemaVersion !== 1 || previous.file !== out || previous.source !== source) {
      throw Error(`Refusing to overwrite an unrelated report file: ${report}`);
    }
  }
}

function parseOptions(argv) {
  const options = {fps: 30, locale: 'zh'};
  const positionals = [];
  const valued = new Set(['out', 'seconds', 'start', 'fps', 'audio', 'report', 'animation', 'locale']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return {help: true};
    if (arg === '--force') options.force = true;
    else if (arg === '--silent' || arg === '--no-audio') options.silent = true;
    else if (arg.startsWith('--') && valued.has(arg.slice(2))) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = argv[++i];
    } else if (arg.startsWith('-')) throw Error(`Unknown option: ${arg}`);
    else positionals.push(arg);
  }
  if (positionals.length > 2) throw Error('Too many positional arguments; use --seconds and --fps');
  if (options.animation && positionals.length) throw Error('Use an animation ID or a page path, not both');
  if (!options.animation && !positionals[0]) throw Error('An animation ID or HTML file is required. Use --help.');
  if (options.out && positionals[1]) throw Error('Specify the output path once');
  if (positionals[0]) options.source = positionals[0];
  if (positionals[1]) options.out = positionals[1];
  for (const key of ['seconds', 'start', 'fps']) if (options[key] !== undefined) {
    options[key] = Number(options[key]);
    if (!Number.isFinite(options[key]) || (key === 'start' ? options[key] < 0 : options[key] <= 0)) {
      throw Error(`--${key} must be a finite ${key === 'start' ? 'nonnegative' : 'positive'} number`);
    }
  }
  if (options.fps > 240) throw Error('--fps must not exceed 240');
  return options;
}

function resolveInput(options) {
  const animation = resolveAnimation(options.animation || options.source, options.locale || 'zh');
  if (options.animation && !animation.id) throw Error(`Unknown animation: ${options.animation}`);
  const source = animation.file;
  let audio = animation.audioFile || undefined;
  let output;
  if (animation.id) {
    output = path.resolve(ROOT, animation.output || path.join(animation.outputDir || `output/${animation.id}`, `${animation.id}-${animation.locale}.mp4`));
  } else if (!options.out) throw Error('An output MP4 path is required for a page input');
  if (options.audio) audio = path.resolve(options.audio);
  if (options.silent) audio = undefined;
  if (options.out) output = path.resolve(options.out);
  const report = path.resolve(options.report || `${output}.json`);
  for (const file of [source, audio].filter(Boolean)) {
    if (!fs.statSync(file).isFile()) throw Error(`Not a file: ${file}`);
  }
  if (path.extname(output).toLowerCase() !== '.mp4') throw Error('Output must have an .mp4 extension');
  if ([source, audio].includes(output) || [source, audio, output].includes(report)) throw Error('Output and report paths must differ from the inputs and each other');
  if (!options.force && fs.existsSync(output)) throw Error(`Export exists: ${output}. Use --force to replace it.`);
  validateReportTarget(report, {source, audio, out: output, force: options.force});
  return {...options, source, audio, out: output, report, locale: animation.locale,
    viewport: animation.id && {width: animation.width, height: animation.height},
    expected: animation.id && {duration: animation.duration, width: animation.width, height: animation.height},
    animation: animation.id || null};
}

function command(executable, args, options = {}) {
  const result = spawnSync(executable, args, {encoding: 'utf8', windowsHide: true, timeout: 120000, maxBuffer: 8 * 1024 * 1024, ...options});
  if (result.error) throw Error(`Could not run ${executable}: ${result.error.message}`);
  if (result.status !== 0) throw Error(`${executable} exited ${result.status}: ${result.stderr.trim()}`);
  return result;
}

function ffprobePath(ffmpeg) {
  if (process.env.FFPROBE) return process.env.FFPROBE;
  if (path.dirname(ffmpeg) !== '.') {
    const sibling = path.join(path.dirname(ffmpeg), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
    if (fs.existsSync(sibling)) return sibling;
  }
  return 'ffprobe';
}

function verifyVideo(file, {ffprobe, width, height, frames, fps, seconds, audio}) {
  const result = command(ffprobe, ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]);
  if (result.stderr.trim()) throw Error(`Media decode errors: ${result.stderr.trim()}`);
  const info = JSON.parse(result.stdout);
  const video = info.streams.find(stream => stream.codec_type === 'video');
  const sound = info.streams.find(stream => stream.codec_type === 'audio');
  assert(video, 'Export has no video stream');
  assert.equal(video.codec_name, 'h264', 'Video codec');
  assert.equal(video.pix_fmt, 'yuv420p', 'Video pixel format');
  assert.equal(video.width, width, 'Video width');
  assert.equal(video.height, height, 'Video height');
  assert.equal(Number(video.nb_read_frames), frames, 'Decoded frame count');
  const [numerator, denominator] = video.avg_frame_rate.split('/').map(Number);
  assert(Math.abs(numerator / denominator - fps) < 0.001, 'Video frame rate');
  assert(Math.abs(Number(info.format.duration) - seconds) <= Math.max(1 / fps, 0.03), 'Video duration');
  if (audio) {
    assert(sound, 'Export has no audio stream');
    assert.equal(sound.codec_name, 'aac', 'Audio codec');
    assert.equal(Number(sound.sample_rate), 48000, 'Audio sample rate');
    assert.equal(sound.channels, 2, 'Audio channels');
  } else assert(!sound, 'Silent export unexpectedly has audio');
  return {video, audio: sound || null, duration: Number(info.format.duration)};
}

function publishFile(partial, target, force) {
  if (force) fs.renameSync(partial, target);
  else {
    // A hard link claims the destination atomically, without overwriting a file
    // another exporter may have created after our initial existence check.
    fs.linkSync(partial, target);
    fs.unlinkSync(partial);
  }
}

function stageJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
    return temporary;
  } catch (error) {
    fs.rmSync(temporary, {force: true});
    throw error;
  }
}

async function record(options, {log = console.log, preflight} = {}) {
  const input = resolveInput(options);
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const ffprobe = ffprobePath(ffmpeg);
  command(ffmpeg, ['-version']);
  command(ffprobe, ['-version']);
  const partial = path.join(path.dirname(input.out), `.${path.basename(input.out, '.mp4')}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.partial.mp4`);
  let browser, context, encoder, interrupted, stagedReport;
  const onSignal = signal => {
    interrupted = signal;
    if (encoder && encoder.exitCode === null) encoder.kill();
  };
  const onInterrupt = () => onSignal('SIGINT');
  const onTerminate = () => onSignal('SIGTERM');
  process.once('SIGINT', onInterrupt);
  process.once('SIGTERM', onTerminate);
  try {
    const sourceSha256 = hash(input.source);
    const audioSha256 = input.audio ? hash(input.audio) : null;
    browser = await launchBrowser();
    const opened = await openAnimation(browser, input.source, {viewport: input.viewport});
    context = opened.context;
    const {page, metadata, errors} = opened;
    for (const [key, value] of Object.entries(input.expected || {})) {
      if (value !== undefined) assert.equal(metadata[key], value, `Page ${key} differs from animations.json`);
    }
    const preflightResult = preflight ? await preflight({page, metadata}) : null;
    assertNoPageErrors(errors);
    if (metadata.width % 2 || metadata.height % 2) throw Error('H.264/yuv420p requires even canvas dimensions');
    const fps = input.fps || 30;
    const requestedSeconds = input.seconds ?? metadata.duration;
    const frames = Math.round(requestedSeconds * fps);
    if (!Number.isSafeInteger(frames) || frames < 1) throw Error('Export must contain at least one frame');
    const seconds = frames / fps;
    const start = (input.start ?? metadata.startSeconds) % metadata.duration;
    fs.mkdirSync(path.dirname(input.out), {recursive: true});
    const args = ['-nostdin', '-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(fps), '-i', 'pipe:0'];
    if (input.audio) args.push('-stream_loop', '-1', '-ss', String(start), '-i', input.audio);
    args.push('-map', '0:v:0');
    if (input.audio) args.push('-map', '1:a:0');
    args.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast', '-threads', '4', '-r', String(fps));
    if (input.audio) args.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2');
    args.push('-t', String(seconds), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', partial);
    encoder = spawn(ffmpeg, args, {windowsHide: true, stdio: ['pipe', 'ignore', 'pipe']});
    let stderr = '';
    encoder.stderr.on('data', data => {stderr = (stderr + data).slice(-65536);});
    encoder.stdin.on('error', () => {});
    const exit = new Promise((resolve, reject) => {
      encoder.once('error', reject);
      encoder.once('close', code => code === 0 ? resolve() : reject(Error(`FFmpeg exited ${code}: ${stderr}`)));
    });
    exit.catch(() => {});
    log(`Rendering ${frames} frames at ${fps} fps: ${path.basename(input.out)}`);
    for (let frame = 0; frame < frames; frame++) {
      if (interrupted) throw Error(`Export interrupted by ${interrupted}`);
      if (encoder.exitCode !== null) throw Error(`Encoder stopped before all frames were sent: ${stderr}`);
      const time = (start + frame / fps) % metadata.duration;
      const data = await page.evaluate(time => {
        window.render(time);
        return document.getElementById('c').toDataURL('image/png').split(',')[1];
      }, time);
      assertNoPageErrors(errors);
      if (!encoder.stdin.write(Buffer.from(data, 'base64'))) {
        await Promise.race([
          once(encoder.stdin, 'drain'),
          exit.then(() => {throw Error('Encoder closed before input ended');})
        ]);
      }
      if (frame > 0 && frame % 150 === 0) log(`${frame}/${frames} frames`);
    }
    encoder.stdin.end();
    await exit;
    assertNoPageErrors(errors);
    if (interrupted) throw Error(`Export interrupted by ${interrupted}`);
    const media = verifyVideo(partial, {...metadata, frames, fps, seconds, ffprobe, audio: !!input.audio});
    assert.equal(hash(input.source), sourceSha256, 'Source changed during export');
    if (input.audio) assert.equal(hash(input.audio), audioSha256, 'Audio source changed during export');
    const report = {
      tool: 'record-animation', schemaVersion: 1, createdAt: new Date().toISOString(), file: input.out,
      bytes: fs.statSync(partial).size, sha256: hash(partial),
      source: input.source, sourceSha256, audio: input.audio || null, audioSha256,
      animation: input.animation, locale: input.locale, fps, frames, start,
      requestedSeconds, duration: seconds, width: metadata.width, height: metadata.height,
      browser: browser.version(), node: process.version,
      frameTransport: 'lossless PNG', decode: 'passed', pageErrors: errors, preflight: preflightResult, media
    };
    // Stage the evidence before publishing a video, so an unwritable report
    // directory cannot replace a previously successful export.
    validateReportTarget(input.report, input);
    stagedReport = stageJson(input.report, report);
    publishFile(partial, input.out, input.force);
    try {
      validateReportTarget(input.report, input);
      publishFile(stagedReport, input.report, input.force);
    } catch (error) {
      throw Error(`Video exported successfully to ${input.out}, but its report could not be published: ${error.message}`);
    }
    log(`Exported ${input.out}\nReport: ${input.report}`);
    return report;
  } finally {
    process.removeListener('SIGINT', onInterrupt);
    process.removeListener('SIGTERM', onTerminate);
    if (encoder && encoder.exitCode === null) encoder.kill();
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    fs.rmSync(partial, {force: true});
    if (stagedReport) fs.rmSync(stagedReport, {force: true});
  }
}

async function main(argv = process.argv.slice(2)) {
  const options = parseOptions(argv);
  if (options.help) return console.log(HELP);
  await record(options);
}

module.exports = {ROOT, HELP, parseOptions, resolveInput, validateReportTarget, record, main, verifyVideo};
if (require.main === module) main().catch(error => {console.error(error.message); process.exitCode = 1;});
