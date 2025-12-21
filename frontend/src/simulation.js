export class Cell {
  constructor(state = "EMPTY", color = [106, 103, 78], age = 0) {
    this.state = state;
    this.color = color;
    this.age = age;
  }
}

// --- Simulation parameters ---
export const WIDTH = 250;
export const HEIGHT = 250;
export const MAX_AGE = 150;
const DECAY_DURATION = 25;
const INITIAL_DENSITY = 0.35;

// --- Module-level state ---
let grid = [];
let isInitialized = false;

// --- Private helper functions ---
function createEmptyGrid() {
  return Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => new Cell())
  );
}

// Initialize the simulation with random grid
export function init() {
  grid = createEmptyGrid();
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      if (Math.random() < INITIAL_DENSITY) {
        grid[row][col].state = "ALIVE";
      }
    }
  }
  isInitialized = true;
  console.log("Client-side simulation initialized");
}

// Core simulation logic
export function tick() {
  if (!isInitialized) return;

  const newGrid = createEmptyGrid();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {

      let aliveNeighbors = 0;
      let decayingNeighbors = 0;
      let parentColor = null;

      // Count neighbors
      for (let drow = -1; drow <= 1; drow++) {
        for (let dcol = -1; dcol <= 1; dcol++) {
          if (drow === 0 && dcol === 0) continue;

          const nrow = (row + drow + HEIGHT) % HEIGHT;
          const ncol = (col + dcol + WIDTH) % WIDTH;

          const neighbor = grid[nrow][ncol];
          if (neighbor.state === "ALIVE" || neighbor.state === "REBORN") {
            aliveNeighbors++;
            if (!parentColor) {
              parentColor = neighbor.color;
            }
          } else if (neighbor.state === "DECAYING") {
            decayingNeighbors++;
          }
        }
      }

      const currentCell = grid[row][col];
      const newCell = newGrid[row][col];

      if (currentCell.state === "ALIVE" || currentCell.state === "REBORN") {
        if (currentCell.age > MAX_AGE) {
          newCell.state = "DECAYING";
        } else if (aliveNeighbors < 2 || aliveNeighbors > 3) {
          newCell.state = "EMPTY";
        } else {
          newCell.state = currentCell.state;
          newCell.color = currentCell.color;
          newCell.age = currentCell.age + 1;
        }
      } else if (currentCell.state === "EMPTY") {
        if (aliveNeighbors === 3) {
          newCell.state = "ALIVE";
          newCell.color = parentColor || [106, 103, 78]; 
        } else if (decayingNeighbors > 0) {
          const birthChance = 0.15 * decayingNeighbors;
          if (Math.random() < birthChance) {
            newCell.state = "REBORN";
            newCell.color = Array.from({ length: 3 }, () => Math.random() * 150 + 50);
          }
        }
      } else if (currentCell.state === "DECAYING") {
        if (currentCell.age > DECAY_DURATION) {
          newCell.state = "EMPTY";
        } else {
          newCell.state = "DECAYING";
          newCell.age = currentCell.age + 1;
        }
      }
    }
  }
  grid = newGrid;
}

export function shiftGrid(dx, dy) {
  if (!isInitialized || (dx === 0 && dy === 0)) return;

  if (dy < 0) {
    for (let i = 0; i < -dy; i++) {
      grid.unshift(grid.pop());
    }
  }
  else if (dy > 0) {
    for (let i = 0; i < dy; i++) {
      grid.push(grid.shift());
    }
  }

  if (dx !== 0) {
    for (const row of grid) {
      if (dx < 0) {
        for (let i = 0; i < -dx; i++) {
          row.unshift(row.pop());
        }
      }
      else if (dx > 0) {
        for (let i = 0; i < dx; i++) {
          row.push(row.shift());
        }
      }
    }
  }
}

export function getSimulationState() {
  return {
    grid,
    MAX_AGE,
  };
}
