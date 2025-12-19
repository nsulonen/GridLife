from flask import Flask, jsonify
from flask_cors import CORS
import random, time, threading

app = Flask(__name__)
CORS(app)

width = 200
height = 200

world_grid = [[random.choice([0, 1]) for _ in range(width)] for _ in range(height)]

@app.route("/")
def get_grid():
    return jsonify(world_grid)

def run_simulation():
    global world_grid
    while True:
        world_grid = tick(world_grid)
        time.sleep(0.1)

def tick(current_grid):
    height = len(current_grid)
    width = len(current_grid[0])
    new_grid = [[0 for _ in range(width)] for _ in range(height)]
            
    for row in range(height):
        for col in range(width):

            live_neighbours = 0
            for n_row in range(row - 1, row + 2):
                for n_col in range(col - 1, col + 2):
                    if n_row < 0 or n_row >= height or \
                       n_col < 0 or n_col >= width:
                        continue
                    if n_row == row and n_col == col:
                        continue
                    elif current_grid[n_row][n_col] == 1:
                        live_neighbours += 1

            state = current_grid[row][col]
            if (state == 1 and live_neighbours in [2, 3]) or \
               (state == 0 and live_neighbours == 3):
                new_grid[row][col] = 1                    

    return new_grid

if __name__ == '__main__':
    simulation_thread = threading.Thread(target=run_simulation)
    simulation_thread.daemon = True
    simulation_thread.start()
    
    app.run(debug=True)
