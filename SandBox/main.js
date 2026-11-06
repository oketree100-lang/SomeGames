async function main() {
    const canvas = document.getElementById("canvas");
    const textBox = document.getElementById("text-box");

    const params = new URLSearchParams(window.location.search);

    const materials = await (await fetch("materials.json")).json();
    const { behaviours } = await import("./behaviours.js");

    const colors = materials.map(element => element.color);

    const tickRate = params.get('tickRate') ?? 1;
    const dimHalfSize = params.get("halfDim") ?? 100;
    const dim = [dimHalfSize * 2, dimHalfSize];
    const pixels = Array(dim[0] * dim[1]).fill(0);
    const flaggedPixels = Array(dim[0] * dim[1]).fill(false);
    const changedPixels = Array(dim[0] * dim[1]).fill(0);

    function gameTick() {
        const oldPixels = [...pixels];
        const oldFlaggedPixels = [...flaggedPixels];
        changedPixels.fill(0);
        flaggedPixels.fill(0);
        
        for (let y = 0; y < dim[1]; y++) {
            const ty = y * dim[0];
            for (let x = 0; x < dim[0]; x++) {
                const tp = ty + x;
                const pixel = oldPixels[tp];
                
                if (oldFlaggedPixels[tp]) {
                    behaviours[pixel](oldPixels, pixels, dim[0], dim[1], x, y);
                }
            }
        }

        for (let y = 0; y < dim[1]; y++) {
            const ty = y * dim[0];
            for (let x = 0; x < dim[0]; x++) {
                const tp = ty + x;
                
                if (pixels[tp] != 0 || changedPixels[tp] != 0) {
                    flaggedPixels[tp] = true;
                }
            }
        }
    }

    let selectedMaterial = 2;
    let hs = 3;
    function placePixel(pixel) {
        if (mouseDown) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.trunc((mouse[0] - rect.left) / boxSize);
            const y = Math.trunc((mouse[1] - rect.top) / boxSize);

            for (let ny = y - hs; ny < y + hs; ny++) {
                const ty = ny * dim[0];
                for (let nx = x - hs; nx < x + hs; nx++) {
                    if (nx >= 0 && nx < dim[0] && ny >= 0 && ny < dim[1]) {
                        const tp = ty + nx;
                        if (pixels[tp] == 0 || pixel == 0) {
                            pixels[tp] = pixel;
                            flaggedPixels[tp] = true;
                        }
                    }
                }
            }
        }
    }

    let cmd = "";
    function processCmd() {
        if (cmd.slice(0, 3) == "elm") {
            // selectedMaterial = parseInt(cmd.slice(4, cmd.length));
            for (let i = 0; i < materials.length; i++) {
                if (cmd.slice(4, cmd.length) == materials[i].name) {
                    selectedMaterial = i;
                    break;
                }
            }
        } else if (cmd == "clear") {
            pixels.fill(0);
        } else if (cmd.slice(0, 5) ==  "brush") {
            hs = parseInt(cmd.slice(6, cmd.length));
        }
    }

    function keyPress(e) {
        if (e.key == "Enter") {
            processCmd();
            cmd = "";
        } else if (e.key == "Backspace") {
            cmd = cmd.slice(0, cmd.length - 1);
            console.clear();
            console.log(cmd);
        } else if (e.key == "Escape") {
            cmd = "";
        } else if (e.key.length == 1) {
            cmd += e.key;
            console.clear();
            console.log(cmd);
        }

        if (cmd.length != 0) {
            textBox.style.visibility = "visible";
        } else {
            textBox.style.visibility = "hidden";
        }
    }
    document.addEventListener("keydown", keyPress);

    const mouse = [0, 0];
    document.addEventListener("mousemove", (e) => {
        mouse[0] = e.clientX;
        mouse[1] = e.clientY;
    })

    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    })

    document.addEventListener("wheel", (e) => {
        hs -= e.deltaY * 0.01;
        if (hs < 1) hs = 1;
    })

    let mouseDown = false;
    let mouseButton;
    document.addEventListener("mousedown", (e) => {
        mouseDown = true;
        mouseButton = e.button;
    })

    document.addEventListener("mouseup", (e) => {
        mouseDown = false;
    })

    let width, height, ctx, boxSize;

    function resize(e) {
        const rect = canvas.getBoundingClientRect();

        width = Math.trunc(rect.width * 0.5) * 2;
        height = rect.height;

        canvas.width = dim[0];
        canvas.height = dim[1];

        boxSize = width / dim[0];
        ctx = canvas.getContext("2d");
    }
    resize()

    window.addEventListener("resize", resize);

    const imageData = ctx.createImageData(dim[0], dim[1]);
    const data = imageData.data;

    let time = Date.now();
    let lastTick = time;
    function render() {
        const currTime = Date.now();
        time = currTime;

        if (currTime - lastTick > tickRate) {
            gameTick();
            lastTick = currTime;
        }

        if (mouseButton == 0) {
            placePixel(selectedMaterial);
        } else if (mouseButton == 2) {
            placePixel(0);
        }

        for (let y = 0; y < dim[1]; y++) {
            const startY = y;
            const endY = y + 1;

            for (let x = 0; x < dim[0]; x++) {
                const rgb = colors[pixels[y * dim[0] + x]];
                const r =  rgb[0];
                const g = rgb[1];
                const b = rgb[2];

                for (let py = startY; py < endY; py++) {
                    for (let px = x; px < x + 1; px++) {
                        const idx = (py * dim[0] + px) * 4;

                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = 255;
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        const textCtx = textBox.getContext("2d");
        textBox.font = "bold 1000px Arial";
        textCtx.fillText(cmd, 0, 0);

        requestAnimationFrame(render);
    }
    render();
}
main();