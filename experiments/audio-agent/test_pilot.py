import importlib.util
import json
import math
import tempfile
import unittest
import wave
from pathlib import Path

spec = importlib.util.spec_from_file_location('pilot', Path(__file__).with_name('pilot.py'))
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)


class PilotTest(unittest.TestCase):
    def test_timeline_and_original_stay_intact(self):
        before = (pilot.BASE / 'mix.json').read_bytes()
        cue = pilot.plan()
        self.assertEqual((cue['start'], cue['end'], cue['duration']), (12.8, 17.1, 4.3))
        self.assertEqual(before, (pilot.BASE / 'mix.json').read_bytes())

    def test_real_ffmpeg_preview_and_rejections(self):
        import struct
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory)
            source = out / 'fixture.wav'
            with wave.open(str(source), 'wb') as wav:
                wav.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
                wav.writeframes(b''.join(struct.pack('<h', int(8000*math.sin(i*2*math.pi*440/16000))) for i in range(80000)))
            config = pilot.select(pilot.plan(), source, 0, out, 'synthetic test fixture')
            self.assertEqual(config['start'], 12.8)
            with wave.open(str(out / 'audition.wav')) as wav:
                self.assertEqual((wav.getnchannels(), wav.getframerate(), wav.getnframes()), (2, 32000, 137600))
                samples = struct.unpack('<'+'h'*(wav.getnframes()*2), wav.readframes(wav.getnframes()))
                self.assertLess(max(abs(x) for x in samples)/32768, .026)
            self.assertGreater(config['gain'], 0)
            for offset in [-1, float('nan'), 4]:
                with self.assertRaises(ValueError):
                    pilot.select(pilot.plan(), source, offset, out, 'test')


if __name__ == '__main__':
    unittest.main()
