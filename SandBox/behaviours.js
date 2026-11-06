// -----------------
// Element constants
// -----------------

const EMPTY = 0, SAND = 1, WATER = 2, CONCRETE = 3, MUD = 4, LAVA = 5, STONE = 6


// ---------------
// Group constants
// ---------------


const FLUID = [EMPTY, WATER, LAVA];


// ----------------
// Physical actions
// ----------------

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


// ------------------
// Material functions
// ------------------

function empty(changedPixels, pixels, w, h, x, y) {}

function sand(changedPixels, pixels, w, h, x, y) {
    if (fuze(changedPixels, pixels, w, h, x, y, WATER, MUD)) return;

    let cond = fall(changedPixels, pixels, w, h, x, y);

    if (!cond) {
        cond = displace(changedPixels, pixels, w, h, x, y, FLUID);
    }
}

function water(changedPixels, pixels, w, h, x, y) {
    if (!fall(changedPixels, pixels, w, h, x, y)) {
        slide(changedPixels, pixels, w, x, y);
    }
}

function mud(changedPixels, pixels, w, h, x, y) {
    if (!fall(changedPixels, pixels, w, h, x, y)) {
        displace(changedPixels, pixels, w, h, x, y, FLUID);
    }
}

function concrete(changedPixels, pixels, w, h, x, y) {}

function lava(changedPixels, pixels, w, h, x, y) {
    if (fuze(changedPixels, pixels, w, h, x, y, WATER, STONE)) return;

    if (!fall(changedPixels, pixels, w, h, x, y)) {
        slide(changedPixels, pixels, w, x, y);
    }
}

function stone(changedPixels, pixels, w, h, x, y) {
    if (!fall(changedPixels, pixels, w, h, x, y)) {
        displace(changedPixels, pixels, w, h, x, y, FLUID);
    }
}

export const behaviours = [
    empty, sand, water, concrete, mud, lava, stone
]