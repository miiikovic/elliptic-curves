"use strict";
const CURVE = {
    P: 2n ** 256n - 2n ** 32n - 977n,
    n: 2n ** 256n - 432420386565659656852420866394968145599n,
};
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // Adds point to itself. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    double() {
        const X1 = this.x;
        const Y1 = this.y;
        const lam = mod(3n * X1 ** 2n * invert(2n * Y1, CURVE.P));
        const X3 = mod(lam * lam - 2n * X1);
        const Y3 = mod(lam * (X1 - X3) - Y1);
        return new Point(X3, Y3);
    }
    // Adds point to other point. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    add(other) {
        const [a, b] = [this, other];
        const [X1, Y1, X2, Y2] = [a.x, a.y, b.x, b.y];
        if (X1 === 0n || Y1 === 0n)
            return b;
        if (X2 === 0n || Y2 === 0n)
            return a;
        if (X1 === X2 && Y1 === Y2)
            return this.double();
        if (X1 === X2 && Y1 === -Y2)
            return Point.ZERO;
        const lam = mod((Y2 - Y1) * invert(X2 - X1, CURVE.P));
        const X3 = mod(lam * lam - X1 - X2);
        const Y3 = mod(lam * (X1 - X3) - Y1);
        return new Point(X3, Y3);
    }
}
Point.ZERO = new Point(0n, 0n); // Point at infinity aka identity point aka zero
function mod(a, b = CURVE.P) {
    const result = a % b;
    return result >= 0 ? result : b + result;
}
// Inverses number over modulo
function invert(number, modulo = CURVE.P) {
    if (number === 0n || modulo <= 0n) {
        throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
    }
    // Eucledian GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
    let a = mod(number, modulo);
    let b = modulo;
    let x = 0n, y = 1n, u = 1n, v = 0n;
    while (a !== 0n) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }
    const gcd = b;
    if (gcd !== 1n)
        throw new Error('invert: does not exist');
    return mod(x, modulo);
}
// Example: Add two random points
const pointA = new Point(5n, 1n);
const pointB = new Point(7n, 8n);
const sumAB = pointA.add(pointB);
console.log('Sum of A and B:', sumAB);
// Example: Point doubling
const pointC = new Point(5n, 1n);
const pointCDoubled = pointC.double();
console.log('Point doubling: ', pointCDoubled);
// Example: Multiply a point by a scalar
const scalar = 3n;
const multipliedPoint = pointA.double().add(pointA).add(pointA); // Equivalent to 3 * pointA
console.log('Multiplication of A by 3:', multipliedPoint);
