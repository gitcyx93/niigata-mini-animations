# Yahiko V38 · social media release package

The bilingual web pages and ambience master are uploaded first. MP4 files are being rendered locally and will be delivered separately; the filenames below describe the planned release files.

雙語網頁與無配樂母帶先行上傳；MP4 在本地繼續錄製，完成後另行交付。

## Files

- `yahiko-v38-en-social.mp4` — English captions.
- `yahiko-v38-tw-social.mp4` — Taiwan Traditional Chinese captions and embedded Traditional Chinese fonts.
- Both: 1080×1920 (9:16), 30 fps, 27.8 seconds, H.264 High / yuv420p / BT.709, AAC-LC stereo 48 kHz, fast-start MP4.
- No background music. Both languages share the exact same ambience-only audio master.
- Preserve 9:16 when uploading; do not auto-crop or add duplicate automatic subtitles. Platform overlays vary: review the final on-device caption/UI overlap before publishing. Approved caption positions were retained.
- Text is translated, while Japanese signs on buildings remain part of the location artwork. English manga cues use `MEOW` / `DIP!`.

## Optional English post text

Autumn in Yahiko, Niigata 🍁

Cedar-lined shrine paths, a ropeway ride to the Sea of Japan, and autumn lights after sunset. Leave a little time for the onsen town, too.

## 繁體貼文參考

新潟・彌彥的秋天 🍁

杉林中的神社，搭纜車上山看海，再走進入夜點燈的紅葉谷。下山後，留一晚給彌彥溫泉。

## Sound credits — include with publication / 發布時請保留音效署名

Sound design uses edited and mixed recordings; these are not recordings made at Yahiko.

- Kitten Meow — Mike Koenig, CC BY 3.0. https://soundbible.com/1286-Cat-Meow.html
- Ropeway — concretica, CC BY 4.0. https://freesound.org/people/concretica/sounds/240532/
- Oceanwavescrushing — Luftrum, CC BY 3.0. https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg
- CC BY 3.0: https://creativecommons.org/licenses/by/3.0/ ; CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Other sound sources are CC0/public domain. Full provenance and processing: `viz/autumn/audio/yahiko-v38/LICENSES.md`.

Changes include cropping, filtering, gain adjustment, stereo placement and mixing. The distant bird phrases reuse the existing CC0 source; no bird species is asserted.

## Export evidence

After both recordings finish, `exports.json` will record checksums, duration, frame count, codecs and text-bound checks. Export is deterministic frame-by-frame, followed by a complete video/audio decode. Sampled frames are retained locally in `reference/yahiko-v38-social/`. These checks are not a claim of human auditory review of every sound.
