import http.server
import socketserver
import json
import os

PORT = 8000
DATA_FILE = 'locations.json'

class MapRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_POST(self):
        if self.path == '/save-locations':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                with open(DATA_FILE, 'w') as f:
                    json.dump(data, f, indent=4)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_error(404, "File not found")

    def do_GET(self):
        # Strip query parameters for static file serving
        if '?' in self.path:
            self.path = self.path.split('?')[0]
            
        return super().do_GET()

print(f"Serving map at http://localhost:{PORT}")
print(f"To use locally, open: http://localhost:{PORT}/intro.html")

with socketserver.TCPServer(("", PORT), MapRequestHandler) as httpd:
    httpd.serve_forever()
