function fall(oldPixels, pixels, w, h, x, y) {
    const op = y * w + x;
    const pixel = oldPixels[op];
    const options = [];
    
    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && oldPixels[tp] == 0 && pixels[tp] == 0) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const ty = y + 1;
        const tp = ty * w + tx;

        pixels[tp] = pixel;
        pixels[op] = 0;

        return true;
    }

    return false;
}

function slide(oldPixels, pixels, w, x, y) {
    const op = y * w + x;
    const pixel = oldPixels[op];
    const options = [];

    for (let i = -1; i < 2; i += 2) {
        const tx = x + i;
        const tp = y * w + tx;
        if (tx >= 0 && tx < w && oldPixels[tp] == 0 && pixels[tp] == 0) {
            options.push(i);
        }
    }

    const l = options.length;

    if (l) {
        const offset = options[Math.floor(Math.random() * l)];
        
        const tx = x + offset;
        const tp = y * w + tx;

        pixels[tp] = pixel;
        pixels[op] = 0;

        return true;
    }
    
    return false;
}

function displace(oldPixels, pixels, w, h, x, y, validDis) {
    const op = y * w + x;
    const pixel = oldPixels[op];
    const options = [];
    const swaps = [];

    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && validDis.includes(oldPixels[tp]) && validDis.includes(pixels[tp])) {
            options.push(i);
            swaps.push(oldPixels[tp]);
        }
    }

    const l = options.length;

    if (l) {
        const i = Math.floor(Math.random() * l);
        
        const tx = x + options[i];
        const ty = y + 1;
        const tp = ty * w + tx;

        pixels[tp] = pixel;
        pixels[op] = swaps[i];

        return true;
    }

    return false;
}



export const behaviours = [
    (oldPixels, pixels, w, h, x, y) => {}, // Air
    (oldPixels, pixels, w, h, x, y) => { // Sand
        if (!fall(oldPixels, pixels, w, h, x, y)) {
            displace(oldPixels, pixels, w, h, x, y, [0, 2]);
        }
    },
    (oldPixels, pixels, w, h, x, y) => { // Water
        if (!fall(oldPixels, pixels, w, h, x, y)) {
            slide(oldPixels, pixels,    w, x, y);
        }
    }
]