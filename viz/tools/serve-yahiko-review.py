"""Local-only preview server with byte-range support for HTML5 media."""
import argparse, functools, http.server, os, re
from pathlib import Path

class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version='HTTP/1.1'
    def send_head(self):
        self.remaining=None
        path=self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()
        f=open(path,'rb');size=os.fstat(f.fileno()).st_size
        start,end=0,size-1
        requested=self.headers.get('Range')
        if requested:
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested.strip())
            valid=bool(match and any(match.groups()))
            if valid:
                a,b=match.groups()
                if a:start=int(a);end=min(int(b),size-1) if b else size-1
                else:start=max(0,size-int(b))
                valid=0<=start<=end<size
            if not valid:
                f.close();self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type',self.guess_type(path))
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Cache-Control','no-cache')
        self.send_header('Content-Length',str(end-start+1))
        if requested:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers();f.seek(start);self.remaining=end-start+1;return f
    def copyfile(self,source,outputfile):
        if self.remaining is None:return super().copyfile(source,outputfile)
        try:
            while self.remaining>0:
                chunk=source.read(min(65536,self.remaining))
                if not chunk:break
                outputfile.write(chunk);self.remaining-=len(chunk)
        except (BrokenPipeError,ConnectionResetError):
            pass # normal when the media player cancels or switches a stream
    def log_message(self,fmt,*args):
        super().log_message(fmt+' [Range=%s UA=%s]',*args,self.headers.get('Range','-'),self.headers.get('User-Agent','-'))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=61812);args=p.parse_args()
    root=Path(__file__).resolve().parents[2]/'output/autumn/yahiko-v25-sound-review'
    server=http.server.ThreadingHTTPServer(('127.0.0.1',args.port),functools.partial(Handler,directory=str(root)))
    print(f'http://127.0.0.1:{args.port}/listen.html',flush=True)
    server.serve_forever()
