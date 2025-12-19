import random

class Simulation:
    def __init__(self, width, height):
        self.width = width;
        self.height = height;
        self.grid = [[random.choice([0, 1]) for _ in range(self.width)] for _ in range(self.height)]

    def tick(self):
        new_grid = [[0 for _ in range(self.width)] for _ in range(self.height)]
        for row in range(self.height):
            for col in range(self.width):

                live_neighbours = 0
                for n_row in range(row - 1, row + 2):
                    for n_col in range(col - 1, col + 2):
                        if n_row < 0 or n_row >= self.height or \
                           n_col < 0 or n_col >= self.width:
                            continue
                        if n_row == row and n_col == col:
                            continue
                        elif self.grid[n_row][n_col] == 1:
                            live_neighbours += 1

                state = self.grid[row][col]
                if (state == 1 and live_neighbours in [2, 3]) or \
                   (state == 0 and live_neighbours == 3):
                    new_grid[row][col] = 1                    

        self.grid = new_grid
