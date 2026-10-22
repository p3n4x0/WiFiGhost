import os
import yaml
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

# Absolute path to the backend/ directory, so the server works no matter
# which directory it is launched from (e.g. `sudo python3 backend/server.py`
# from the repo root, as documented in the README).
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, 'config', 'config.yaml'), 'r') as file:
    config = yaml.safe_load(file)

print('''
  _____            ____       _____   ____       _____     ____   ____         _____             ______   ________________  
 |\    \   _____  |    | ____|\    \ |    |  ___|\    \   |    | |    |   ____|\    \        ___|\     \ /                \\
 | |    | /    /| |    ||    | \    \|    | /    /\    \  |    | |    |  /     /\    \      |    |\     \\\______    ______/
 \/     / |    || |    ||    |______/|    ||    |  |____| |    |_|    | /     /  \    \     |    |/____/|   \( /    / )/   
 /     /_  \   \/ |    ||    |----'\ |    ||    |    ____ |    .-.    ||     |    |    | ___|    \|   | |    ' |   |  '    
|     // \  \   \ |    ||    |_____/ |    ||    |   |    ||    | |    ||     |    |    ||    \    \___|/       |   |        
|    |/   \ |    ||    ||    |       |    ||    |   |_,  ||    | |    ||\     \  /    /||    |\     \         /   //        
|\ ___/\   \|   /||____||____|       |____||\ ___\___/  /||____| |____|| \_____\/____/ ||\ ___\|_____|       /___//         
| |   | \______/ ||    ||    |       |    || |   /____ / ||    | |    | \ |    ||    | /| |    |     |      |`   |          
 \|___|/\ |    | ||____||____|       |____| \|___|    | / |____| |____|  \|____||____|/  \|____|_____|      |____|          
    \(   \|____|/   \(    )/           \(     \( |____|/    \(     )/       \(    )/        \(    )/          \(            
     '      )/       '    '             '      '   )/        '     '         '    '          '    '            '            
            '                                      '                                                                        
                                                                                                                            
         ______       ______        _____    ____      ____      ______        _____                                        
     ___|\     \  ___|\     \   ___|\    \  |    |    |    | ___|\     \   ___|\    \                                       
    |    |\     \|     \     \ |    |\    \ |    |    |    ||     \     \ |    |\    \                                      
    |    |/____/||     ,_____/||    | |    ||    |    |    ||     ,_____/||    | |    |                                     
 ___|    \|   | ||     \--'\_|/|    |/____/ |    |    |    ||     \--'\_|/|    |/____/                                      
|    \    \___|/ |     /___/|  |    |\    \ |    |    |    ||     /___/|  |    |\    \                                      
|    |\     \    |     \____|\ |    | |    ||\    \  /    /||     \____|\ |    | |    |                                     
|\ ___\|_____|   |____ '     /||____| |____|| \ ___\/___ / ||____ '     /||____| |____|                                     
| |    |     |   |    /_____/ ||    | |    | \ |   ||   | / |    /_____/ ||    | |    |                                      
 \|____|_____|   |____|     | /|____| |____|  \|___||___|/  |____|     | /|____| |____|                                     
    \(    )/       \( |_____|/   \(     )/      \(    )/      \( |_____|/   \(     )/                         by p3n4x0          
     '    '         '    )/       '     '        '    '        '    )/       '     '                                        
                         '                                          '                                                       
''')

app = Flask(__name__)

app.secret_key = config['server']['secret']

# Resource directories used by the routes. Created on startup so the first
# attack/crack doesn't fail just because the folder isn't there yet.
for _folder in ('FakeNetworks', 'Wordlist', 'hashDB', 'passDB'):
    os.makedirs(os.path.join(BASE_DIR, _folder), exist_ok=True)
os.makedirs(config['server']['filePath'], exist_ok=True)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

from app import routes