import random

class Simulation:
    def __init__(self, width, height):
        self.width = width;
        self.height = height;
        self.grid = [[random.choice([0, 1]) for _ in range(self.width)] for _ in range(self.height)]
