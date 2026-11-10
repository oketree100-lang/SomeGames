// --------------------
// Fetch elements' info
// --------------------


async function fetchMaterials() {
    return await (await fetch("materials.json")).json();
}

const materials = await fetchMaterials();


// -----------------
// Element constants
// -----------------


const EMPTY = 0, SAND = 1, WATER = 2, CONCRETE = 3, MUD = 4, LAVA = 5, STONE = 6, SMOKE = 7,
      OIL = 8, FIRE = 9, STEAM = 10, STEEL = 11


// ---------------
// Group constants
// ---------------


const FLUID = [WATER, LAVA, OIL];
const GAS = [SMOKE, FIRE, STEAM]

const DISPLACE1 = [...FLUID, ...GAS];


// ---------------------------
// Global simulation variables
// ---------------------------


let pixels, pixelsAttr, w, h, x, y, op;


// -------------------
// Technical functions
// -------------------


export function setSim(_pixels, _pixelsAttr, _w, _h, _x, _y) {
    pixels = _pixels;
    pixelsAttr = _pixelsAttr;
    w = _w;
    h = _h;
    x = _x;
    y = _y;

    op = y * w + x;

    if (pixels[op]) {
        const options = [];

        for (let i = -1; i < 2; i++) {
            const ty = y + i;
            if (ty >= 0 && ty < h) {
                for (let j = -1; j < 2; j++) {
                    const tx = x + j;
                    if (tx >= 0 && tx < w) {
                        const tp = ty * w + tx;
                        if (pixels[tp]) {
                            transferHeat(op, tp);
                        }
                    }
                }
            }
        }
    }
}


function isValidAction(op, tp) {
    return !pixelsAttr[op].updated && (pixels[tp] == 0 || pixelsAttr[tp].moved);
}


function setPixel(tp, pixel) {
    pixels[tp] = pixel;

    pixelsAttr[tp].temp = materials[pixel].temp;
    pixelsAttr.updated = true;
}

function transferHeat(op, tp) {
    const oPixel = pixels[op];
    const tPixel = pixels[tp];

    const oc = materials[oPixel].conductivity;
    const tc = materials[tPixel].conductivity;

    const conductivity = oc * tc / (oc + tc) / 100;
    
    const heat = conductivity * (pixelsAttr[op].temp - pixelsAttr[tp].temp);

    pixelsAttr[op].temp -= heat;
    pixelsAttr[tp].temp += heat * 0.999;
}

function swap(tx, ty) {
    const tp = ty * w + tx;

    const oPixel = pixels[op];
    const tPixel = pixels[tp];

    const oTemp = pixelsAttr[op].temp
    const tTemp = pixelsAttr[tp].temp;

    pixels[op] = tPixel;
    pixels[tp] = oPixel;

    pixelsAttr[op].temp = tTemp;
    pixelsAttr[op].moved = true;
    pixelsAttr[tp].temp = oTemp;
    pixelsAttr[tp].updated = true;


    x = tx;
    y = ty;
}

function deletePixel(tp) {
    pixels[tp] = EMPTY;

    pixelsAttr[tp].temp = 0;
    pixelsAttr[tp].updated = false;
    pixelsAttr[tp].moved = false;
    pixelsAttr[tp].moved = false;

    return true;
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
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && pixels[tp] == 0 && isValidAction(op, tp)) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const ty = y + 1;
        
        swap(tx, ty);

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
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && pixels[tp] == 0 && isValidAction(op, tp)) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const ty = y - 1;
        
        swap(tx, ty);

        return true;
    }

    return false;
}

function slide(...ignorePixels) {
    const options = [];

    for (let i = -1; i < 2; i += 2) {
        const tx = x + i;
        const tp = y * w + tx;
        if (tx >= 0 && tx < w && ignorePixels.includes(pixels[tp]) && isValidAction(op, tp)) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        
        swap(tx, y);

        return true;
    }
    
    return false;
}

function displace(...validDis) {
    const options = [];
    const swaps = [];

    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && validDis.includes(pixels[tp]) && isValidAction(op, tp)) {
            options.push(i);
            swaps.push(pixels[tp]);
        }
    }

    const l = options.length;

    if (l) {
        const i = Math.floor(Math.random() * l);
        
        const tx = x + options[i];
        const ty = y + 1;
        
        swap(tx, ty);

        return true;
    }

    return false;
}

function fuse(fusePixel, resultPixel) {
    const options = [];

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const nx = x + j;
            const ny = y + i;
            const tp = ny * w + nx;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && pixels[tp] == fusePixel && isValidAction(op, tp)) {
                options.push(tp);
            }
        }
    }

    const l = options.length;

    if (l) {
        const tp = options[Math.floor(Math.random() * l)];

        deletePixel(tp);
        pixels[op] = resultPixel;

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
        setPixel(options[Math.floor(Math.random() * l)], pixel);

        return true;
    }
    
    return false;
}


// ------------------
// Material functions
// ------------------


function empty() {}

function sand() {
    if (fuse(WATER, MUD)) return;

    fall() || displace(...DISPLACE1);
}

function water() {
    if (pixelsAttr[y * w + x].temp >= 500) {
        setPixel(y * w + x, STEAM);
    }

    fall() || displace(...GAS, OIL) || slide(EMPTY, OIL);
}

function mud() {
    fall() || displace(...DISPLACE1);
}

function concrete() {}

function lava() {
    if (Math.random() > 0.99) create(FIRE);

    if (fuse(WATER, STONE)) {
        create(STEAM);
        return;
    }

    fall() || displace(...GAS) || slide(EMPTY);
}

function stone() {
    fall() || displace(...DISPLACE1);
}

function smoke() {
    Math.random() > 0.99 && deletePixel(y * w + x);

    rise() || slide(EMPTY);
}

function oil() {
    fall() || displace(...GAS) || slide(EMPTY, ...GAS, WATER);
    
    pixelsAttr[y * w + x].temp > 50 && create(FIRE) && (Math.random() > 0.001 || deletePixel(y * w + x));
}

function fire() {
    if (pixelsAttr[y * w + x].temp < 100) {
        // setPixel(y * w + x, SMOKE);
    }

    rise() || displace(SMOKE);

    Math.random() > 0.3 || (deletePixel(y * w + x) && (Math.random() > 0.01 || create(SMOKE)));
}

function steam() {
    const op = y * w + x;
    if (pixelsAttr[op] < 100) {
        setPixel(op, WATER);
        return;
    }

    rise() || slide(EMPTY);
}

function steel() {}


// ----------------
// Behaviours array
// ----------------


export const behaviours = [
    empty, sand, water, concrete, mud, lava, stone, smoke,
    oil, fire, steam, steel
]