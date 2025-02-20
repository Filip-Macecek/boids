class Boid 
{
    constructor(pos, speed)
    {
        this.pos = pos;
        this.speedSec = speed;
    }

    update(dt)
    {
    }

    draw(ctx)
    {
        let angle = Math.atan2(this.speedSec.y, this.speedSec.x) + (Math.PI / 2);
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -BOID_RADIUS * 2);
        ctx.lineTo(-BOID_RADIUS, BOID_RADIUS * 2);
        ctx.lineTo(BOID_RADIUS, BOID_RADIUS * 2);
        ctx.closePath();
        ctx.fillStyle = BOID_COLOR;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2, true);
        ctx.fillStyle = "RED";
        ctx.fill();
        ctx.closePath();
    }
}