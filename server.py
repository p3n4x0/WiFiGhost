#!/bin/python   
from app import app, socketio, config
from flask_socketio import SocketIO

socketio.run(app, host=config['server']['host'], port=config['server']['port'])