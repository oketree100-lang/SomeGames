export default class BigNumber {
    constructor(value) {
        const formattedValue = value.replaceAll(",", "");

        this.exp = formattedValue.length - 1;
        this.head = formattedValue.slice(0, 1) + formattedValue.slice(1, 10);
    }

    static add(a, b) {
        const magDiff = a.exp - b.exp;

        if (magDiff > 10) {
            return a.copy;
        } else if (magDiff < -10) {
            return b.copy;
        } else {
            const result = new BigNumber("");

            const l1 = a.head.length;
            const l2 = b.head.length;

            const h1 = parseInt(a.head + "0".repeat(10 - l1));
            const h2 = Math.floor(parseInt(b.head + "0".repeat(10 - l2)) * Math.pow(0.1, magDiff));

            const sum = String(h1 + h2);
            const lSum = sum.length;

            result.head = sum.slice(0, 11);
            result.exp = Math.max(a.exp, b.exp) + lSum - 10;

            return result;
        }
    }

    static sub(a, b) {
        const magDiff = a.exp - b.exp;

        if (magDiff > 10) {
            return a.copy;
        } else if (magDiff < -10) {
            return BigNumber("0");
        } else {
            const result = new BigNumber("");

            const l1 = a.head.length;
            const l2 = b.head.length;

            const h1 = parseInt(a.head + "0".repeat(10 - l1));
            const h2 = Math.floor(parseInt(b.head + "0".repeat(10 - l2)) * Math.pow(0.1, magDiff));

            const sum = String(h1 - h2);
            const lSum = sum.length;

            result.head = sum.slice(0, 11);
            result.exp = Math.max(a.exp, b.exp) + lSum - 10;

            return result;
        }
    }

    static mult(a, b) {
        const result = new BigNumber("");

        const h1 = parseFloat(a.head) * Math.pow(0.1, a.head.length - 1);
        const h2 = parseFloat(b.head) * Math.pow(0.1, b.head.length - 1);

        const prod = String(h1 * h2);

        result.head = prod.replace(".", "").slice(0, 11) + "0".repeat(Math.max(10 - prod.length, 0));
        result.exp = a.exp + b.exp + prod.split(".")[0].length - 1;

        return result;
    }

    static pow(a, b) {
        const result = new BigNumber("");

        const logA = Math.log10(a);
        const bigLogA = new BigNumber("");
        
        bigLogA.head = String(logA).split(".")[1].slice(0, 11);
        bigLogA.exp = Math.floor(Math.log10(logA));

        const multLogAB = BigNumber.mult(bigLogA, b);
        result.exp = parseFloat(multLogAB.floor());
        console.log(multLogAB.floor());

        const fractionPart = multLogAB.frac();

        result.head = String(Math.pow(10, parseFloat(multLogAB.frac()) * Math.pow(0.1, fractionPart.length))).replace(".", "");

        return result;
    }

    get copy() {
        const result = new BigNumber("0");
        result.exp = this.exp;
        result.head = this.head;

        return result;
    }

    add(other) {
        const magDiff = this.exp - other.exp;

        if (magDiff > 10) {
            return this.copy;
        } else if (magDiff < -10) {
            return other.copy;
        } else {
            const result = new BigNumber("");

            const l1 = this.head.length;
            const l2 = other.head.length;

            const h1 = parseInt(this.head + "0".repeat(10 - l1));
            const h2 = Math.floor(parseInt(other.head + "0".repeat(10 - l2)) * Math.pow(0.1, magDiff));

            const sum = String(h1 + h2);
            const lSum = sum.length;

            result.head = sum.slice(0, 11);
            result.exp = Math.max(this.exp, other.exp) + lSum - 10;

            return result;
        }
    }

    sub(other) {
        const magDiff = this.exp - other.exp;

        if (magDiff > 10) {
            return this.copy;
        } else if (magDiff < 0) {
            return new BigNumber("0");
        } else {
            const result = new BigNumber("");

            const l1 = this.head.length;
            const l2 = other.head.length;

            const h1 = parseInt(this.head + "0".repeat(10 - l1));
            const h2 = Math.floor(parseInt(other.head + "0".repeat(10 - l2)) * Math.pow(0.1, magDiff));

            const sum = String(h1 - h2);
            const lSum = sum.length;

            result.head = sum.slice(0, 11);
            result.exp = Math.max(this.exp, other.exp) + lSum - 10;

            return result;
        }
    }

    floor() {
        if (this.exp > 10) {
            return this.head;
        } else {
            return this.head.slice(0, this.exp + 1);
        }
    }

    frac() {
        if (this.exp > 10) {
            return "";
        } else {
            return this.head.slice(this.exp + 1);
        }
    }

    toString() {
        const names = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sed", "Spd", "Od", "Nd", "Vg"];
        const rem = this.exp % 3;
        const first = this.head.slice(0, rem + 1);
        const second = this.head.slice(rem + 1, 3);

        return first + (second.length == 0 ? "" : ".") + second + (names[Math.floor(this.exp / 3)] ?? `e${this.exp}`);
    }
}