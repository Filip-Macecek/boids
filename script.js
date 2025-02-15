const BOID_RADIUS = 1;
const BOID_COLOR = "#000000"
const BOID_COUNT = 300;

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }

    Multiply(n)
    {
        return new Vec2(this.x * n, this.y * n);
    }
}

class Boid {
    constructor(pos, speed, width, height)
    {
        this.pos = pos;
        this.speedSec = speed;
        this.width = width;
        this.height = height;
    }

    update(dt)
    {
    }

    draw(ctx)
    {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, BOID_RADIUS, 0, Math.PI * 2, true);
        ctx.fillStyle = BOID_COLOR;
        ctx.fill();
        ctx.closePath();
    }
}

function getRandomVec2(width, height) {
    return new Vec2(Math.random() * width, Math.random() * height);
}

function getRandomVec2NegativeAlso(x, y) {
    return new Vec2((Math.random() * x * 2) - x, (Math.random() * y * 2) - y);
}

function updateBoids(boids, dt)
{
    boids.forEach(boid =>
    {
        let nextPos = boid.pos.Add(boid.speedSec.Multiply(dt));

        if (nextPos.x < 0 || nextPos.x > boid.width)
        {
            boid.speedSec.x = boid.speedSec.x * -1;
        }

        if (nextPos.y < 0 || nextPos.y > boid.width)
        {
            boid.speedSec.y = boid.speedSec.y * -1;
        }

        let a = boid.speedSec.Multiply(dt);
        boid.pos = boid.pos.Add(a);
    });
}

function start() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    var boids = [];
    for (var i = 0; i < BOID_COUNT; i++)
    {
        var pos = getRandomVec2(width, height);
        var speed = getRandomVec2NegativeAlso(20, 20)
        var boid = new Boid(pos, speed, width, height);
        boids.push(boid);
    }

    var lastTime = Date.now();
    function loop() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000;
        
        console.log(dt);
        updateBoids(boids, dt)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        boids.forEach(boid => boid.draw(ctx));

        lastTime = now;
        requestAnimationFrame(loop);
    }

    loop();
}
  
start()