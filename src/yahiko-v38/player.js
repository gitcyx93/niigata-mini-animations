/* Environment-only soundtrack controller for the unchanged v16-travel canvas.
 * Generated page embeds this file, mix.json and master.m4a; no network is needed.
 * The audio media clock is authoritative. The silent original remains available.
 */
(() => {
  'use strict';
  const metadata = JSON.parse(document.getElementById('yahiko-sound-config').textContent);
  window.YAHIKO_SOUND_METADATA = metadata;
  if (new URLSearchParams(location.search).has('record')) return;
  document.title += ' · 环境音';

  // Stop the original performance.now() clock; keep its render functions intact.
  playing = false;
  lastTime = 0;
  playTime = 0;
  update(0);

  const seconds = metadata.duration_seconds;
  const audio = document.createElement('audio');
  audio.id = 'yahiko-environment-audio';
  audio.preload = 'auto';
  audio.loop = true;
  audio.src = document.getElementById('yahiko-audio-data').textContent.trim();
  document.body.appendChild(audio);

  const playButton = document.getElementById('play');
  const seekBar = document.getElementById('seek');
  const timeLabel = document.getElementById('clock');
  const canvas = document.getElementById('c');
  const control = document.querySelector('.control');
  const note = document.createElement('p');
  note.className = 'intro';
  note.style.cssText = 'font-size:12px;line-height:1.8;margin:16px 0 8px';
  note.textContent = '正式发布版：无配乐，原远处鸟鸣延续到温泉街。海浪、风铃、猫叫、窗框与循环风叶保留；点击有声播放。';
  control.appendChild(note);
  const credits=document.createElement('p');credits.className='sources';credits.innerHTML='猫叫：Mike Koenig · CC BY 3.0；索道：concretica · CC BY 4.0；海浪：Luftrum · CC BY 3.0。<a href="audio/yahiko-v38/LICENSES.md" target="_blank" rel="noopener">音效来源与授权</a>';control.appendChild(credits);

  const soundControls = document.createElement('div');
  soundControls.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px';
  const muteButton = document.createElement('button');
  muteButton.id = 'sound-mute';
  muteButton.type = 'button';
  muteButton.textContent = '静音';
  muteButton.setAttribute('aria-pressed', 'false');
  const volumeLabel = document.createElement('label');
  volumeLabel.textContent = '音量 ';
  const volume = document.createElement('input');
  volume.id = 'sound-volume';
  volume.type = 'range';
  volume.min = '0';
  volume.max = '1';
  volume.step = '0.05';
  volume.value = '1';
  volume.style.cssText = 'width:110px;margin:0 5px;height:16px;vertical-align:middle';
  volume.setAttribute('aria-label', '环境音播放音量');
  volumeLabel.appendChild(volume);
  const loopLabel = document.createElement('label');
  const loop = document.createElement('input');
  loop.id = 'sound-loop';
  loop.type = 'checkbox';
  loop.checked = true;
  loop.style.cssText = 'width:auto;height:auto;margin:0 5px 0 0';
  loopLabel.append(loop, '循环');
  soundControls.append(muteButton, volumeLabel, loopLabel);
  control.appendChild(soundControls);
  const sheet=document.createElement('details');sheet.open=true;sheet.style.marginTop='18px';
  sheet.innerHTML='<summary>音效时间表与分轨试听</summary><p>4秒原声已恢复。先单听下面三层，确定哪一层不对；分轨保留成片音量。</p><div id="solo-buttons" style="display:flex;gap:5px;flex-wrap:wrap"></div><table style="width:100%;text-align:left;font-size:11px;line-height:1.8"><tbody><tr><td>0–3.5 秒</td><td>开场静场（与杉林底音交叠）</td></tr><tr><td>3.0–9.9 秒</td><td>原杉林环境底轨（含4秒原声）</td></tr><tr><td>3.2–9.9 秒</td><td>新增树林风</td></tr><tr><td>3.3–8.65 秒</td><td>自然风铃连响，一段实录、不循环</td></tr><tr><td>9.6–13.4 秒</td><td>缆车空气；9.8–13秒叠轻索道低鸣</td></tr><tr><td>10.15、11.45 秒</td><td>两句鸟鸣</td></tr><tr><td>12.8–17.1 秒</td><td>轻远海浪，替换原开阔地风声</td></tr><tr><td>16.8–21.1 秒</td><td>夜景静场；17.15–20.6秒叠风叶声</td></tr><tr><td>20.45–24.23 秒</td><td>原小镇单声风铃及尾音</td></tr><tr><td>20.6–27.8 秒</td><td>细水、窗框声（随窗扇动作）</td></tr><tr><td>23.45–24.70 秒</td><td>猫叫</td></tr><tr><td>25.8 秒→下一轮1.3秒</td><td>片尾跨循环风叶</td></tr><tr><td>21.6、22.7、25.1、26.25 秒</td><td>延续原远处鸟鸣；全片无配乐</td></tr></tbody></table>';
  const audition=document.createElement('audio');audition.controls=true;audition.preload='none';audition.style.cssText='width:100%;height:34px;margin:8px 0';audition.setAttribute('aria-label','音效分轨试听');sheet.insertBefore(audition,sheet.querySelector('table'));control.appendChild(sheet);
  for(const [label,file]of [['原底轨：3–6秒','audition-base-3-6.wav'],['神社风铃','audition-shrine-chime.wav'],['神社树林风','audition-shrine-wind.wav'],['只听海景','audition-sea.wav']]){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{audio.pause();audition.src='audio/yahiko-v38/'+file;audition.play().catch(()=>{message.textContent='请点击分轨播放器的播放键';});refresh();};sheet.querySelector('#solo-buttons').appendChild(button);}


  const message = document.createElement('p');
  message.id = 'sound-status';
  message.setAttribute('role', 'status');
  message.style.cssText = 'font-size:11px;line-height:1.8;color:#b5c6ba;margin:10px 0';
  message.textContent = '已暂停；画面与声音使用同一音频时钟。';
  control.appendChild(message);
  const options = document.querySelector('.options');
  if (options) options.style.display = 'none';
  const openingNote = document.getElementById('opening-note');
  if (openingNote) openingNote.style.display = 'none';
  document.getElementById('duration-note').textContent = '弥彦 V38 · 环境音与猫叫 · 27.8 秒';

  function refresh() {
    playButton.textContent = audio.paused ? '有声播放' : '暂停';
    playButton.setAttribute('aria-label', audio.paused ? '播放动画与环境音' : '暂停动画与环境音');
    const t = Math.min(audio.currentTime || 0, seconds);
    seekBar.value = String(Math.min(t, seconds - 0.01));
    timeLabel.textContent = `${t.toFixed(1)} / ${seconds.toFixed(1)} 秒`;
    muteButton.textContent = audio.muted ? '开声音' : '静音';
    muteButton.setAttribute('aria-pressed', String(audio.muted));
  }
  async function start() {
    audition.pause();
    try {
      if (audio.ended || audio.currentTime >= seconds) audio.currentTime = 0;
      await audio.play();
      message.textContent = '播放中 · 环境音，无背景音乐。';
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.textContent = `声音未能播放，请再次点击播放：${error.message}`;
      }
    }
    refresh();
  }
  function toggle() {
    playing = false;
    if (audio.paused) start(); else audio.pause();
  }
  function position(t, resume = false) {
    audio.pause();
    audio.currentTime = Math.max(0, Math.min(Number(t), seconds - 0.01));
    refresh();
    if (resume) start();
  }

  // Existing source keyboard handlers call play.click(), so replacing the button
  // handler also keeps spacebar and canvas interaction on the media clock.
  playButton.onclick = toggle;
  canvas.onclick = toggle;
  document.getElementById('restart').onclick = () => position(0, true);
  document.getElementById('watch-end').onclick = () => position(13.6, true);
  seekBar.oninput = () => position(seekBar.value);
  document.querySelectorAll('[data-time]').forEach(button => {
    button.onclick = () => position(button.dataset.time);
  });
  muteButton.onclick = () => { audio.muted = !audio.muted; refresh(); };
  volume.oninput = () => { audio.volume = Number(volume.value); };
  loop.onchange = () => { audio.loop = loop.checked; };
  audio.addEventListener('pause', () => {
    message.textContent = audio.ended ? '播放结束。' : '已暂停。';
    refresh();
  });
  audio.addEventListener('playing', refresh);
  audio.addEventListener('seeked', refresh);
  audio.addEventListener('error', () => {
    message.textContent = '环境音读取失败；请确认使用完整生成的HTML，并尝试近期版本Chrome或Safari。';
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {audio.pause();audition.pause();}
  });

  let lastRendered = null;
  function frame() {
    if (window.READY && !document.hidden) {
      const t = Math.min(audio.currentTime || 0, seconds - 0.00001);
      if (t !== lastRendered) {
        window.render(t);
        playTime = t;
        lastRendered = t;
      }
      refresh();
    }
    requestAnimationFrame(frame);
  }
  window.YahikoSound = {
    audio,
    metadata,
    seek: position,
    play: start,
    pause: () => audio.pause(),
    getState: () => ({
      time: audio.currentTime, paused: audio.paused, duration: audio.duration,
      renderedTime: lastRendered, sourceClockPlaying: playing,
      muted: audio.muted, loop: audio.loop, volume: audio.volume
    })
  };
  refresh();
  requestAnimationFrame(frame);
})();
