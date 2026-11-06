function fall(changedPixels, pixels, w, h, x, y) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];
    
    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && pixels[tp] == 0 && !changedPixels[tp] && !changedPixels[op]) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const ty = y + 1;
        const tp = ty * w + tx;

        changedPixels[tp] = true;
        pixels[tp] = pixel;
        pixels[op] = 0;
        changedPixels[op] = true;

        x = tx;
        y = ty;

        return true;
    }

    return false;
}

function slide(changedPixels, pixels, w, x, y) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];

    for (let i = -1; i < 2; i += 2) {
        const tx = x + i;
        const tp = y * w + tx;
        if (tx >= 0 && tx < w && pixels[tp] == 0 && !changedPixels[tp] && !changedPixels[op]) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const tp = y * w + tx;

        changedPixels[tp] = true;
        pixels[tp] = pixel;
        pixels[op] = 0;
        changedPixels[op] = true;

        x = tx;

        return true;
    }
    
    return false;
}

function displace(changedPixels, pixels, w, h, x, y, validDis) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];
    const swaps = [];

    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && validDis.includes(pixels[tp]) && !changedPixels[tp] && !changedPixels[op]) {
            options.push(i);
            swaps.push(pixels[tp]);
        }
    }

    const l = options.length;

    if (l) {
        const i = Math.floor(Math.random() * l);
        
        const tx = x + options[i];
        const ty = y + 1;
        const tp = ty * w + tx;

        changedPixels[tp] = true;
        pixels[tp] = pixel;
        pixels[op] = swaps[i];
        changedPixels[op] = true;

        x = tx;
        y = ty;

        return true;
    }

    return false;
}

function fuze(changedPixels, pixels, w, h, x, y, fuzePixel, resultPixel) {
    const op = y * w + x;
    const options = [];

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const nx = x + j;
            const ny = y + i;
            const tp = ny * w + nx;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && pixels[tp] == fuzePixel && !changedPixels[tp] && !changedPixels[op]) {
                options.push(tp);
            }
        }
    }

    const l = options.length;

    if (l) {
        const tp = options[Math.floor(Math.random() * l)];

        changedPixels[tp] = true;
        pixels[tp] = 0;
        pixels[op] = resultPixel;
        changedPixels[op] = true;

        return true;
    }

    return false;
}



export const behaviours = [
    (changedPixels, pixels, w, h, x, y) => {}, // Air
    (changedPixels, pixels, w, h, x, y) => { // Sand
        if (fuze(changedPixels, pixels, w, h, x, y, 2, 4)) return;

        let cond = fall(changedPixels, pixels, w, h, x, y);

        if (!cond) {
            cond = displace(changedPixels, pixels, w, h, x, y, [0, 2]);
        }
    },
    (changedPixels, pixels, w, h, x, y) => { // Water
        if (!fall(changedPixels, pixels, w, h, x, y)) {
            slide(changedPixels, pixels, w, x, y);
        }
    },
    (changedPixels, pixels, w, h, x, y) => {}, // Concrete
    (changedPixels, pixels, w, h, x, y) => {
        if (!fall(changedPixels, pixels, w, h, x, y)) {
            displace(changedPixels, pixels, w, h, x, y, [0, 2]);
        }
    }
]