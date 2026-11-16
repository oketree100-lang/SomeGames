// ---------
// CONSTANTS
// ---------


// HTML elements
const canvas = document.getElementById("canvas");

// Game
// Sizes
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const PLAYER_SIZE = 50;

// Half Sizes
const GAME_HALF_WIDTH = GAME_WIDTH * 0.5;
const GAME_HALF_HEIGHT = GAME_HEIGHT * 0.5;
const PLAYER_HALF_SIZE = PLAYER_SIZE * 0.5;

// Positions
const GROUND_Y = GAME_HEIGHT * 0.8;

// Logic
const PLAYER_SPEED = 0.5;
const GRAVITY = 0.008;

// Objects
const actionInput = {
    moveLeft: false,
    moveRight: false,
    jump: false
}


// ---------
// VARIABLES
// ---------


// Game
let playerX = GAME_HALF_WIDTH;
let playerY = 0;
let playerVX = 0;
let playerVY = 0;

// Canvas
let canvasCtx;

// Other
let lastFrame = Date.now();
let dt = 0;


// --------------------
// FUNCTION DEFINITIONS
// --------------------


// Event Listeners
function handleWindowResize() {
    canvasCtx = canvas.getContext("2d");

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}

function handleKeyDown(e) {
    if (e.key == "w" || e.key == "ArrowUp" || e.key == " ") actionInput.jump = true;
    if (e.key == "a" || e.key == "ArrowLeft") actionInput.moveLeft = true;
    if (e.key == "d" || e.key == "ArrowRight") actionInput.moveRight = true;
}

function handleKeyUp(e) {
    if (e.key == "w" || e.key == "ArrowUp" || e.key == " ") actionInput.jump = false;
    if (e.key == "a" || e.key == "ArrowLeft") actionInput.moveLeft = false;
    if (e.key == "d" || e.key == "ArrowRight") actionInput.moveRight = false;
}

// Game Logic
function isPlayerGrounded() {
    return playerY + PLAYER_HALF_SIZE > GROUND_Y;
}

function updatePlayer() {
    playerX += playerVX * dt;

    playerVY += GRAVITY * dt;
    playerY += playerVY * dt;

    if (isPlayerGrounded()) {
        playerVY = 0;
        playerY = GROUND_Y - PLAYER_HALF_SIZE + 0.01;
    }

    if (actionInput.moveLeft) {
        playerVX = -PLAYER_SPEED;
    } else if (actionInput.moveRight) {
        playerVX = PLAYER_SPEED;
    } else {
        playerVX = 0;
    }

    if (actionInput.jump && isPlayerGrounded()) {
        playerVY = -2;
    }
}

function stepGameTick() {
    updatePlayer();
}

// Render Logic
function drawBackground() {
    canvasCtx.fillStyle = "#94603d";
    canvasCtx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
}

function drawPlayer() {
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.fillRect(playerX - PLAYER_HALF_SIZE, playerY - PLAYER_HALF_SIZE, PLAYER_SIZE, PLAYER_SIZE);
}

function drawCalls() {
    canvasCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawBackground();
    drawPlayer();
}

function stepFrame() {
    const currentTime = Date.now();
    dt = currentTime - lastFrame;
    lastFrame = currentTime;

    stepGameTick();

    drawCalls();

    requestAnimationFrame(stepFrame);
}


// ----------
// INITIALIZE
// ----------


window.addEventListener('resize', handleWindowResize);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

handleWindowResize();
requestAnimationFrame(stepFrame);