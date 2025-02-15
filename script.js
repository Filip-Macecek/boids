const BOID_RADIUS = 1;
const BOID_COLOR = "#000000"
const BOID_COUNT = 100;

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

    Square() {
        return new Vec2(this.x ** 2, this.y ** 2);
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
        let a = boid.speedSec.Multiply(dt);
        let otherBoids = boids.filter(b => b !== boid);
        let sepForce = otherBoids.reduce((acc, otherBoid) => 
        {
            let posDif = otherBoid.pos.Substract(boid.pos);
            let dSquareVec = posDif.Square();
            let dSquare = dSquareVec.x + dSquareVec.y;
            let resVector = new Vec2(posDif.x / dSquare, posDif.y / dSquare);
            return acc.Add(resVector);
        }, new Vec2(0, 0));
        console.log(sepForce);

        a = a.Substract(sepForce);
        let nextPos = boid.pos.Add(a);
        // prevent going outside of border
        if (nextPos.x < 0 || nextPos.x > boid.width)
        {
            a.x = 0;
        }

        if (nextPos.y < 0 || nextPos.y > boid.height)
        {
            a.y = 0;
        }
        
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