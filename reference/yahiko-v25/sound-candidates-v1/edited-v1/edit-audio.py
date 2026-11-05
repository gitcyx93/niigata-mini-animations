"""Conservative source-only edits. No synthesis, mixing, looping or source overwrites."""
from pathlib import Path
import json, wave, hashlib
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT.parent/'manifest.json').read_text(encoding='utf-8'))
sources={Path(f['local_file']).name.split('-')[0]:f for f in manifest['files']}
# id, name, start/end seconds, fade-in/out seconds, gain dB
cuts=[('501168','01-furin-single-tail',.40,4.18,.008,.30,-6),
      ('575645','02-leaves-soft',24.5,28.1,.40,.60,0),
      ('637977','03-small-water',34,38,.35,.50,-6),
      ('257468','04-gravel-single-impact',.015,.225,.005,.025,0),
      ('240532','05-ropeway-optional',1,4.2,.40,.60,-12)]
def edit(x,sr,start,end,fi,fo,gain):
    assert 0<=start<end<=len(x)/sr and fi+fo<end-start and gain<=0
    y=x[round(start*sr):round(end*sr)].astype(np.float64).copy()
    dc=np.mean(y,axis=0); y-=dc
    y*=10**(gain/20)
    for seconds,head in [(fi,True),(fo,False)]:
        n=round(seconds*sr)
        if n:
            ramp=.5-.5*np.cos(np.linspace(0,np.pi,n))
            if head:y[:n]*=ramp[:,None]
            else:y[-n:]*=ramp[::-1,None]
    assert np.isfinite(y).all() and np.max(np.abs(y))<1
    return y,dc
# Small self-check: exact crop length, silent edges, no source mutation.
test=np.arange(2000,dtype=float).reshape(1000,2)/10000
before=test.copy(); out,_=edit(test,1000,.1,.9,.01,.02,-6)
assert len(out)==800 and np.all(out[[0,-1]]==0) and np.array_equal(test,before)
records=[]; img=Image.new('RGB',(1600,1050),'#faf9f4'); draw=ImageDraw.Draw(img)
for row,(ident,name,start,end,fi,fo,gain) in enumerate(cuts):
    meta=json.loads((ROOT/'decoded'/f'{ident}.json').read_text())
    sr=meta['sample_rate']; channels=meta['channels']
    x=np.fromfile(ROOT/'decoded'/f'{ident}.f32',dtype='<f4').reshape(-1,channels)
    y,dc=edit(x,sr,start,end,fi,fo,gain)
    path=ROOT/(name+'.wav'); assert not path.exists(), f'Refusing to overwrite {path}'
    pcm=np.rint(y*32767).astype('<i2')
    with wave.open(str(path),'wb') as w:
        w.setnchannels(channels);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
    with wave.open(str(path),'rb') as w:
        assert w.getnframes()==len(y) and w.getframerate()==48000 and w.getsampwidth()==2
    peak=float(np.max(np.abs(y))); rms=float(np.sqrt(np.mean(y*y)))
    record={'file':path.name,'source':sources[ident],'source_sha256':hashlib.sha256((ROOT.parent/sources[ident]['local_file']).read_bytes()).hexdigest(),
       'source_decoded_duration_seconds':len(x)/sr,'source_start_seconds':start,'source_end_seconds':end,
       'duration_seconds':len(y)/sr,'format':'PCM WAV 16-bit','sample_rate':sr,'channels':channels,
       'processing':{'remove_segment_dc_offset':dc.tolist(),'gain_db':gain,'fade_in_seconds':fi,'fade_out_seconds':fo,'fade_curve':'half cosine','normalization':False,'compression':False,'denoise':False,'eq':False},
       'peak_dbfs':20*np.log10(peak),'rms_dbfs':20*np.log10(rms),'size_bytes':path.stat().st_size,
       'review_status':'waveform inspected; not aurally verified; edit candidate, not final mix'}
    records.append(record)
    yy=row*210;draw.text((20,yy+8),f'{name} | source {start:.3f}-{end:.3f}s | {len(y)/sr:.3f}s | gain {gain}dB | peak {20*np.log10(peak):.1f}dBFS',fill='black')
    draw.text((20,yy+26),'Waveform auto-scaled per row; not a loudness comparison.',fill='#666666')
    bounds=np.linspace(0,len(y),1521,dtype=int)
    for i in range(1520):
        b=y[bounds[i]:bounds[i+1]]
        draw.line((50+i,yy+110-float(b.max())/peak*60,50+i,yy+110-float(b.min())/peak*60),fill='#235e50')
    for t in np.linspace(0,len(y)/sr,9):
        xx=50+t/(len(y)/sr)*1520;draw.text((xx-10,yy+183),f'{t:.2f}s',fill='black')
img.save(ROOT/'edited-waveforms.png')
(ROOT/'edit-manifest.json').write_text(json.dumps({'status':'edited_pending_listening','decoder':'Microsoft Edge Web Audio decodeAudioData, 48000Hz; original channel count retained','files':records},ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'DONE.json').write_text(json.dumps({'status':'basic_edits_complete_pending_listening','edited_file_count':len(records),'source_files_modified':False,'checks':['finite samples','no sample clipping','crop duration','fade edges self-check','WAV headers and frame counts','source and output waveforms'], 'unfinished':['Auditory confirmation of background contaminants and source suitability','Gravel crop is one isolated transient, not confirmed as a complete natural footstep','Final level decisions with animation; no mixing performed']},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{k:r[k] for k in ['file','duration_seconds','peak_dbfs']} for r in records],indent=2))
