// =========
// CONSTANTS
// =========


// HTML Elements
const canvas = document.getElementById("canvas");

// UI
const currencyText = document.getElementById("currency-text");
const towerHealthText = document.getElementById("tower-health-text");
const waveText = document.getElementById("wave-text");
const towerUpgradesOpenClose = document.getElementById("tower-upgrades-open-close");
const towerUpgradesMenu = document.getElementById("tower-upgrades-menu");

const towerHealthBar = document.getElementById("tower-health-bar");

// Color Constants
const TOWER_COLOR = "#ffc400";
const TOWER_BULLET_COLOR = "#000000";
const BASIC_ENEMY_COLOR = "#ffffff";
const TEXT_COLOR = "#ffffff";

// Game Constants
// Dimensions
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const TOWER_SIZE = 50;
const TOWER_BULLET_SIZE = 10;
const BASIC_ENEMY_SIZE = 25;

// Half Dimensions
const GAME_HALF_WIDTH = GAME_WIDTH * 0.5;
const GAME_HALF_HEIGHT = GAME_HEIGHT * 0.5;
const TOWER_HALF_SIZE = TOWER_SIZE * 0.5;
const TOWER_BULLET_HALF_SIZE = TOWER_BULLET_SIZE * 0.5;
const BASIC_ENEMY_HALF_SIZE = BASIC_ENEMY_SIZE * 0.5;

// Positioning
const CURRENCY_POSITION_X = GAME_HALF_WIDTH;
const CURRENCY_POSITION_Y = 70;

// Speeds
const TOWER_BULLET_SPEED = 0.7;
const BASIC_ENEMY_SPEED = 0.1;

// Health
const TOWER_BASE_HEALTH = 100;
const BASIC_ENEMY_BASE_HEALTH = 100;

// Damage
const TOWER_BULLET_BASE_DAMAGE = 50;
const BASIC_ENEMY_BASE_DAMAGE = 3;

// Cooldown
const TOWER_SHOOT_BASE_COOLDOWN = 1000;
const BASIC_ENEMY_BASE_ATTACK_COOLDOWN = 1000;

// Radii
const BASIC_ENEMY_STOP_RADIUS_SQUARED = 10000;


// Other
const WAVE_BASE_DELAY = 3000;

// Objects
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
let gameValues = {
    currency: 0,
    
    upgrades: {
        cooldown: 0
    }
}

let waveAcimulator = 0;
let waveStageAcimulator = 0;
let wave = 1;

let towerShootCooldown = 0;
let towerHealth = TOWER_BASE_HEALTH;


// ====================
// FUNCTION DEFINITIONS
// ====================


// Event Handlers
// Window
function handleWindowResize(e) {
    canvasRect = canvas.getBoundingClientRect();

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    canvasCtx = canvas.getContext("2d");
}

function handleVisiblityChange() {
    if (!document.hidden) {
        lastFrame = Date.now();
        dt = 0;
    }
}

// HTML
function handleTowerUpgradesOpenCloseClick() {
    towerUpgradesMenu.style.setProperty("--x-offset", 1 - getComputedStyle(towerUpgradesMenu).getPropertyValue("--x-offset"));
    
    if (towerUpgradesOpenClose.textContent == "Open") {
        towerUpgradesOpenClose.textContent = "Close";
    } else {
        towerUpgradesOpenClose.textContent = "Open";
    }
}

// Mouse
function handleMouseMove(e) {
    gameMouse.x = e.clientX - canvasRect.left;
    gameMouse.y = e.clientY - canvasRect.top;
}

// Game Event Handlers
function handleBasicEnemyDeath() {
    gameValues.currency += 10;
}

function handleTowerDeath() {
    towerHealth = TOWER_BASE_HEALTH;

    wave = 1;
    waveAcimulator = 0;
    waveStageAcimulator = 0;

    basicEnemies.length = 0;
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

function stepWave() {
    waveAcimulator += dt;

    if (waveAcimulator > WAVE_BASE_DELAY) {
        waveAcimulator -= WAVE_BASE_DELAY;
        waveStageAcimulator++;

        for (let i = 0; i < 3; i++) {
            let x, y;

            if (Math.random() > 0.5) {
                x = Math.random() * GAME_WIDTH;
                y = Math.round(Math.random()) * GAME_HEIGHT;
            } else {
                x = Math.round(Math.random()) * GAME_WIDTH;
                y = Math.random() * GAME_HEIGHT;
            }

            const newBasicEnemy = {
                x: x,
                y: y,
                health: BASIC_ENEMY_BASE_HEALTH,
                attackCooldown: 0
            }

            basicEnemies.push(newBasicEnemy);
        }
    }

    if (waveStageAcimulator > 5) {
        waveStageAcimulator = 0;
        wave++;
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

        currentBasicEnemy.attackCooldown += dt;

        if (currentBasicEnemy.health <= 0) {
            basicEnemies.splice(i, 1);
            i--;

            handleBasicEnemyDeath();
        }

        if (Math.pow(GAME_HALF_WIDTH - currentBasicEnemy.x, 2) + Math.pow(GAME_HALF_HEIGHT - currentBasicEnemy.y, 2) > BASIC_ENEMY_STOP_RADIUS_SQUARED) {
            const angle = Math.atan2(GAME_HALF_HEIGHT - currentBasicEnemy.y, GAME_HALF_WIDTH - currentBasicEnemy.x);

            currentBasicEnemy.x += BASIC_ENEMY_SPEED * Math.cos(angle) * dt;
            currentBasicEnemy.y += BASIC_ENEMY_SPEED * Math.sin(angle) * dt;
        } else {
            if (currentBasicEnemy.attackCooldown > BASIC_ENEMY_BASE_ATTACK_COOLDOWN) {
                currentBasicEnemy.attackCooldown = 0;
                towerHealth -= BASIC_ENEMY_BASE_DAMAGE;
            }
        }
    }
}

function shootTowerBullet() {
    const allEnemies = [...basicEnemies];

    if (allEnemies.length == 0) return;

    if (towerShootCooldown > TOWER_SHOOT_BASE_COOLDOWN * 10 / (gameValues.upgrades.cooldown + 10)) {
        towerShootCooldown = 0;

        const distancesSquared = [];

        for (let i = 0; i < allEnemies.length; i++) {
            const currentEnemy = allEnemies[i];

            const distance = Math.pow(currentEnemy.x - GAME_HALF_WIDTH) + Math.pow(currentEnemy.y - GAME_HALF_HEIGHT);
            distancesSquared.push(distance);
        }

        let min = distancesSquared[0];
        let idx = 0;

        for (let i = 1; i < distancesSquared.length; i++) {
            if (distancesSquared[i] < min) {
                min = distancesSquared[i];
                idx = i;
            }
        }

        const currentEnemy = allEnemies[idx];

        const angle = Math.atan2(currentEnemy.y - GAME_HALF_HEIGHT, currentEnemy.x - GAME_HALF_WIDTH);

        const newTowerBullet = {
            x: GAME_HALF_WIDTH,
            y: GAME_HALF_HEIGHT,
            angle: angle
        };

        towerBullets.push(newTowerBullet);
    }
}

function updateTower() {
    towerShootCooldown += dt;

    if (towerHealth <= 1) handleTowerDeath();
}

function stepGameTick() {
    stepWave();

    shootTowerBullet();
    
    updateTower();
    updateTowerBullets();

    updateBasicEnemies();
}

// Rendering Logic
function drawTower() {
    canvasCtx.fillStyle = TOWER_COLOR;
    canvasCtx.save();
    canvasCtx.translate(GAME_HALF_WIDTH, GAME_HALF_HEIGHT);
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
        canvasCtx.rotate(angle);
        canvasCtx.fillRect(-BASIC_ENEMY_HALF_SIZE, -BASIC_ENEMY_HALF_SIZE, BASIC_ENEMY_SIZE, BASIC_ENEMY_SIZE);
        canvasCtx.restore();
    }
}

function updateUI() {
    currencyText.textContent = `Currency: ${gameValues.currency}`;
    towerHealthText.textContent = `${towerHealth} / ${TOWER_BASE_HEALTH}`;
    waveText.textContent = `Wave: ${wave}`;

    towerHealthBar.style.setProperty("--width-scale", towerHealth / TOWER_BASE_HEALTH);
}

function drawCalls() {
    drawTowerBullets();

    drawBasicEnemies();
    
    drawTower();
}

function stepFrame() {
    const startFrameTime = Date.now();
    dt = startFrameTime - lastFrame;

    stepGameTick();

    canvasCtx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    updateUI();

    drawCalls();

    lastFrame = startFrameTime;
    requestAnimationFrame(stepFrame);
}


// ===============
// EVENT LISTENERS
// ===============

window.addEventListener('resize', handleWindowResize);

document.addEventListener('visibilitychange', handleVisiblityChange);
document.addEventListener('mousemove', handleMouseMove);

towerUpgradesOpenClose.addEventListener('click', handleTowerUpgradesOpenCloseClick);


// ==========
// INITIALIZE
// ==========


handleWindowResize();

requestAnimationFrame(stepFrame);