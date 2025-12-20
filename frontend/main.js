class Cell {
  constructor(isAlive, generation) {
    this.isAlive = isAlive;
    this.generation = generation;
    this.age = 0;
  }

  incrementAge() {
    this.age += 1;
  }
}

const flask_server = 'http://127.0.0.1:5000/';
const canvas = document.getElementById('gridlife-canvas');
const context = canvas.getContext('2d');

const FADE_DURATION = 500;
const C_ALIVE_HEX = '#4FD1C5';
const C_ALIVE_RGB = '79, 209, 197';

let isInitialized = false;
let currentGrid = [];
let previousGrid = [];

function drawGrid() {
  const rowCount = currentGrid.length;
  if (rowCount === 0) return;
  const colCount = currentGrid[0].length;
  const cellSize = canvas.width / colCount;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const cell = currentGrid[r][c];
      if (cell.isAlive) {
        context.fillStyle = C_ALIVE_HEX;
        context.shadowColor = C_ALIVE_HEX;
        context.shadowBlur = 10;
        context.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        context.shadowBlur = 0;
      }
    }
  }
}

function fillGrid(width, height) {
  const grid = []
  for (let r = 0; r < height; r++) {
    const row = []
    for (let c = 0; c < width; c++) {
      row.push(new Cell(false, 0));
    }
    grid.push(row);
  }
  return grid;
}

function update() {
  fetch(flask_server)
    .then(response => response.json())
    .then(data => {
      if (!isInitialized) {
        console.log("Initializing grid with dimensions:", data.width, data.height);

        currentGrid = fillGrid(data.width, data.height);
        previousGrid = fillGrid(data.width, data.height);

        isInitialized = true;
      }
      previousGrid = JSON.parse(JSON.stringify(currentGrid));

      for (let r = 0; r < data.height; r++) {
        for (let c = 0; c < data.width; c++) {
          const serverState = data.grid[r][c];
          const clientCell = currentGrid[r][c];

          const wasAlive = clientCell.isAlive;
          const isNowAlive = (serverState === "ALIVE");

          clientCell.isAlive = isNowAlive;
          clientCell.state = serverState;

          if (isNowAlive && wasAlive) {
            clientCell.incrementAge();
          }
          else if (isNowAlive && !wasAlive) {
            clientCell.age = 0;
          }
          else if (!isNowAlive && wasAlive) {
            clientCell.age = 0;
          }
        }
      }
    });
}

function render() {
  drawGrid();
  requestAnimationFrame(render);
}

setInterval(update, 100);
render();
