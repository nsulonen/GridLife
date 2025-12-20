from flask import Flask, jsonify
from flask_cors import CORS
from simulation import Simulation
import time, threading

app = Flask(__name__)
CORS(app)

new_sim = Simulation(100, 100)

@app.route("/")
def get_grid():
    return jsonify(new_sim.grid)

def run_simulation():
    global new_sim
    while True:
        new_sim.tick()
        time.sleep(0.10)

if __name__ == '__main__':
    simulation_thread = threading.Thread(target=run_simulation)
    simulation_thread.daemon = True
    simulation_thread.start()
    
    app.run(debug=True)
