#!/usr/bin/env python3
from app import app, socketio, config

host = config['server']['host']
port = config['server']['port']

try:
    # Newer Flask-SocketIO refuses the Werkzeug dev server without this flag.
    socketio.run(app, host=host, port=port, allow_unsafe_werkzeug=True)
except TypeError:
    # Older versions don't accept the flag.
    socketio.run(app, host=host, port=port)
