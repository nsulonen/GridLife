from flask import Flask, jsonify
from flask_cors import CORS
import random, time, threading

app = Flask(__name__)
CORS(app)

@app.route("/")
def get_grid():
    return jsonify(world_grid)

def run_simulation():
    global world_grid
    while True:
        world_grid = tick(world_grid)
        time.sleep(0.1)

if __name__ == '__main__':
    simulation_thread = threading.Thread(target=run_simulation)
    simulation_thread.daemon = True
    simulation_thread.start()
    
    app.run(debug=True)
