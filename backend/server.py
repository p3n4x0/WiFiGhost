#!/bin/python   
from app import app, socketio, config

socketio.run(app, host=config['server']['host'], port=config['server']['port'])