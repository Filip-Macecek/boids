const BOID_RADIUS = 1;
const BOID_COLOR = "#000000"
const BOID_COUNT = 90;
const BOID_SEPARATION_DISTANCE = 100;

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

            if (dSquare < BOID_SEPARATION_DISTANCE)
            {
                return acc.Add(resVector);
            }
            else {
                return acc;
            }
        }, new Vec2(0, 0));

        a = a.Substract(sepForce);
        boid.pos = boid.pos.Add(a);

        // prevent going outside of border
        if (boid.pos.x < 0 || boid.pos.x > boid.width)
        {
            a.x *= -1;
            boid.pos = boid.pos.Add(a);
            boid.speedSec.x *= -1;
        }

        if (boid.pos.y < 0 || boid.pos.y > boid.height)
        {
            a.y *= -1;
            boid.pos = boid.pos.Add(a);
            boid.speedSec.y *= -1;
        }
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
        
        // console.log(dt);
        updateBoids(boids, dt)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        boids.forEach(boid => boid.draw(ctx));

        lastTime = now;
        requestAnimationFrame(loop);
    }

    loop();
}
  
start()