// =========
// CONSTANTS
// =========

// Imports
import BigNumber from "./BigNumber.js";
window.BigNumber = BigNumber;

// HTML Elements
const canvas = document.getElementById("canvas");

// UI
const currencyText = document.getElementById("currency-text");
const gemsText = document.getElementById("gems-text");
const towerHealthText = document.getElementById("tower-health-text");
const waveText = document.getElementById("wave-text");
const enemyHealthText = document.getElementById("enemy-health-text");
const enemyDamageText = document.getElementById("enemy-damage-text");

const towerUpgradesOpenClose = document.getElementById("tower-upgrades-open-close");
const towerUpgradesMenu = document.getElementById("tower-upgrades-menu");

const towerAttackSpeedUpgrade = document.getElementById("tower-attack-speed-upgrade");
const towerDamageUpgrade = document.getElementById("tower-damage-upgrade");
const towerRegenerationUpgrade = document.getElementById("tower-regeneration-upgrade");
const towerMaxHealthUpgrade = document.getElementById("tower-max-health-upgrade");

const towerHealthBar = document.getElementById("tower-health-bar");
const waveProgressBar = document.getElementById("wave-progress-bar");

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

// Speeds
const TOWER_BULLET_SPEED = 1.4;
const BASIC_ENEMY_SPEED = 0.2;

// Health
const TOWER_BASE_HEALTH = 10;
const BASIC_ENEMY_BASE_HEALTH = 1;

// Damage
const TOWER_BULLET_BASE_DAMAGE = 1;
const BASIC_ENEMY_BASE_DAMAGE = 1;

// Cooldown
const TOWER_BASE_ATTACK_COOLDOWN = 700;
const BASIC_ENEMY_BASE_ATTACK_COOLDOWN = 1000;

// Radii
const BASIC_ENEMY_STOP_RADIUS_SQUARED = 10000;


// Other
const WAVE_BASE_DELAY = 1800;
const WAVE_MAX_STAGE = 5;

// Objects
const gameValues = {
    currency: 0,
    gems: 0,
    
    upgrades: {
        attackCooldown: 0,
        damage: 0,
        regeneration: 0,
        maxHealth: 0
    }
}

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
let waveAcimulator = 0;
let waveStageAcimulator = 0;
let wave = 1;

let towerAttackCooldown = 0;
let towerHealth = TOWER_BASE_HEALTH;


// ====================
// FUNCTION DEFINITIONS
// ====================


// Event Handlers
// Document & Window
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

function handleKeyDown(e) {
    if (e.key == "w") {
        waveAcimulator += WAVE_BASE_DELAY * (WAVE_MAX_STAGE - waveStageAcimulator + 1);
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

// Tower Upgrades Purchase
function handleTowerAttackSpeedUpgradeClick() {
    if (canAffordUpgrade("towerAttackSpeedUpgradeCost")) {
        gameValues.currency -= getGameValue("towerAttackSpeedUpgradeCost");
        gameValues.upgrades.attackCooldown++;

        towerAttackSpeedUpgrade.querySelector('.buy-button').textContent = `${getGameValue("towerAttackSpeedUpgradeCost")}C`;
        towerAttackSpeedUpgrade.querySelector('.upgrade-value').textContent = `${(1000 / getGameValue("towerAttackCooldown")).toFixed(2)}s`;
    }
}

function handleTowerDamageUpgradeClick() {
    if (canAffordUpgrade("towerDamageUpgradeCost")) {
        gameValues.currency -= getGameValue("towerDamageUpgradeCost");
        gameValues.upgrades.damage++;

        towerDamageUpgrade.querySelector('.buy-button').textContent = `${getGameValue("towerDamageUpgradeCost")}C`;
        towerDamageUpgrade.querySelector('.upgrade-value').textContent = getGameValue("towerBulletDamage").toFixed(2);
    }
}

function handleTowerRegenerationUpgradeClick() {
    if (canAffordUpgrade("towerRegenerationUpgradeCost")) {
        gameValues.currency -= getGameValue("towerRegenerationUpgradeCost");
        gameValues.upgrades.regeneration++;

        towerRegenerationUpgrade.querySelector('.buy-button').textContent = `${getGameValue("towerRegenerationUpgradeCost")}C`;
        towerRegenerationUpgrade.querySelector('.upgrade-value').textContent = `${(1000 * getGameValue("towerRegeneration")).toFixed(2)}s`;
    }
}

function handleTowerMaxHealthUpgradeClick() {
    if (canAffordUpgrade("towerMaxHealthUpgradeCost")) {
        gameValues.currency -= getGameValue("towerMaxHealthUpgradeCost");
        gameValues.upgrades.maxHealth++;

        towerMaxHealthUpgrade.querySelector('.buy-button').textContent = `${getGameValue("towerMaxHealthUpgradeCost")}C`;
        towerMaxHealthUpgrade.querySelector('.upgrade-value').textContent = getGameValue("towerMaxHealth").toFixed(2);
    }
}

// Mouse
function handleMouseMove(e) {
    gameMouse.x = e.clientX - canvasRect.left;
    gameMouse.y = e.clientY - canvasRect.top;
}

// Game Event Handlers
function handleBasicEnemyDeath() {
    gameValues.currency += getGameValue("basicEnemyCurrencyReward");
    gameValues.gems += getGameValue("basicEnemyGemReward");
}

function handleTowerDeath() {
    towerHealth = getGameValue("towerMaxHealth");

    wave = 1;
    waveAcimulator = 0;
    waveStageAcimulator = 0;

    basicEnemies.length = 0;
}

// Game Logic
function getGameValue(value) {
    const values = {
        towerAttackSpeedUpgradeCost: () => gameValues.upgrades.attackCooldown + 1,
        towerDamageUpgradeCost: () => gameValues.upgrades.damage + 1,
        towerRegenerationUpgradeCost: () => gameValues.upgrades.regeneration + 1,
        towerMaxHealthUpgradeCost: () => gameValues.upgrades.maxHealth + 1,

        basicEnemyCurrencyReward: () => 1 + Math.log10(wave),
        
        basicEnemyGemReward: () => 0.001,

        towerHealth: () => TOWER_BASE_HEALTH * Math.floor(Math.pow(1.2, gameValues.upgrades.maxHealth)),
        basicEnemyHealth: () => BASIC_ENEMY_BASE_HEALTH * Math.floor(Math.pow(1.3, wave)),

        basicEnemyDamage: () => BASIC_ENEMY_BASE_DAMAGE * Math.pow(1.25, wave),

        towerAttackCooldown: () => TOWER_BASE_ATTACK_COOLDOWN * 20 / (gameValues.upgrades.attackCooldown + 20),
        towerBulletDamage: () => TOWER_BULLET_BASE_DAMAGE * Math.pow(1.2, gameValues.upgrades.damage) + gameValues.upgrades.damage,
        towerRegeneration: () => Math.pow(1.18, gameValues.upgrades.regeneration) * 0.001,
        towerMaxHealth: () => TOWER_BASE_HEALTH * Math.pow(1.15, gameValues.upgrades.maxHealth)
    }

    return values[value]();
}

function canAffordUpgrade(upgrade) {
    return gameValues.currency >= getGameValue(upgrade);
}

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
                health: getGameValue("basicEnemyHealth"),
                attackCooldown: 0
            }

            basicEnemies.push(newBasicEnemy);
        }
    }

    if (waveStageAcimulator > WAVE_MAX_STAGE) {
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

            towerAttackCooldown += getGameValue("towerAttackCooldown") * 0.5;
        }

        const collision = getCollidingEnemy(currentTowerBullet.x, currentTowerBullet.y, TOWER_BULLET_SIZE, TOWER_BULLET_SIZE);

        if (!collision) {}
        else if (collision[0] === "BasicEnemy") {
            towerBullets.splice(i, 1);
            i--;

            const currentBasicEnemy = collision[1];

            currentBasicEnemy.health -= getGameValue("towerBulletDamage");
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
                towerHealth -= getGameValue("basicEnemyDamage");
            }
        }
    }
}

function shootTowerBullet() {
    const allEnemies = [...basicEnemies];

    if (allEnemies.length == 0) return;

    if (towerAttackCooldown > getGameValue("towerAttackCooldown")) {
        towerAttackCooldown = 0;

        const distancesSquared = [];

        for (let i = 0; i < allEnemies.length; i++) {
            const currentEnemy = allEnemies[i];

            const distanceSquared = Math.pow(currentEnemy.x - GAME_HALF_WIDTH) + Math.pow(currentEnemy.y - GAME_HALF_HEIGHT);
            distancesSquared.push(distanceSquared);
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
    towerAttackCooldown += dt;
    
    if (towerHealth <= 1) handleTowerDeath();

    towerHealth += getGameValue("towerRegeneration") * dt;
    towerHealth = Math.min(towerHealth, getGameValue("towerMaxHealth"));
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

function updateTowerUpgradesUI() {
    towerAttackSpeedUpgrade.querySelector('.buy-button').classList.toggle("affordable", canAffordUpgrade("towerAttackSpeedUpgradeCost"));
    towerDamageUpgrade.querySelector('.buy-button').classList.toggle("affordable", canAffordUpgrade("towerDamageUpgradeCost"));
    towerRegenerationUpgrade.querySelector('.buy-button').classList.toggle("affordable", canAffordUpgrade("towerRegenerationUpgradeCost"));
    towerMaxHealthUpgrade.querySelector('.buy-button').classList.toggle("affordable", canAffordUpgrade("towerMaxHealthUpgradeCost"));
}

function uiSetUp() {
    towerAttackSpeedUpgrade.querySelector('.upgrade-value').textContent = `${(1000 / getGameValue("towerAttackCooldown")).toFixed(2)}s`;
    towerDamageUpgrade.querySelector('.upgrade-value').textContent = getGameValue("towerBulletDamage").toFixed(2)
    towerRegenerationUpgrade.querySelector('.upgrade-value').textContent = `${(1000 * getGameValue("towerRegeneration")).toFixed(2)}s`;
    towerMaxHealthUpgrade.querySelector('.upgrade-value').textContent = getGameValue("towerMaxHealth").toFixed(2);
}

function updateUI() {
    currencyText.textContent = `Currency: ${Math.floor(gameValues.currency)}`;
    gemsText.textContent = `Gems: ${Math.floor(gameValues.gems)}`;
    towerHealthText.textContent = `${Math.floor(towerHealth)} / ${Math.floor(getGameValue("towerMaxHealth"))}`;
    waveText.textContent = `Wave: ${wave}`;
    enemyHealthText.textContent = `Health: ${Math.floor(getGameValue("basicEnemyHealth"))}`;
    enemyDamageText.textContent = `Damage: ${Math.floor(getGameValue("basicEnemyDamage"))}`;

    towerHealthBar.style.setProperty("--width-scale", towerHealth / getGameValue("towerMaxHealth"));
    waveProgressBar.style.setProperty("--width-scale", 1 - waveStageAcimulator / WAVE_MAX_STAGE);

    updateTowerUpgradesUI();
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


// Window
window.addEventListener('resize', handleWindowResize);

// Document
document.addEventListener('visibilitychange', handleVisiblityChange);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('keydown', handleKeyDown);

// Tower Upgrades
towerUpgradesOpenClose.addEventListener('click', handleTowerUpgradesOpenCloseClick);

towerAttackSpeedUpgrade.querySelector('.buy-button').addEventListener('click', handleTowerAttackSpeedUpgradeClick);
towerDamageUpgrade.querySelector('.buy-button').addEventListener('click', handleTowerDamageUpgradeClick);
towerRegenerationUpgrade.querySelector('.buy-button').addEventListener('click', handleTowerRegenerationUpgradeClick);
towerMaxHealthUpgrade.querySelector('.buy-button').addEventListener('click', handleTowerMaxHealthUpgradeClick);


// ==========
// INITIALIZE
// ==========


handleWindowResize();
uiSetUp();

requestAnimationFrame(stepFrame);