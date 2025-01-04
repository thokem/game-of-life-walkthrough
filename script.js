/**
 * @typedef {Object} GameConfig
 * @property {number} CELL_SIZE - Size of each cell in pixels
 * @property {number} FRAME_DELAY - Delay between frames in milliseconds
 * @property {number} INITIAL_ALIVE_PROBABILITY - Probability of a cell being alive
 * @property {Object.<number, string>} COLORS - Color mapping for cell states
 */
const CONFIG = {
    CELL_SIZE: 10,
    FRAME_DELAY: 500,
    INITIAL_ALIVE_PROBABILITY: 0.3,
    COLORS: {
        0: '#9be9a8',
        1: '#40c463',
        2: '#30a14e',
        3: '#216e39'
    }
};

/**
 * Conway's Game of Life implementation
 * @class GameOfLife
 */
class GameOfLife {
    /**
     * @param {string} canvasId - ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.grid = [];
        
        this.initializeCanvas();
        this.bindEvents();
    }

    initializeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initGrid();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.initializeCanvas());
    }

    /**
     * Calculates the dimensions for the grid based on window size
     * @returns {{rows: number, cols: number}}
     */
    calculateGridDimensions() {
        return {
            rows: Math.floor(window.innerHeight / CONFIG.CELL_SIZE),
            cols: Math.floor(window.innerWidth / CONFIG.CELL_SIZE)
        };
    }

    /**
     * Initializes the game grid with random cell states
     */
    initGrid() {
        const { rows, cols } = this.calculateGridDimensions();
        this.grid = Array(rows).fill().map(() => 
            Array(cols).fill().map(() => 
                Math.random() > CONFIG.INITIAL_ALIVE_PROBABILITY
            )
        );
    }


    /**
     * Counts the number of live neighbors for a cell at the specified position.
     * Uses toroidal array (wrapping around edges) to handle boundary cells.
     * 
     * @param {number} row - The row index of the current cell
     * @param {number} col - The column index of the current cell
     * @returns {number} The count of live neighboring cells (0-8)
     * 
     * @example
     * // For a cell at position (1,1), checks all 8 surrounding positions:
     * // [0,0][0,1][0,2]
     * // [1,0][1,1][1,2]
     * // [2,0][2,1][2,2]
     * const liveNeighbors = game.countNeighbors(1, 1);
     */
    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.grid.length) % this.grid.length;
                const newCol = (col + j + this.grid[0].length) % this.grid[0].length;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    /**
     * Draws a single cell on the canvas
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} neighbors - Number of living neighbors
     */
    drawCell(row, col, neighbors) {
        this.ctx.fillStyle = CONFIG.COLORS[Math.min(3, neighbors)];
        this.ctx.beginPath();
        this.ctx.roundRect(
            col * CONFIG.CELL_SIZE,
            row * CONFIG.CELL_SIZE,
            CONFIG.CELL_SIZE - 1,
            CONFIG.CELL_SIZE - 1,
            2
        );
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.grid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    this.drawCell(i, j, this.countNeighbors(i, j));
                }
            });
        });
    }

    update() {
        this.grid = this.grid.map((row, i) => 
            row.map((cell, j) => {
                const neighbors = this.countNeighbors(i, j);
                return neighbors === 3 || (cell && neighbors === 2);
            })
        );
    }

    gameLoop() {
        if (this.isRunning) {
            this.update();
            this.draw();
            setTimeout(() => requestAnimationFrame(() => this.gameLoop()), CONFIG.FRAME_DELAY);
        }
    }

    toggle() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) this.gameLoop();
    }

    reset() {
        this.isRunning = false;
        this.initGrid();
        this.draw();
    }
}

// Initialize game
const game = new GameOfLife('gameCanvas');
game.draw();

// Expose control functions to window
window.toggleGame = () => game.toggle();
window.resetGame = () => game.reset();
