class Obstacle
{
    constructor(pos)
    {
        this.pos = pos;
    }

    draw(ctx)
    {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2, true);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
    }
}