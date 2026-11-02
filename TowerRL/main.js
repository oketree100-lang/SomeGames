const canvas = document.getElementById("canvas");

let width;
let cWidth;
let height;
let cHeight;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    width = 1728;
    height = 972;
    
    cWidth = rect.width;
    cHeight = rect.height;

    canvas.width = width;
    canvas.height = height;
}

// document.addEventListener("resize", resizeCanvas);
resizeCanvas();

const bullets = [];

document.addEventListener("mousedown", (e) => {
    if (e.button == 0) {
        const bullet = {
            x : (width - towerSize) * 0.5,
            y : (height - towerSize) * 0.5,
            angle : angle
        }

        bullets.push(bullet);
    }
})

let angle = 0;
const mouse = {x : 0, y : 0};

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (width / cWidth),
    mouse.y = (e.clientY - rect.top) * (height / cHeight)

    angle = 3.14 + Math.atan2((height - towerSize) * 0.5 - mouse.y, (width - towerSize) * 0.5 - mouse.x);
})

const ctx = canvas.getContext("2d");

const towerSize = 70;
const bulletSize = 20;
const bulletSpeed = 14;

const enemies = [];

function enemyLoop() {
    const enemy =  {
        x : Math.round(Math.random()) * (width + 200) - 100,
        y : Math.round(Math.random()) * (height + 200) - 100,
    }
}

enemyLoop();

function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];

        bullet.x += Math.cos(bullet.angle) * bulletSpeed;
        bullet.y += Math.sin(bullet.angle) * bulletSpeed;

        ctx.fillStyle = "#000000";
        
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.angle);
        ctx.fillRect(-bulletSize * 0.5, -bulletSize * 0.5, bulletSize, bulletSize);
        ctx.restore();
    }

    ctx.fillStyle = "#d4ba23";

    ctx.save();
    ctx.translate((width - towerSize) * 0.5, (height - towerSize) * 0.5);
    ctx.rotate(angle);
    ctx.fillRect(-towerSize * 0.5, -towerSize * 0.5, towerSize, towerSize);
    ctx.restore();

    requestAnimationFrame(render);
}

render();