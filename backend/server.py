#!/bin/python   
from flask_socketio import SocketIO
from app import app, socketio, config

socketio.run(app, host=config['server']['host'], port=config['server']['port'])