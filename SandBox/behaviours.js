// ---------------------------
// Global simulation variables
// ---------------------------


let changedPixels, pixels, pixelsAttr, w, h, x, y, op;


// -----------------
// Element constants
// -----------------


const EMPTY = 0, SAND = 1, WATER = 2, CONCRETE = 3, MUD = 4, LAVA = 5, STONE = 6, SMOKE = 7,
      OIL = 8


// ---------------
// Group constants
// ---------------


const FLUID = [WATER, LAVA, OIL];
const GAS = [SMOKE]

const DISPLACE1 = [...FLUID, ...GAS];


// -------------------
// Technical functions
// -------------------


export function setSim(_changedPixels, _pixels, _pixelsAttr, _w, _h, _x, _y) {
    changedPixels = _changedPixels;
    pixels = _pixels;
    pixelsAttr = _pixelsAttr;
    w = _w;
    h = _h;
    x = _x;
    y = _y;

    op = y * w + x;
}

function swap(tx, ty) {
    const tp = ty * w + tx;

    const oPixel = pixels[op];
    const tPixel = pixels[tp];

    const oTemp = pixels

    changedPixels[op] = true;
    changedPixels[tp] = true;

    pixels[op] = tPixel;
    pixels[tp] = oPixel;
}


// ----------------
// Physical actions
// ----------------


function fall() {
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

function rise() {
    const pixel = pixels[op];
    const options = [];
    
    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y - 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && pixels[tp] == 0 && !changedPixels[tp] && !changedPixels[op]) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const ty = y - 1;
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

function slide() {
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

function displace(...validDis) {
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

function fuze(fuzePixel, resultPixel) {
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

function create(pixel) {
    const options = [];

    for (let i = -1; i < 2; i++) {
        const ty = y + i;
        if (ty >= 0 && ty < h) {
            for (let j = -1; j < 2; j++) {
                const tx = x + j;
                if (tx >= 0 && tx < w) {
                    const tp = ty * w + tx;
                    if (pixels[tp] == 0) {
                        options.push(tp);
                    }
                }
            }
        }
    }

    const l = options.length;

    if (l) {
        pixels[options[Math.floor(Math.random() * l)]] = pixel;

        return true;
    }
    
    return false;
}


// ------------------
// Material functions
// ------------------


function empty() {}

function sand() {
    if (fuze(WATER, MUD)) return;

    fall() || displace(...DISPLACE1);
}

function water() {
    const c = fall() || displace(...GAS, OIL) || slide();
}

function mud() {
    fall() || displace(...DISPLACE1);
}

function concrete() {}

function lava() {
    if (Math.random() > 0.999) create(SMOKE);

    if (fuze(WATER, STONE)) {
        create(SMOKE);
        return;
    }

    fall() || displace(...GAS) || slide();
}

function stone() {
    fall() || displace(...DISPLACE1);
}

function smoke() {
    if (Math.random() > 0.999) {
        pixels[y * w + x] = 0;
        return;
    }

    rise() || slide();
}

function oil() {
    fall() || displace(...GAS) || slide();
}


// ----------------
// Behaviours array
// ----------------


export const behaviours = [
    empty, sand, water, concrete, mud, lava, stone, smoke,
    oil
]