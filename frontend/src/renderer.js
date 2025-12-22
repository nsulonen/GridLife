const canvas = document.getElementById('gridlife-canvas');
const context = canvas.getContext('2d');

const C_OLD_RGB = [139, 69, 19];
const C_DECAYING_HEX = '#8B4512';
const ZOOM_SPEED = 0.15;

export let cellSize = 10;
let targetCellSize = 10;
let coverCellSize = 10;

let xOffset = 0;
let yOffset = 0;
let zoomCenterX = 0;
let zoomCenterY = 0;

export function resizeCanvas(gridWidth, gridHeight) {
  // Calculate cell size to fit grid while maintaining aspect ratio
  const coverScaleX = window.innerWidth / gridWidth;
  const coverScaleY = window.innerHeight / gridHeight;
  coverCellSize = Math.ceil(Math.max(coverScaleX, coverScaleY)); // Use floor for crips pixels

  // Set the canvas drawing buffer size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  cellSize = coverCellSize;
  targetCellSize = cellSize;

  // Calculate offsets to center the grid on the canvas
  const gridRenderWidth = gridWidth * cellSize;
  const gridRenderHeight = gridHeight * cellSize;
  xOffset = Math.floor((canvas.width - gridRenderWidth) / 2);
  yOffset = Math.floor((canvas.height - gridRenderHeight) / 2);
}

export function zoomAt(scale, screenX, screenY) {
  targetCellSize = Math.max(coverCellSize, Math.min(cellSize * scale, 100));
  zoomCenterX = screenX;
  zoomCenterY = screenY;
}

export function updateCellSizeAnimation() {
    if (Math.abs(cellSize - targetCellSize) < 0.01) {
        cellSize = targetCellSize;
        return { changed: false, oldCellSize: cellSize };
    }
    const oldCellSize = cellSize;
    cellSize += (targetCellSize - cellSize) * ZOOM_SPEED;
    return { changed: true, oldCellSize: oldCellSize };
}

export function focusOnZoomTarget(oldCellSize) {
    const gridX = (zoomCenterX - xOffset) / oldCellSize;
    const gridY = (zoomCenterY - yOffset) / oldCellSize;

    xOffset = zoomCenterX - gridX * cellSize;
    yOffset = zoomCenterY - gridY * cellSize;
}

export function clampOffsets(gridWidth, gridHeight) {
    const gridRenderWidth = gridWidth * cellSize;
    const gridRenderHeight = gridHeight * cellSize;

    let minX = 0;
    let maxX = canvas.width - gridRenderWidth;
    let minY = 0;
    let maxY = canvas.height - gridRenderHeight;

    if (gridRenderWidth > canvas.width) {
        minX = canvas.width - gridRenderWidth;
        maxX = 0;
    }

    if (gridRenderHeight > canvas.height) {
        minY = canvas.height - gridRenderHeight;
        maxY = 0;
    }
    
    xOffset = Math.max(minX, Math.min(maxX, xOffset));
    yOffset = Math.max(minY, Math.min(maxY, yOffset));
}

export function adjustOffsets(dx, dy) {
  xOffset += dx;
  yOffset += dy;
}

function lerpColor(color1, color2, ratio) {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawGrid(grid, maxAge) {
  context.fillStyle = "#000000"; // Background color
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const rowCount = grid.length;
  if (rowCount === 0) return;
  const colCount = grid[0].length;

  const startCol = Math.max(0, Math.floor(-xOffset / cellSize));
  const endCol = Math.min(colCount, Math.ceil((canvas.width - xOffset) / cellSize));
  const startRow = Math.max(0, Math.floor(-yOffset / cellSize));
  const endRow = Math.min(rowCount, Math.ceil((canvas.height - yOffset) / cellSize));

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const cell = grid[r][c];
      const x = xOffset + c * cellSize;
      const y = yOffset + r * cellSize;

      if (cell.state === "ALIVE" || cell.state == "REBORN") {
        const ageRatio = Math.min(cell.age, maxAge) / maxAge;
        const currentColor = lerpColor(cell.color, C_OLD_RGB, ageRatio);
        const blur = 20 * (1 - ageRatio);
       
        context.fillStyle = currentColor;
        context.shadowColor = currentColor;
        context.shadowBlur = blur;

        const size = Math.max(1, cellSize - 1);
        context.fillRect(x, y, size, size);
        context.shadowBlur = 0;
        
      } else if (cell.state === "DECAYING") {
        context.fillStyle = C_DECAYING_HEX;
        const size = Math.max(1, cellSize - 1);
        context.fillRect(x, y, size, size);
      }
    }
  }
}

