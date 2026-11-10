# Yahiko V38 sound sources

This is sound design, not a field recording made in Yahiko. No background music.

## Reused V25 B mix and stems

The approved V25 B mix is stored in `sources/v25-b-water.m4a` and retained through 24.6 seconds. The extra town duration uses the original quiet ambience and the existing small-water stem, without repeating the wind-chime strike.

| Sound | Author | Source | License |
|---|---|---|---|
| Forest quiet | 13F_Panska_Petruzelova_Anna | https://freesound.org/people/13F_Panska_Petruzelova_Anna/sounds/379210/ | CC0 1.0 |
| Wind in trees | Borgory | https://freesound.org/people/Borgory/sounds/751473/ | CC0 1.0 |
| Open-field wind | Globofonia | https://freesound.org/people/Globofonia/sounds/553733/ | CC0 1.0 |
| Bird1EQ.wav | rawhiteman7 | https://freesound.org/people/rawhiteman7/sounds/389977/ | CC0 1.0 |
| Leaves | Garuda1982 | https://freesound.org/people/Garuda1982/sounds/575645/ | CC0 1.0 |
| Wind chime | ayustat2001 | https://freesound.org/people/ayustat2001/sounds/501168/ | CC0 1.0 |
| Small water trickle | kyles | https://freesound.org/people/kyles/sounds/637977/ | CC0 1.0 |
| Ropeway | concretica | https://freesound.org/people/concretica/sounds/240532/ | CC BY 4.0 |

Ropeway: the prior cropped, filtered, narrowed and faded 1.0–4.2s excerpt is reused at 65% of its existing stem gain, at film time 9.8s. License: https://creativecommons.org/licenses/by/4.0/

## Window-frame sound and shrine revision

**Old Door Creaking — Stephan**, SoundBible, marked **Public Domain** on the source page:
https://soundbible.com/1362-Old-Door-Creaking.html

Download: https://soundbible.com/mp3/Old%20Door%20Creaking-SoundBible.com-1197162460.mp3

`window-source.mp3` preserves this recording. It is used as window-frame Foley, not presented as an authentic window/location recording: high-pass at 160Hz, low-pass at 1900Hz, reduced gain, overlapping short excerpts, slight right pan. Its loudness follows the animation's actual hinge angular velocities and stops with the window. No new synthetic creak is claimed as a recording.

The base track around 4s has been restored unchanged. Solo excerpts preserve the actual mix gain so the user can identify the unwanted sound without speculative processing. The repeated shrine chime has been replaced by the continuous recording below; the old single chime remains only in the previously approved town transition.

## Shrine wind chimes

**Windchimes — Esc861**, own recording, released into the **public domain** (PD-self).

- Source/license page: https://commons.wikimedia.org/wiki/File:Windchimes.ogg
- Download: https://upload.wikimedia.org/wikipedia/commons/0/09/Windchimes.ogg
- Saved as `windchimes-source.ogg`.
- Changes: resampled, high-pass 350Hz / low-pass 6200Hz, reduced gain, short fades, slight left pan. One uninterrupted 5.354s recording is used at 3.3–8.654s. No repeated single-bell sampling.

## Summit sea ambience replacement

**Oceanwavescrushing — Luftrum**, **Creative Commons Attribution 3.0**.

- Source/license page: https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg
- Original recording: https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg
- Description: waves at Kalundborg Fjord, Røsnæs, recorded from about 2m using a Zoom H2. This is not a Yahiko or Japan location recording.
- License: https://creativecommons.org/licenses/by/3.0/
- `sea-source.ogg` preserves the downloaded recording.
- Changes: source 12.0–16.3s excerpt, 100Hz high-pass / 3200Hz low-pass, reduced level, 0.5s/0.65s fades, placed at 12.8–17.1s. The old open-field-wind bed is crossfaded out only in that interval. The intention is distant-sea sound design, not claiming surf is literally audible from this summit.
- Diagnosis: the old source manifest identifies this section as open-field wind assembled from MP3 previews, not surf. Its identity and perspective are a confirmed mismatch; no claim is made that codec damage was proven.

## Release audio: no background music

The English and Traditional Chinese social exports use the ambience-only `master.wav`, byte-identical to `effects.wav`. The temporary music sketch has been removed from current release playback and exports.

The already approved `bird-01.flac` and `bird-02.flac` phrases (rawhiteman7, CC0, listed above) are reused quietly at 21.6s, 22.7s, 25.1s and 26.25s in the town scene, avoiding the 23.45s cat cue. Bird species has not been identified; “cuckoo-like” is a listening description, not a claim about the source species. Background bird calls embedded in the original forest bed are not separately isolated stems and should be listed as part of that bed.

## New cat sound

**Kitten Meow — Mike Koenig**, SoundBible, **Creative Commons Attribution 3.0**.

- Source/license page: https://soundbible.com/1286-Cat-Meow.html
- Download: https://soundbible.com/mp3/Kitten%20Meow-SoundBible.com-1295572573.mp3
- License: https://creativecommons.org/licenses/by/3.0/
- Changes: cropped to a 1.25s excerpt starting about 0.0084s into the source, resampled to 32kHz stereo, short fades, reduced gain, slight right pan, placed at 23.45s with the cat's `ニャッ` cue.
- `cat-source.mp3` preserves the downloaded recording for rebuilding.

The two additional wind-leaf accents reuse the existing edited leaves recording. The final accent wraps across the 27.8s/0s cut. No new synthesized animal vocalization is used.

Original source records are retained in [legacy-v24-LICENSES.md](sources/legacy-v24-LICENSES.md), [legacy-v25-candidates.json](sources/legacy-v25-candidates.json) and [legacy-v25-edits.json](sources/legacy-v25-edits.json). Those records describe their original candidate stage. The current input paths and SHA-256 hashes are in [sources/manifest.json](sources/manifest.json). CC0: https://creativecommons.org/publicdomain/zero/1.0/

Audio attribution must accompany publication (for example in the video description). This notice does not relicense the animation, fonts or other repository material.
