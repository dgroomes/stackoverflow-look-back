#!/usr/bin/env python3
# Run a simple web server and add CORS headers

from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

BIND_ADDRESS = '127.0.0.1'
PORT = 8000
DIR = "src"


# An extension of the built-in SimpleHTTPRequestHandler that adds CORS headers
# Adapted from https://stackoverflow.com/a/21957017
class CORSRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)


# Curry the constructor to create a handler that serves the contents of the given directory
cors_handler_for_dir = partial(CORSRequestHandler, directory=DIR)

httpd = HTTPServer((BIND_ADDRESS, PORT), cors_handler_for_dir)

print("Serving at http://%s:%s" % (BIND_ADDRESS, PORT))
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()
