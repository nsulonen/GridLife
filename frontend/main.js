const flask_server = 'http://127.0.0.1:5000/';
const canvas = document.getElementById('vivarium-canvas');
const context = canvas.getContext('2d');

fetch(flask_server)
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log("Success! Data from server:", data);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });

function drawGrid(grid) {
  const rowCount = grid.length;
  if (rowCount === 0) return;

  const colCount = grid[0].length;
  const cellSize = canvas.width / colCount;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {

      if (grid[r][c] === 1) {
        context.fillStyle = 'white';
        context.fillRect(
          c * cellSize,
          r * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

function update() {
  fetch(flask_server)
    .then(response => response.json())
    .then(gridData => {
      drawGrid(gridData);
    })
}

setInterval(update, 100);
