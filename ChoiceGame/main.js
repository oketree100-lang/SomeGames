// ---------
// CONSTANTS
// ---------


// Game
const PLAYER_COLOR = "#000000";

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 50;

const GAME_HALF_WIDTH = GAME_WIDTH * 0.5;
const GAME_HALF_HEIGHT = GAME_HEIGHT * 0.5;
const PLAYER_HALF_SIZE = PLAYER_SIZE * 0.5;

// HTML Elements
const canvas = document.getElementById("canvas");


// ---------
// VARIABLES
// ---------


// Canvas
let canvasCtx;
let canvasRect;

// Frame
let lastFrame = Date.now();
let dt = 0;


// ---------
// FUNCTIONS
// ---------


// Event Handelers
function handelWindowResize() {
    canvasRect = canvas.getBoundingClientRect();

    canvasCtx = canvas.getContext("2d");
}

// Rendering
function drawPlayer() {
    canvasCtx.fillStyle = PLAYER_COLOR;

    canvasCtx.fillRect(GAME_HALF_WIDTH - PLAYER_HALF_SIZE, GAME_HALF_HEIGHT - PLAYER_HALF_SIZE, PLAYER_SIZE, PLAYER_SIZE);

}

function drawFrame() {
    const currentTime = Date.now();
    dt = currentTime - lastFrame;

    canvasCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawPlayer();

    lastFrame = currentTime;
    requestAnimationFrame(drawFrame);
}


// ---------------
// EVENT LISTENERS
// ---------------


window.addEventListener("resize", handelWindowResize);


// --------------
// INITIALIZATION
// --------------


handelWindowResize();

requestAnimationFrame(drawFrame);