"""Local-only decoder bridge. Writes only to edited-v1/decoded, never source files."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'edited-v1' / 'decoded'
OUT.mkdir(parents=True, exist_ok=True)
FILES = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))['files']
IDS = {Path(f['local_file']).name.split('-')[0] for f in FILES}
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_POST(self):
        ident = self.path.removeprefix('/decode/')
        try:
            assert self.path.startswith('/decode/') and ident in IDS
            assert self.headers.get('Origin') == 'http://127.0.0.1:18765'
            n = int(self.headers['Content-Length'])
            channels = int(self.headers['X-Channels'])
            rate = int(self.headers['X-Rate'])
            assert 0 < n < 100_000_000 and channels in (1, 2) and rate == 48000
            assert n % (4 * channels) == 0
            data = self.rfile.read(n)
            assert len(data) == n
            with (OUT / (ident + '.f32')).open('xb') as f:
                f.write(data)
            (OUT / (ident + '.json')).write_text(json.dumps({'channels':channels,'sample_rate':rate,'frames':n//(4*channels)}))
        except (AssertionError, ValueError, KeyError, FileExistsError):
            self.send_error(400); return
        self.send_response(200); self.end_headers(); self.wfile.write(b'OK')
ThreadingHTTPServer(('127.0.0.1', 18765), Handler).serve_forever()
