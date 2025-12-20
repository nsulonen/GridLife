import random

class Cell:
    def __init__(self):
        self.state = "EMPTY";
        self.age = 0;

class Simulation:
    def __init__(self, width, height):
        self.width = width;
        self.height = height;
        self.MAX_AGE = 200
        self.DECAY_DURATION = 15

        self.grid = [[Cell() for _ in range(self.width)] for _ in range(self.height)]

        for row in self.grid:
            for cell in row:
                if random.random() < 0.15:
                    cell.state = "ALIVE";

    def tick(self):
        new_grid = [[Cell() for _ in range(self.width)] for _ in range(self.height)]

        for row in range(self.height):
            for col in range(self.width):

                alive_neighbors = 0
                decaying_neighbors = 0

                for dr in range(-1, 2):
                    for dc in range(-1, 2):
                     if dr == 0 and dc == 0:
                         continue

                     nr = (row + dr) % self.height
                     nc = (col + dc) % self.width

                     neighbor_cell = self.grid[nr][nc]
                     if neighbor_cell.state == "ALIVE":
                         alive_neighbors += 1
                         
                     elif neighbor_cell.state == "DECAYING":
                         decaying_neighbors += 1

                current_cell = self.grid[row][col]
                new_cell = new_grid[row][col]

                if current_cell.state == "ALIVE":
                    if current_cell.age > self.MAX_AGE:
                        new_cell.state = "DECAYING"
                        new_cell.age = 0                        
                    elif alive_neighbors < 2 or alive_neighbors > 3:
                        new_cell.state = "EMPTY"
                    else:
                        new_cell.state = "ALIVE"
                        new_cell.age = current_cell.age + 1
                        
                elif current_cell.state == "EMPTY":
                    if alive_neighbors == 2 and decaying_neighbors >= 1:
                        new_cell.state = "ALIVE"
                    
                elif current_cell.state == "DECAYING":
                    if current_cell.age > self.DECAY_DURATION:
                        new_cell.state = "EMPTY"
                    else:
                        new_cell.state = "DECAYING"
                        new_cell.age = current_cell.age + 1
                        
        self.grid = new_grid

    def get_cell_states(self):
        return [[self.grid[r][c].state for c in range(self.width)] for r in range(self.height)]
