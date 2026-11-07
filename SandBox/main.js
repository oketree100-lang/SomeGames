async function main() {
    const canvas = document.getElementById("canvas");
    const searchBox = document.getElementById("search-box");
    const optionBox = document.getElementById("option-box");
    const text = document.getElementById("text");

    const params = new URLSearchParams(window.location.search);

    const materials = await (await fetch("materials.json")).json();
    const { behaviours, setSim } = await import("./behaviours.js");

    const colors = materials.map(element => element.color);

    const dimHalfSize = params.get("halfDim") ?? 100;
    const dim = [dimHalfSize * 2, dimHalfSize];
    const pixels = Array(dim[0] * dim[1]).fill(0);
    const changedPixels = Array(dim[0] * dim[1]).fill(false);
    
    const pixelsAttr = Array.from({length: dim[0] * dim[1]}, () => ({
        temp: 0
    }))
    
    const cmds = [
        "/clear", "/tickRate", "/brush", "/filter"
    ];

    for (let i = 0; i < materials.length; i++) {
        cmds.push(materials[i].name);
    }

    let tickRate = params.get('tickRate') ?? 1;

    let maxTemp, minTemp;
    let reverse = false;
    function gameTick() {
        changedPixels.fill(false);
        
        if (reverse) {
            for (let y = 0; y < dim[1]; y++) {
                const ty = y * dim[0];
                for (let x = 0; x < dim[0]; x++) {
                    const tp = ty + x;
                    setSim(changedPixels, pixels, pixelsAttr, dim[0], dim[1], x, y)
                    behaviours[pixels[tp]]();
                }
            }
        } else {
            for (let y = dim[1] - 1; y >= 0; y--) {
                const ty = y * dim[0];
                for (let x = dim[0] - 1; x >= 0; x--) {
                    const tp = ty + x;
                    setSim(changedPixels, pixels, pixelsAttr, dim[0], dim[1], x, y);
                    behaviours[pixels[tp]]();
                }
            }
        }

        let globalTemp = 0;
        for (let i = 0; i < dim[0] * dim[1]; i++) {
            globalTemp += pixelsAttr[i].temp;
        }
        console.log(globalTemp);
        
        reverse = !reverse;
    }

    let filter = 0;
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
                        if ((pixels[tp] == 0 || pixel == 0) && !filter) {
                            pixels[tp] = pixel;
                            pixelsAttr[tp].temp = materials[pixel].temp;
                        } else if (filter == pixels[tp]) {
                            pixels[tp] = pixel;
                            pixelsAttr[tp].temp = materials[pixel].temp;
                        }
                    }
                }
            }
        }
    }

    let cmd = "";
    function processCmd() {
        if (cmd == "/clear") {
            pixels.fill(0);
            for (let i = 0; i < pixelsAttr.length; i++) {
                pixelsAttr[i] = {
                    temp: 0
                }
            }
        } else if (cmd.slice(0, 6) ==  "/brush") {
            hs = parseInt(cmd.slice(7));
        } else if (cmd.slice(0, 9) == "/tickRate") {
            tickRate = parseInt(cmd.slice(10));
        } else if (cmd.slice(0, 7) == "/filter") {
            const s = cmd.slice(8);
            if (s == "") filter = 0;
            for (let i = 0; i < materials.length; i++) {
                if (s == materials[i].name) {
                    filter = i;
                    break;
                }
            }
        } else {
            for (let i = 0; i < materials.length; i++) {
                if (cmd == materials[i].name) {
                    selectedMaterial = i;
                    break;
                }
            }
        }
    }

    let displayType = "default";
    function keyPress(e) {
        if (e.key == "Enter") {
            processCmd();
            cmd = "";
        } else if (["1", "2"].includes(e.key)) {
            const n = parseInt(e.key);

            if (n == 1) {
                displayType = "default";
            } else if (n == 2) {
                displayType = "heat";
                maxTemp = pixelsAttr[0].temp;
                minTemp = pixelsAttr[0].temp;

                for (let i = 0; i < pixels.length; i++) {
                    const temp = pixelsAttr[i].temp;

                    if (temp > maxTemp) maxTemp = temp;
                    if (temp < minTemp) minTemp = temp;
                }
            }
        } else if (e.key == "Backspace") {
            cmd = cmd.slice(0, cmd.length - 1);
            console.clear();
            console.log(cmd);
        } else if (e.key == "Escape") {
            cmd = "";
        } else if (e.key.length == 1) {
            cmd += e.key;
        }

        if (cmd.length != 0) {
            searchBox.style.visibility = "visible";
            text.textContent = cmd;
        } else {
            searchBox.style.visibility = "hidden";
        }

        optionBox.replaceChildren();

        for (let i = 0; i < cmds.length; i++) {
            const currCmd = cmds[i];

            let error = 0;

            for (let j = 0; j < Math.min(currCmd.length, cmd.length); j++) {
                if (currCmd[j] != cmd[j]) error++;
            }

            if (error < 2) {
                const element = document.createElement('button');
                element.classList.add("cmd");
                element.textContent = currCmd;

                element.addEventListener("click", (e) => {
                    for (let i = 0; i < materials.length; i++) {
                        if (materials[i].name == currCmd) {
                            mouseDown = false;
                            selectedMaterial = i;
                            cmd = "";
                            searchBox.style.visibility = "hidden";
                        }
                    }
                })

                optionBox.appendChild(element);
            }
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
            for (let x = 0; x < dim[0]; x++) {
                const tp = y * dim[0] + x;
                const rgb = colors[pixels[tp]];
                let [r, g, b] = rgb;

                const idx = tp * 4;

                if (!(r || g || b)) {
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 255;

                    continue;
                }

                if (displayType == "heat" && maxTemp != minTemp) {
                    const t = (pixelsAttr[tp].temp - minTemp) / (maxTemp - minTemp);

                    const hsvColor = new Color("hsv", [
                        240 * (1 - t),
                        100,
                        100
                    ]);

                    [r, g, b] = hsvColor.to("srgb").coords.map(c => Math.round(c * 255));
                }

                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        requestAnimationFrame(render);
    }
    render();
}
main();