// =========
// CONSTANTS
// =========


// HTML Elements
const canvas = document.getElementById("canvas");

// Color Constants
const TOWER_COLOR = "#ffc400";
const TOWER_BULLET_COLOR = "#000000";
const BASIC_ENEMY_COLOR = "#ffffff";

// Game Constants
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const TOWER_SIZE = 50;
const TOWER_BULLET_SIZE = 10;
const BASIC_ENEMY_SIZE = 25;

const GAME_HALF_WIDTH = GAME_WIDTH * 0.5;
const GAME_HALF_HEIGHT = GAME_HEIGHT * 0.5;
const TOWER_HALF_SIZE = TOWER_SIZE * 0.5;
const TOWER_BULLET_HALF_SIZE = TOWER_BULLET_SIZE * 0.5;
const BASIC_ENEMY_HALF_SIZE = BASIC_ENEMY_SIZE * 0.5;

const TOWER_BULLET_SPEED = 0.7;
const BASIC_ENEMY_SPEED = 0.1;

const BASIC_ENEMY_BASE_HEALTH = 100;

const TOWER_BULLET_BASE_DAMAGE = 35;

const BASIC_ENEMY_STOP_RADIUS_SQUARED = 10000;

const gameMouse = {x: 0, y: 0};

const towerBullets = [];
const basicEnemies = [];


// =========
// VARIABLES
// =========


// Canvas
let canvasRect;
let canvasCtx;

// Frame
let lastFrame = Date.now();
let dt;

// Game
let waveAcimulator = 5000;
let waveStageAcimulator = 0;

let towerAngle = 0;


// ====================
// FUNCTION DEFINITIONS
// ====================


// Event Handelers
function handelWindowResize(e) {
    canvasRect = canvas.getBoundingClientRect();

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    canvasCtx = canvas.getContext("2d");
}

function handelVisiblityChange() {
    if (!document.hidden) {
        lastFrame = Date.now();
        dt = 0;
    }
}

function handelMouseMove(e) {
    gameMouse.x = e.clientX - canvasRect.left;
    gameMouse.y = e.clientY - canvasRect.top;

    towerAngle = 3.14 + Math.atan2(canvasRect.height * 0.5 - gameMouse.y, canvasRect.width * 0.5 - gameMouse.x);
}

function handelMouseClick(e) {
    if (e.button === 0) {
        const newTowerBullet = {
            x: GAME_HALF_WIDTH,
            y: GAME_HALF_HEIGHT,
            angle: towerAngle
        }

        towerBullets.push(newTowerBullet);
    }
}

// Game Logic
function getCollidingEnemy(x, y, w, h) {

    for (let i = 0; i < basicEnemies.length; i++) {
        const currentBasicEnemy = basicEnemies[i];

        const dx = currentBasicEnemy.x + BASIC_ENEMY_HALF_SIZE - x;
        const dy = currentBasicEnemy.y + BASIC_ENEMY_HALF_SIZE - y;

        if (dx > 0 && dx < BASIC_ENEMY_SIZE + w && dy > 0 && dy < BASIC_ENEMY_SIZE + h) {
            return ["BasicEnemy", currentBasicEnemy];
        }
    }

    return null;
}

function waveStep() {
    waveAcimulator += dt;

    if (waveAcimulator > 5000) {
        waveAcimulator -= 5000;

        for (let i = 0; i < 3; i++) {
            const newBasicEnemy = {
                x: Math.random() * GAME_WIDTH * 1.1,
                y: Math.round(Math.random()) * GAME_HEIGHT * 1.1,
                health: BASIC_ENEMY_BASE_HEALTH
            }

            basicEnemies.push(newBasicEnemy);
        }
    }
}

function updateTowerBullets() {
    for (let i = towerBullets.length - 1; i >= 0 ; i--) {
        const currentTowerBullet = towerBullets[i];

        currentTowerBullet.x += TOWER_BULLET_SPEED * Math.cos(currentTowerBullet.angle) * dt;
        currentTowerBullet.y += TOWER_BULLET_SPEED * Math.sin(currentTowerBullet.angle) * dt;

        if (currentTowerBullet.x <= 0 || currentTowerBullet.x > GAME_WIDTH || currentTowerBullet.y <= 0 || currentTowerBullet.y > GAME_WIDTH) {
            towerBullets.splice(i, 1);
            i--;
        }

        const collision = getCollidingEnemy(currentTowerBullet.x, currentTowerBullet.y, TOWER_BULLET_SIZE, TOWER_BULLET_SIZE);

        if (!collision) {}
        else if (collision[0] === "BasicEnemy") {
            towerBullets.splice(i, 1);
            i--;

            const currentBasicEnemy = collision[1];

            currentBasicEnemy.health -= TOWER_BULLET_BASE_DAMAGE;
        }
    }
}

function updateBasicEnemies() {
    for (let i = 0; i < basicEnemies.length; i++) {
        const currentBasicEnemy = basicEnemies[i];

        if (currentBasicEnemy.health <= 0) {
            basicEnemies.splice(i, 1);
            i--;
        }

        if (Math.pow(GAME_HALF_WIDTH - currentBasicEnemy.x, 2) + Math.pow(GAME_HALF_HEIGHT - currentBasicEnemy.y, 2) > BASIC_ENEMY_STOP_RADIUS_SQUARED) {
            const angle = Math.atan2(GAME_HALF_HEIGHT - currentBasicEnemy.y, GAME_HALF_WIDTH - currentBasicEnemy.x);

            currentBasicEnemy.x += BASIC_ENEMY_SPEED * Math.cos(angle) * dt;
            currentBasicEnemy.y += BASIC_ENEMY_SPEED * Math.sin(angle) * dt;
        }
    }
}

function gameStep() {
    waveStep();
    
    updateTowerBullets();

    updateBasicEnemies();
}

// Rendering Logic
function drawTower() {
    canvasCtx.fillStyle = TOWER_COLOR;
    canvasCtx.save();
    canvasCtx.translate(GAME_HALF_WIDTH, GAME_HALF_HEIGHT);
    canvasCtx.rotate(towerAngle);
    canvasCtx.fillRect(-TOWER_HALF_SIZE, -TOWER_HALF_SIZE, TOWER_SIZE, TOWER_SIZE);
    canvasCtx.restore();
}

function drawTowerBullets() {
    canvasCtx.fillStyle = TOWER_BULLET_COLOR;

    for (let i = 0; i < towerBullets.length; i++) {
        const currentTowerBullet = towerBullets[i];

        canvasCtx.save();
        canvasCtx.translate(currentTowerBullet.x, currentTowerBullet.y);
        canvasCtx.rotate(currentTowerBullet.angle);
        canvasCtx.fillRect(-TOWER_BULLET_HALF_SIZE, -TOWER_BULLET_HALF_SIZE, TOWER_BULLET_SIZE, TOWER_BULLET_SIZE);
        canvasCtx.restore();
    }
}

function drawBasicEnemies() {
    canvasCtx.fillStyle = BASIC_ENEMY_COLOR;

    for (let i = 0; i < basicEnemies.length; i++) {
        const currentBasicEnemy = basicEnemies[i];
        
        const angle = Math.atan2(GAME_HALF_HEIGHT - currentBasicEnemy.y, GAME_HALF_WIDTH - currentBasicEnemy.x);

        canvasCtx.save();
        canvasCtx.translate(currentBasicEnemy.x, currentBasicEnemy.y);
        // canvasCtx.rotate(angle);
        canvasCtx.fillRect(-BASIC_ENEMY_HALF_SIZE, -BASIC_ENEMY_HALF_SIZE, BASIC_ENEMY_SIZE, BASIC_ENEMY_SIZE);
        canvasCtx.restore();
    }
}

function drawFrame() {
    const startFrameTime = Date.now();
    dt = startFrameTime - lastFrame;

    gameStep();

    canvasCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawTowerBullets();

    drawBasicEnemies();

    drawTower();

    lastFrame = startFrameTime;
    requestAnimationFrame(drawFrame);
}


// ===============
// EVENT LISTENERS
// ===============

window.addEventListener('resize', handelWindowResize);

document.addEventListener('visibilitychange', handelVisiblityChange);

canvas.addEventListener('mousemove', handelMouseMove);
canvas.addEventListener('click', handelMouseClick);


// ==========
// INITIALIZE
// ==========


handelWindowResize();

requestAnimationFrame(drawFrame);