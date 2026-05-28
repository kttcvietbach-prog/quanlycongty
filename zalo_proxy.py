
import http.server
import socketserver
import urllib.request
import json
import sys

PORT = 8080

class ZaloProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, access_token')
        self.end_headers()

    def do_POST(self):
        if self.path in ['/zalo-proxy', '/zalo-refresh']:
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                access_token = self.headers.get('access_token')

                # Chuyển tiếp tới Zalo OA (Message hoặc OAuth)
                target_url = 'https://openapi.zalo.me/v3.0/oa/message/transaction'
                if self.path == '/zalo-refresh':
                    target_url = 'https://oauth.zaloapp.com/v4/oa/access_token'
                
                req = urllib.request.Request(
                    target_url,
                    data=post_data,
                    headers={
                        'Content-Type': 'application/json',
                        'access_token': access_token,
                        'secret_key': self.headers.get('secret_key') # Dùng cho refresh
                    },
                    method='POST'
                )
                
                with urllib.request.urlopen(req) as response:
                    res_data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(res_data)
            except Exception as e:
                print(f"Error Proxying: {e}")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": -1, "message": str(e)}).encode())
        else:
            return super().do_POST()

def run_server():
    # Cho phép chạy lại trên cùng một cổng nhanh chóng
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), ZaloProxyHandler) as httpd:
            print(f"🚀 VIETBACCORP Server + Zalo Proxy is running at:")
            print(f"👉 http://localhost:{PORT}")
            print("\n(Vui lòng không đóng cửa sổ này khi đang dùng VIETBACCORP)")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_server()
