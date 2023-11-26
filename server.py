#!/bin/python   
from app import app, config


app.run(host=config['server']['host'], port=config['server']['port'])
