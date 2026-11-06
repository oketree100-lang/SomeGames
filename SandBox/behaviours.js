function fall(pixels, w, h, x, y) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];
    
    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && pixels[tp] == 0) {
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

function slide(pixels, w, x, y) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];

    for (let i = -1; i < 2; i += 2) {
        const tx = x + i;
        const tp = y * w + tx;
        if (tx >= 0 && tx < w && pixels[tp] == 0) {
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

function displace(pixels, w, h, x, y, validDis) {
    const op = y * w + x;
    const pixel = pixels[op];
    const options = [];
    const swaps = [];

    for (let i = -1; i < 2; i++) {
        const tx = x + i;
        const ty = y + 1;
        const tp = ty * w + tx;
        if (tx >= 0 && tx < w && ty >= 0 && ty < h && validDis.includes(pixels[tp])) {
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

        pixels[tp] = pixel;
        pixels[op] = swaps[i];

        return true;
    }

    return false;
}

function fuze(pixels, w, h, x, y, fuzePixel, resultPixel) {
    const xOptions = [];
    const yOptions = [];

    for (let y = -1; y < 2; y += 2) {
        const ty = y * w;
        for (let x = -1; x < 2; x += 2) {
            if (pixels[0]) {}
        }
    }
}



export const behaviours = [
    (pixels, w, h, x, y) => {}, // Air
    (pixels, w, h, x, y) => { // Sand
        if (!fall(pixels, w, h, x, y)) {
            displace(pixels, w, h, x, y, [0, 2]);
        }
    },
    (pixels, w, h, x, y) => { // Water
        if (!fall(pixels, w, h, x, y)) {
            slide(pixels, w, x, y);
        }
    },
    (pixels, w, h, x, y) => {}, // Concrete
]