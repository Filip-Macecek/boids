class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }

    Substract(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }

    Multiply(n)
    {
        return new Vec2(this.x * n, this.y * n);
    }

    Divide(n)
    {
        if (n === 0)
        {
            throw Error("Division by zero.");
        }
        return new Vec2(this.x / n, this.y / n);
    }

    SquareDistance(vec)
    {
        return (this.x - vec.x) ** 2 + (this.y - vec.y) ** 2;
    }

    Normalize()
    {
        let length = Math.sqrt(this.x ** 2 + this.y ** 2);
        if (length === 0) {
            return new Vec2(0, 0);
        }
        return new Vec2(this.x / length, this.y / length);
    }

    Dot(otherVec)
    {
        return this.x*otherVec.x + this.y*otherVec.y;
    }

    SquareMagnitude() 
    {
        return this.x ** 2 + this.y ** 2;
    }
}