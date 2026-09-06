"""Static file server with clean-URL support (e.g. /route resolves to route.html)."""
import http.server
import os
import socketserver

PORT = 3000


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        if path != '/' and '.' not in os.path.basename(path):
            fs_path = self.translate_path(path)
            if not os.path.exists(fs_path) and os.path.isfile(fs_path + '.html'):
                suffix = self.path[len(path):]
                self.path = path + '.html' + suffix
        return super().send_head()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"Serving clean URLs at http://localhost:{PORT}")
        httpd.serve_forever()
