"""Dependency-free local server for the downloaded Studylifter public site."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
import mimetypes
import webbrowser
import json
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
HOST = 'studylifter.zainikthemes.com'
VERSION = 'studylifter-restored-3'
STATE = ROOT / '.local-server.json'

class LocalServer(ThreadingHTTPServer):
    allow_reuse_address = False

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def do_GET(self):
        if urlsplit(self.path).path == '/__studylifter_status':
            body = json.dumps({'version': VERSION, 'root': str(ROOT)}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        # A cached CIA page must never receive a 304 after restoring Studylifter.
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        super().do_GET()

    def translate_path(self, path):
        parsed = urlsplit(path)
        relative = unquote(parsed.path).lstrip('/')
        if not relative:
            relative = HOST + '/index.html'
        candidate = (ROOT / relative).resolve()
        if not candidate.is_relative_to(ROOT):
            return str(ROOT / '__invalid__')
        bases = [candidate]
        if not relative.startswith(HOST + '/'):
            bases.append(ROOT / HOST / relative)
        for base in bases:
            options = []
            if parsed.query:
                query = unquote(parsed.query).replace('?', '@')
                options.extend([Path(str(base) + '@' + query), Path(str(base) + '@' + query + '.html'), Path(str(base) + '@' + query + '.css')])
            options.extend([base, Path(str(base) + '.html'), Path(str(base) + '.json')])
            for option in options:
                if option.is_file():
                    return str(option)
                if option.is_dir() and (option / 'index.html').exists():
                    return str(option / 'index.html')
        return str(candidate)

    def do_POST(self):
        self.send_error(501, 'This is a local public-site archive. Form submissions, accounts, bookings and payments require the original application backend.')

    def guess_type(self, path):
        return mimetypes.guess_type(path.split('@')[0])[0] or super().guess_type(path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    try:
        saved = json.loads(STATE.read_text())
        saved_port = int(saved['port'])
        with urllib.request.urlopen(f'http://127.0.0.1:{saved_port}/__studylifter_status', timeout=1) as response:
            status = json.load(response)
        if status == {'version': VERSION, 'root': str(ROOT)}:
            url = f'http://127.0.0.1:{saved_port}/{HOST}/index.html?launch={time.time_ns()}'
            print(f'Local Studylifter: {url}', flush=True)
            if not args.no_browser:
                webbrowser.open(url)
            raise SystemExit(0)
    except (OSError, ValueError, KeyError):
        pass
    try:
        server = LocalServer(('127.0.0.1', args.port), Handler)
    except OSError as error:
        if error.errno not in (48, 98, 10048) and getattr(error, 'winerror', None) != 10048:
            raise
        server = LocalServer(('127.0.0.1', 0), Handler)
    port = server.server_address[1]
    STATE.write_text(json.dumps({'port': port}))
    url = f'http://127.0.0.1:{port}/{HOST}/index.html?launch={time.time_ns()}'
    print(f'Local Studylifter: {url}', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
