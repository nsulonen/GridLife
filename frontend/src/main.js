import { drawGrid, resizeCanvas, cellSize } from "./renderer.js";
import { init, tick, getSimulationState, shiftGrid, WIDTH, HEIGHT, MAX_AGE } from "./simulation.js";

const canvas = document.getElementById("gridlife-canvas");
const SIMULATION_TICK_MS = 100;

// --- Panning logic (mouse & touch) ---
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;
let accumulatedDeltaX = 0;
let accumulatedDeltaY = 0;

function getEventCoords(e) {
  return e.touches ? e.touches[0] : e;
}

function onPanStart(e) {
  isPanning = true;
  const coords = getEventCoords(e);
  lastPanX = coords.clientX;
  lastPanY = coords.clientY;
  canvas.style.cursor = "grabbing";
}

function onPanEnd() {
  isPanning = false;
  canvas.style.cursor = "grab";
}

function onPanMove(e) {
  if (!isPanning) return;
  e.preventDefault();

  const isTouchEvent = e.touches !== undefined;
  const coords = getEventCoords(e);

  accumulatedDeltaX += coords.clientX - lastPanX;
  accumulatedDeltaY += coords.clientY - lastPanY;

  lastPanX = coords.clientX;
  lastPanY = coords.clientY;

  const shiftX = Math.trunc(accumulatedDeltaX / cellSize);
  const shiftY = Math.trunc(accumulatedDeltaY / cellSize);

  if (shiftX !== 0 || shiftY !== 0) {
    accumulatedDeltaX -= shiftX * cellSize;
    accumulatedDeltaY -= shiftY * cellSize;

    if (!isTouchEvent) {
      shiftGrid(-shiftX, -shiftY);
    } else {
      shiftGrid(shiftX, shiftY);
    }
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

// --- Game loop ---
function gameLoop() {
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
