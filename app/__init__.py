from flask import Flask
from flask_session import Session
import yaml

with open('config/config.yaml', 'r') as file:
    config = yaml.safe_load(file)


app = Flask(__name__)
SESSION_TYPE = config['server']['sessionType']
SECRET_KEY = config['server']['secret']
app.config.from_object(__name__)


Session(app)

from app import routes