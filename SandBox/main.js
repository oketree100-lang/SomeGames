async function main() {
    const canvas = document.getElementById("canvas");

    const params = new URLSearchParams(window.location.search);

    const materials = await (await fetch("materials.json")).json();
    const { behaviours } = await import("./behaviours.js");

    const colors = materials.map(element => element.color);

    const tickRate = params.get('tickRate') ?? 1;
    const dimHalfSize = params.get("halfDim") ?? 100;
    const dim = [dimHalfSize * 2, dimHalfSize];
    const pixels = Array(dim[0] * dim[1]).fill(0);

    function gameTick() {
        const oldPixels = [...pixels];
        const changedPixels = Array(dim[0] * dim[1]).fill(0);
        
        for (let y = 0; y < dim[1]; y++) {
            for (let x = 0; x < dim[0]; x++) {
                const pixel = oldPixels[y * dim[0] + x];
                
                if (pixel != 0) {
                    behaviours[pixel](oldPixels, pixels, changedPixels, dim[0], dim[1], x, y);
                }
            }
        }
    }

    let selectedMaterial = 2;
    function placePixel(e) {
        if (mouseDown) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.trunc((mouse[0] - rect.left) / boxSize);
            const y = Math.trunc((mouse[1] - rect.top) / boxSize);

            const hs = 10;
            for (let ny = y - hs; ny < y + hs; ny++) {
                for (let nx = x - hs; nx < x + hs; nx++) {
                    if (nx >= 0 && nx < dim[0] && ny >= 0 && ny < dim[1]) {
                        pixels[ny * dim[0] + nx] = selectedMaterial;
                    }
                }
            }
        }
    }

    const mouse = [0, 0];
    document.addEventListener("mousemove", (e) => {
        mouse[0] = e.clientX;
        mouse[1] = e.clientY;
    })

    mouseDown = false;
    document.addEventListener("mousedown", (e) => {
        mouseDown = true;
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

        placePixel();

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

        requestAnimationFrame(render);
    }
    render();
}
main();