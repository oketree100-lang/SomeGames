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

            result.head = sum.slice(0, 10);
            result.exp = Math.max(a.exp, b.exp) + lSum - 10;

            return result;
        }
    }

    static sub(a, b) {
        const magDiff = a.exp - b.exp;

        if (magDiff > 10) {
            return a.copy;
        } else if (magDiff < -10) {
            return new BigNumber("0");
        } else {
            const result = new BigNumber("");

            const l1 = Math.min(a.head.length, 10);
            const l2 = Math.min(b.head.length, 10);

            const h1 = parseInt(a.head + "0".repeat(10 - l1));
            const h2 = Math.floor(parseInt(b.head + "0".repeat(10 - l2)) * Math.pow(0.1, magDiff));

            const sum = String(h1 - h2);
            const lSum = sum.length;

            result.head = sum.slice(0, 10);
            result.exp = Math.max(a.exp, b.exp) + lSum - 10;

            return result;
        }
    }

    static mult(a, b) {
        const result = new BigNumber("");

        const h1 = parseFloat(a.head) * Math.pow(0.1, a.head.length - 1);
        const h2 = parseFloat(b.head) * Math.pow(0.1, b.head.length - 1);

        const prod = String(h1 * h2);

        result.head = prod.replace(".", "").slice(0, 10) + "0".repeat(Math.max(10 - prod.length, 0));
        result.exp = a.exp + b.exp + prod.split(".")[0].length - 1;

        return result;
    }

    static div(a, b) {
        const result = new BigNumber("");

        const h1 = parseFloat(a.head) * Math.pow(0.1, a.head.length - 1);
        const h2 = parseFloat(b.head) * Math.pow(0.1, b.head.length - 1);

        const d = String(h1 / h2);

        result.head = d.replace(".", "").slice(0, 10) + "0".repeat(Math.max(10 - d.length, 0));
        result.exp = a.exp - b.exp + d.split(".")[0].length - 1;

        return result;
    }

    static pow(a, b) {
        if (BigNumber.equals(b, new BigNumber("0"))) return new BigNumber("1");

        const result = new BigNumber("");

        const logA = Math.log10(a);
        const fLogAExp = Math.floor(Math.log10(logA));
        const bigLogA = new BigNumber("");
        
        bigLogA.head = String(Math.floor(logA * Math.pow(10, 9 - fLogAExp)));
        bigLogA.exp = fLogAExp;

        const multLogAB = BigNumber.mult(bigLogA, b);
        const f = multLogAB.floor();
        result.exp = (f == "") ? 0 : parseInt(f);
        
        const fractionPart = multLogAB.frac();
        
        result.head = String(Math.pow(10, fractionPart)).replace(".", "").slice(0, 10);

        return result;
    }

    static greaterThan(a, b) {
        const magDiff = a.exp - b.exp;

        if (magDiff > 0) {
            return true;
        } else if (magDiff < 0) {
            return false;
        } else {
            return parseInt(a.head) > parseInt(b.head);
        }
    }

    static smallerThan(a, b) {
        return this.greaterThan(b, a);
    }

    static equals(a, b) {
        return a.head == b.head && a.exp == b.exp;
    }

    static convertNumber(n) {
        if (n == 0) return new BigNumber("0");

        const result = new BigNumber("");
        
        result.head = String(n).slice(0, 10);
        result.exp = Math.floor(Math.log10(n));

        return result;
    }
    static max(a, b) {
        return BigNumber.greaterThan(a, b) ? a : b;
    }

    static min(a, b) {
        return BigNumber.smallerThan(a, b) ? a : b;
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

            result.head = sum.slice(0, 10);
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

            result.head = sum.slice(0, 10);
            result.exp = Math.max(this.exp, other.exp) + lSum - 10;

            return result;
        }
    }

    isPositive() {
        return this.exp >= 0;
    }

    floor() {
        if (this.exp > 10) {
            return parseInt(this.head);
        } else if (this.exp < 0) {
            return 0
        } else {
            return this.head.slice(0, this.exp + 1);
        }
    }

    frac() {
        if (this.exp > 10) {
            return 0;
        } else {
            const n = parseInt(this.head);
            return n * Math.pow(10, this.exp - Math.floor(Math.log10(n)));
        }
    }

    toInt() {
        return Math.floor(parseInt(this.head) * Math.pow(10, this.exp));
    }

    toFloat() {
        return parseInt(this.head) * Math.pow(10, this.exp - this.head.length + 1);
    }

    toString() {
        const names = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sed", "Spd", "Od", "Nd", "Vg"];
        const rem = this.exp % 3;
        const first = this.head.slice(0, rem + 1);
        const second = this.head.slice(rem + 1, 3);

        return first + (second.length == 0 ? "" : ".") + second + (names[Math.floor(this.exp / 3)] ?? `e${this.exp}`);
    }
}