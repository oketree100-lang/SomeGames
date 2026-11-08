const canvas = document.getElementById("canvas");

canvas.width = 600;
canvas.height = 911;

const width = 600;
const height = 911;

const ctx = canvas.getContext("2d");

function jump() {
    if (ready) {
        state = true;
        ready = false;
        score = 0;
        pollTimeout = setTimeout(addPoll, 1000);
    }
    if (state) {
        bird.v = -8;
    }
}

canvas.addEventListener("click", (e) => {
    jump();
})
document.addEventListener("keydown", (e) => {
    if (e.key == " " || e.key == "ArrowUp") {
        jump();
    }
})

let bird = {
    y : 400,
    v : 0,
    x : 0
}

let state = false;
let ready = true;
let score = 0;

let polls = [];
let pollTimeout;

function resetGame() {
    bird.y = 400;
    bird.v = 0;
    bird.x = 0;

    polls = [];

    ready = true;
}

let lastTime = Date.now();

function render() {
    const currentTime = Date.now();
    const dt = currentTime - lastTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#8b6107"
    ctx.fillRect(-(bird.x % 600), height - 150, 300, 150);
    ctx.fillRect(600 - (bird.x % 600), height - 150, 300, 150);

    ctx.fillStyle = "#5f4409"
    ctx.fillRect(300 - (bird.x % 600), height - 150, 300, 150);
    ctx.fillRect(900 - (bird.x % 600), height - 150, 300, 150);

    ctx.fillStyle = "#3d9627"
    ctx.fillRect(0, height - 150, 600, 25);

    if (state || !ready) {
        bird.v += 0.03 * dt;
        bird.y += bird.v * dt / 17;
    }
    if (state) {
        bird.x += dt / 17;
    }

    for (let i = 0; i < polls.length; i++) {
        const poll = polls[i];

        if (state) {
            poll.x -= 3;
        }

        ctx.fillStyle = "#2b6e0c";
        ctx.fillRect(poll.x, poll.y, 100, 1000);
        ctx.fillRect(poll.x, 0, 100, Math.max(0, poll.y - 200));

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(poll.x, poll.y, 100, 1000);
        ctx.strokeRect(poll.x, -10, 100, Math.max(0, poll.y - 200) + 10);

        if (poll.x < -100) {
            polls = polls.filter(item => item !== poll);
            score += 1;
            i--;
        }

        if ((((bird.y < poll.y - 175 || bird.y > poll.y - 25) && poll.x > 50 && poll.x < 200) || (bird.y < 0 || bird.y > height)) && state ) {
            state = false;
            ready = false;
            clearTimeout(pollTimeout);
            setTimeout(resetGame, 2000);
        }
    }

    ctx.fillStyle = "#e0d85e";
    ctx.save();
    ctx.translate(175, bird.y);
    ctx.rotate(Math.tanh(bird.v / 8) / 2);
    ctx.fillRect(-25, -25, 50, 50);
    ctx.restore();

    let offset = 30;

    if (score != 0) {
        offset += Math.floor(Math.log10(score)) * 30;
    }

    ctx.font = "bold 60px Arial"

    ctx.fillStyle = "#ffffff";
    ctx.fillText(score, 300 - offset, 100);
    

    lastTime = currentTime;
    requestAnimationFrame(render);
}

function addPoll() {
    polls.push({
        x : 600,
        y : height - Math.random() * height * 0.5 - 200
    })

    pollTimeout = setTimeout(addPoll, Math.random() * 1000 + 1500);
}

render();