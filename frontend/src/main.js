import { drawGrid, resizeCanvas, zoomAt, adjustOffsets, updateCellSizeAnimation, focusOnZoomTarget, cellSize, clampOffsets } from "./renderer.js";
import { init, tick, getSimulationState, shiftGrid, WIDTH, HEIGHT, MAX_AGE } from "./simulation.js";

const canvas = document.getElementById("gridlife-canvas");
const SIMULATION_TICK_MS = 100;

// --- Panning logic (mouse & touch) ---
let isPanning = false;
let pinchMoved = false;
let lastPanX = 0;
let lastPanY = 0;
let panAccumulatorX = 0;
let panAccumulatorY = 0;
let initialPinchDistance = 0;
let activePointers = [];

function onPanStart(e) {
  e.preventDefault();
  activePointers.push(e);
  if (activePointers.length === 2) {
    const p1 = activePointers[0];
    const p2 = activePointers[1];

    initialPinchDistance = Math.sqrt((p2.clientX - p1.clientX) ** 2 + (p2.clientY - p1.clientY) ** 2);
    
  } else {
    isPanning = true;
    lastPanX = e.clientX;
    lastPanY = e.clientY;
    canvas.style.cursor = "grabbing";
    panAccumulatorX = 0;
    panAccumulatorY = 0;
  }
}

function onPanEnd(e) {
  isPanning = false;
  canvas.style.cursor = "grab";
  activePointers = activePointers.filter(pointer => pointer.pointerId !== e.pointerId);
}

function onPanMove(e) {
  e.preventDefault();
  if (activePointers.length === 2) {
    for (let i = 0; i < activePointers.length; i++) {
      if (activePointers[i].pointerId === e.pointerId) {
        activePointers[i] = e;
      }
    }
    pinchMoved = true;  
    
  } else if (isPanning) {
    const dx = e.clientX - lastPanX;
    const dy = e.clientY - lastPanY;
    lastPanX = e.clientX;
    lastPanY = e.clientY;

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
}

canvas.style.cursor = "grab";
canvas.addEventListener("pointerdown", onPanStart);
canvas.addEventListener("pointerup", onPanEnd);
canvas.addEventListener("pointermove", onPanMove);
canvas.addEventListener("pointerleave", onPanEnd);
canvas.addEventListener("pointercancel", onPanEnd);
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

  if (pinchMoved) {
    const p1 = activePointers[0];
    const p2 = activePointers[1];
    const newPinchDistance = Math.sqrt((p2.clientX - p1.clientX) ** 2 + (p2.clientY - p1.clientY) ** 2);
    const scale = newPinchDistance / initialPinchDistance;
    const midPointX = (p1.clientX + p2.clientX) / 2;
    const midPointY = (p1.clientY + p2.clientY) / 2;

    zoomAt(scale, midPointX, midPointY);
    initialPinchDistance = newPinchDistance; 
    pinchMoved = false;
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
