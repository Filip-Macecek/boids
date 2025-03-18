class Rectangle {
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vertices = [
            new Vec2(this.x, this.y),
            new Vec2(this.x + this.width, this.y),
            new Vec2(this.x, this.y + this.height),
            new Vec2(this.x + this.width, this.y + this.height)
        ];
    }

    contains(position)
    {
        return position.x >= this.x &&
            position.x <= this.x + this.width &&
            position.y >= this.y &&
            position.y <= this.y + this.height;
    }

    collides(other)
    {
        let vertices = this.vertices.concat(other.vertices);
        let xs = vertices.map(v => v.x);
        let boundingMinX = Math.min(... xs);
        let boundingMaxX = Math.max(... xs);
        let ys = vertices.map(v => v.y);
        let boundingMinY = Math.min(... ys);
        let boundingMaxY = Math.max(... ys);

        return (boundingMaxX - boundingMinX) <= (this.width + other.width) &&
            (boundingMaxY - boundingMinY) <= (this.height + other.height);
    }

    draw(ctx, color)
    {
        ctx.strokeStyle = color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}