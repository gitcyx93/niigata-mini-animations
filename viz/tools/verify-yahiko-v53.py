"""Verify the social encode against the approved PCM and save two visual proofs."""
from pathlib import Path
import json,subprocess,struct
import numpy as np
from scipy.signal import correlate,correlation_lags
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'output/autumn/yahiko-v53-zh';VIDEO=D/'yahiko-v53-zh-1080x1920-30fps.mp4';SR=48000
assert VIDEO.is_file()
def run(args):
 p=subprocess.run(args,capture_output=True,check=True);return p.stdout
def audio(p):
 a=np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-vn','-ac','2','-ar',str(SR),'-f','f32le','pipe:1']),'<f4').reshape(-1,2)
 assert np.isfinite(a).all();return a
reference=audio(ROOT/'viz/autumn/audio/yahiko-v53/master.flac');encoded=audio(VIDEO)
assert len(reference)==len(encoded)==round(28.1*SR)
assert np.abs(encoded).max()<1
align=[]
for a,b in [(1.9,2.6),(4.2,5.8),(18.4,20.6),(24.4,25.1),(27.6,28.1)]:
 x=reference[round(a*SR):round(b*SR)].mean(axis=1);y=encoded[round(a*SR):round(b*SR)].mean(axis=1)
 c=correlate(y,x,method='fft');lags=correlation_lags(len(y),len(x));mask=np.abs(lags)<=round(.1*SR);lag=int(lags[mask][np.argmax(c[mask])]);similarity=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)))
 assert abs(lag)<=round(.002*SR) and similarity>.95,(a,b,lag,similarity)
 align.append({'range':[a,b],'lag_ms':lag/SR*1000,'correlation':similarity})
# Inspect MP4 top-level atoms to confirm fast-start rather than just trusting the encoding flag.
atoms=[]
with VIDEO.open('rb') as f:
 while f.tell()<VIDEO.stat().st_size:
  offset=f.tell();header=f.read(8)
  if len(header)<8:break
  size,kind=struct.unpack('>I4s',header)
  if size==1:size=struct.unpack('>Q',f.read(8))[0]
  if size==0:size=VIDEO.stat().st_size-offset
  assert size>=8
  atoms.append({'type':kind.decode('ascii'),'offset':offset});f.seek(offset+size)
assert next(a['offset'] for a in atoms if a['type']=='moov')<next(a['offset'] for a in atoms if a['type']=='mdat')
loudness=subprocess.run(['ffmpeg','-hide_banner','-i',str(VIDEO),'-vn','-af','ebur128=peak=true','-f','null','-'],capture_output=True,check=True)
(D/'audio-check.txt').write_bytes(loudness.stderr)
for t,name in [(20,'proof-town-encoded.jpg')]:
 run(['ffmpeg','-v','error','-n','-ss',str(t),'-i',str(VIDEO),'-frames:v','1',str(D/name)])
report={'duration_seconds':len(encoded)/SR,'encoded_sample_peak':float(np.abs(encoded).max()),'alignment':align,'mp4_atoms':atoms,'fast_start':True,'sampled_visual_proofs':['proof-town-encoded.jpg'],'limits':'Technical audio alignment plus the edited town frame; no platform-upload UI check or claim of a new human auditory review.'}
(D/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report,indent=2))
