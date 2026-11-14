const canvas = document.getElementById("canvas");

let width, height, ctx, squareSize;

function resize(e) {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    canvas.width = width;
    canvas.height = height;

    squareSize = width / 17;
    ctx = canvas.getContext("2d");
}

window.addEventListener("resize", resize)
resize()

const keys = {
    "w": "North",
    "a": "West",
    "s": "South",
    "d": "East",
    "ArrowUp": "North",
    "ArrowLeft": "West",
    "ArrowDown": "South",
    "ArrowRight": "East"
}
const opp = {
    "North": "South",
    "South": "North",
    "East": "West",
    "West": "East"
}

const snake = [[3, 8], [2, 8]];
let dir = "East";
let movingDir = "East";
let lastMove = Date.now();
let extra = 2;
let moved = false;

let apple = [Math.floor(Math.random() * 10 + 6), Math.floor(Math.random() * 10) + 6];

let state = false;

function move() {
    lastMove = Date.now();

    if (extra <= 0) {
        snake.pop();
    }

    const newPos = [snake[0][0], snake[0][1]];

    if (movingDir == "East") {
        newPos[0] += 1;
    } else if (movingDir == "West") {
        newPos[0] -= 1;
    } else if (movingDir == "North") {
        newPos[1] -= 1;
    } else if (movingDir == "South") {
        newPos[1] += 1;
    }

    snake.splice(0, 0, newPos);

    if (extra > 0) {
        extra--;
    }
    moved = false;
    movingDir = dir;

    if (snake[0][0] < 0 || snake[0][0] > 16 || snake[0][1] < 0 || snake[0][1] > 16) {
        loss();
        return;
    }

    const seen = new Set();

    for (let i = 0; i < snake.length; i++) {
        const pos = snake[i];
        if (seen.has(pos.toString())) {
            loss();
            return
        }

        seen.add(pos.toString());
    }

    if (snake[0].toString() == apple.toString()) {
        extra++;

        let cond = true;

        while (cond) {
            cond = false;

            apple = [Math.floor(Math.random() * 17), Math.floor(Math.random() * 17)];

            for (let i = 0; i < snake.length; i++) {
                if (snake[i].toString() == apple.toString()) {
                    cond = true;
                    break;
                }
            }
        }
    }

    setTimeout(move, 200);
}

function loss() {
    const l = snake.length;
    for (let i = 0; i < l; i++) {
        snake.pop();
    }
    snake.push([3, 8]);
    snake.push([2, 8]);
    
    state = false;
    lastMove = Date.now();
    dir = "East";
    movingDir = "East";
    extra = 2;
}

document.addEventListener("keydown", (e) => {
    if (e.key in keys) {
        if (!state) {
            setTimeout(move, 200);
            lastMove = Date.now();
            state = true;
            movingDir = keys[e.key];
        }
        
        const newDir = keys[e.key];
        if (opp[newDir] !== movingDir) {
            dir = newDir;
            moved = true;
        }
    }
})

function render() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#df3434";
    ctx.fillRect(apple[0] * squareSize, apple[1] * squareSize, squareSize + 1, squareSize + 1);

    for (let i = 0; i < snake.length - 1; i++) {
        const pos = snake[i];

        const d = i / (snake.length + 1);
        
        const r = Math.floor(45 * (1 - d) + 2 * d);
        const g = Math.floor(119 * (1 - d) + 57 * d);
        const b = Math.floor(230 * (1 - d) + 139 * d);

        ctx.fillStyle = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

        ctx.fillRect(pos[0] * squareSize, pos[1] * squareSize, squareSize + 1, squareSize + 1);
    }

    let dx = 0;
    let dy = 0;

    let dt = Date.now() - lastMove;
    if (!state) {
        dt = 0;
    }

    const tail = snake[snake.length - 1];
    const pos = snake[snake.length - 2];

    dx = pos[0] - tail[0];
    dy = pos[1] - tail[1];

    ctx.fillRect(tail[0] * squareSize + dt * dx * squareSize / 200, tail[1] * squareSize + dt * dy * squareSize / 200, squareSize + 1, squareSize + 1);

    dx = 0;
    dy = 0;

    if (movingDir == "East") {
        dx = 1;
    } else if (movingDir == "North") {
        dy = -1;
    } else if (movingDir == "West") {
        dx = -1;
    } else if (movingDir == "South") {
        dy = 1;
    }
    
    const head = snake[0];

    ctx.fillStyle = "#2d77e6";
    ctx.fillRect(head[0] * squareSize + dt * dx * squareSize / 200, head[1] * squareSize + dt * dy * squareSize / 200, squareSize + 1, squareSize + 1);

    requestAnimationFrame(render);
}

render()