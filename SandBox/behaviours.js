export const behaviours = [
    (oldPixels, pixels, changedPixels, w, h, x, y) => {}, // Air
    (oldPixels, pixels, changedPixels, w, h, x, y) => { // Sand
        const op = y * w + x;
        const pixel = 1;
        const options = [];

        for (let i = -1; i < 2; i++) {
            const tx = x + i;
            const ty = y + 1;
            const tp = ty * w + tx;
            if (tx >= 0 && tx < w && ty >= 0 && ty < h && oldPixels[tp] == 0 && changedPixels[tp] == 0) {
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
            changedPixels[tp] = pixel;
        }
    },
    (oldPixels, pixels, changedPixels, w, h, x, y) => { // Water
        const op = y * w + x;
        const pixel = 2;
        const options = [];

        for (let i = -1; i < 2; i++) {
            const tx = x + i;
            const ty = y + 1;
            const tp = ty * w + tx;
            if (tx >= 0 && tx < w && ty >= 0 && ty < h && oldPixels[tp] == 0 && changedPixels[tp] == 0) {
                options.push(i);
            }
        }

        const l1 = options.length;

        if (l1) {
            const offset = options[Math.floor(Math.random() * l1)];
            
            const tx = x + offset;
            const ty = y + 1;
            const tp = ty * w + tx;

            pixels[tp] = pixel;
            pixels[op] = 0;
            changedPixels[tp] = pixel;
        } else {
            for (let i = -1; i < 2; i += 2) {
                const tx = x + i;
                const tp = y * w + tx;
                if (tx >= 0 && tx < w && oldPixels[tp] == 0 && changedPixels[tp] == 0) {
                    options.push(i);
                }
            }

            const l2 = options.length;

            if (l2) {
                const offset = options[Math.floor(Math.random() * l2)];
                
                const tx = x + offset;
                const tp = y * w + tx;

                pixels[tp] = pixel;
                pixels[op] = 0;
                changedPixels[tp] = pixel;
            }
        }
    }
]