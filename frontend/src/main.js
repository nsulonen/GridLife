import { drawGrid, resizeCanvas, zoomAt, adjustOffsets, updateCellSizeAnimation, focusOnZoomTarget, cellSize, clampOffsets } from "./renderer.js";
import { init, tick, getSimulationState, shiftGrid, WIDTH, HEIGHT, MAX_AGE } from "./simulation.js";

const canvas = document.getElementById("gridlife-canvas");
const SIMULATION_TICK_MS = 100;

// --- Panning logic (mouse & touch) ---
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;
let panAccumulatorX = 0;
let panAccumulatorY = 0;

function getEventCoords(e) {
  return e.touches ? e.touches[0] : e;
}

function onPanStart(e) {
  e.preventDefault();
  
  isPanning = true;
  const coords = getEventCoords(e);
  lastPanX = coords.clientX;
  lastPanY = coords.clientY;
  canvas.style.cursor = "grabbing";
  panAccumulatorX = 0;
  panAccumulatorY = 0;
}

function onPanEnd() {
  isPanning = false;
  canvas.style.cursor = "grab";
}

function onPanMove(e) {
  if (!isPanning) return;
  e.preventDefault();

  const coords = getEventCoords(e);
  const dx = coords.clientX - lastPanX;
  const dy = coords.clientY - lastPanY;
  lastPanX = coords.clientX;
  lastPanY = coords.clientY;

  adjustOffsets(dx, dy);

  panAccumulatorX += dx;
  panAccumulatorY += dy;

  const shiftX = Math.trunc(panAccumulatorX / cellSize);
  const shiftY = Math.trunc(panAccumulatorY / cellSize);

  if (shiftX !== 0 || shiftY !== 0) {
    shiftGrid(-shiftX, -shiftY);
    panAccumulatorX -= shiftX * cellSize;
    panAccumulatorY -= shiftY * cellSize;
    adjustOffsets(-shiftX * cellSize, -shiftY * cellSize);
  }
}

canvas.style.cursor = "grab";
canvas.addEventListener("mousedown", onPanStart);
canvas.addEventListener("touchstart", onPanStart, { passive: true });
canvas.addEventListener("mouseup", onPanEnd);
canvas.addEventListener("touchend", onPanEnd);
canvas.addEventListener("mouseleave", onPanEnd);
canvas.addEventListener("touchcancel", onPanEnd);
canvas.addEventListener("mousemove", onPanMove);
canvas.addEventListener("touchmove", onPanMove, { passive: false });
canvas.addEventListener("wheel", onWheelZoom, { passive: false });

function onWheelZoom(e) {
  e.preventDefault();
  const scale = 1 - e.deltaY * 0.005;

  zoomAt(scale, e.clientX, e.clientY);
}

// --- Game loop ---
function gameLoop() {
  const { changed, oldCellSize } = updateCellSizeAnimation();
  if (changed) {
    focusOnZoomTarget(oldCellSize);
    clampOffsets(WIDTH, HEIGHT);
  }
  
  const { grid } = getSimulationState();
  if (grid.length > 0) {
    drawGrid(grid, MAX_AGE);
  }
  requestAnimationFrame(gameLoop);
}

// --- Initialization ---
function handleResize() {
  resizeCanvas(WIDTH, HEIGHT);
}

window.addEventListener("resize", handleResize);
handleResize();
init();

// Start the simulation update loop
setInterval(tick, SIMULATION_TICK_MS);

// Start the rendering loop
gameLoop();
