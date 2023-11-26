from flask import Flask
from flask_session import Session
import yaml

app = Flask(__name__)
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)

with open('config/config.yaml', 'r') as file:
    config = yaml.safe_load(file)

app.config['SECRET_KEY'] = config['server']['secret']
Session(app)

from app import routes