const BOID_RADIUS = 5;
const BOID_COLOR = "#000000"
const BOID_COUNT = 200;
const SPEED_SCALE = 1;
var BOID_NEARBY_RADIUS = 120;
var SEPARATION_FACTOR = 1000;
var VELOCITY_ALIGNMENT_FACTOR = 1.2;
var COHESION_FACTOR = 12;
var MAX_SPEED = 100;
var GRAVITY = 250000;

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

    Distance(vec)
    {
        return Math.sqrt((this.x - vec.x) ** 2 + (this.y - vec.y) ** 2);
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

    Magnitude() 
    {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
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

        let x = Math.round(this.pos.x);
        let y = Math.round(this.pos.y);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, true);
        ctx.fillStyle = "RED";
        ctx.fill();
        ctx.closePath();
    }
}

function getRandomVec2(width, height) {
    return new Vec2(Math.random() * width, Math.random() * height);
}

function getRandomVec2NegativeAlso(x, y) {
    return new Vec2((Math.random() * x * SPEED_SCALE * 2) - x, (Math.random() * y * SPEED_SCALE * 2) - y);
}

var mid = new Vec2(1280 / 2, 720 / 2);
function getInitialSpeed(pos) {
    let boidToMidDir = mid
        .Substract(pos)
        .Normalize();

    // tangential speed
    let clockwiseToMid = new Vec2(-boidToMidDir.x, boidToMidDir.y);
    
    let distanceFromMid = mid.Distance(pos);
    let tangentialSpeed = Math.sqrt(GRAVITY / distanceFromMid);
    let initialSpeed = clockwiseToMid.Multiply(tangentialSpeed);
    // console.log(initialSpeed);
    return initialSpeed;
}

function updateBoids(boids, dt, ctx)
{
    if (dt === 0)
    {
        console.log("DELTA TIME IS ZERO.");
        return;
    } 

    boids.forEach(boid =>
    {
        let otherBoids = boids.filter(b => b !== boid);
        let sepForce = new Vec2(0, 0);
        let alignmentForce = new Vec2(0, 0);
        let cohesionForce = new Vec2(0, 0);
        let boidsWithinDistance = otherBoids.filter(b => b.pos.Distance(boid.pos) < BOID_NEARBY_RADIUS);
        if (boidsWithinDistance.length > 0)
        {
            sepForce = boidsWithinDistance.reduce((acc, otherBoid) => 
            {
                let posDif = otherBoid.pos.Substract(boid.pos);
                return acc.Add(posDif.Divide(posDif.Magnitude() ** 2));
            }, new Vec2(0, 0)).Multiply(SEPARATION_FACTOR);

            let otherBoidsAverageVelocity = boidsWithinDistance.reduce((acc, otherBoid) => acc.Add(otherBoid.speedSec), new Vec2(0, 0)).Divide(boidsWithinDistance.length);
            alignmentForce = otherBoidsAverageVelocity.Substract(boid.speedSec).Multiply(VELOCITY_ALIGNMENT_FACTOR);

            let otherBoidsAveragePos = boidsWithinDistance.reduce((acc, otherBoid) => acc.Add(otherBoid.pos), new Vec2(0, 0)).Divide(boidsWithinDistance.length);
            cohesionForce = otherBoidsAveragePos.Substract(boid.pos).Multiply(COHESION_FACTOR);
        }

        let a = new Vec2(0, 0);
        a = a.Substract(sepForce.Multiply(dt));
        a = a.Add(alignmentForce.Multiply(dt));
        a = a.Add(cohesionForce.Multiply(dt));

        let distanceFromMid = mid.Distance(boid.pos);
        let boidToMidDir = mid
            .Substract(boid.pos)
            .Normalize();
        let g = GRAVITY / (distanceFromMid ** 2);
        let gravityAcceleration = boidToMidDir.Multiply(g).Multiply(dt);
        boid.speedSec = boid.speedSec.Substract(gravityAcceleration).Add(a);
        if (boid.speedSec.Magnitude() > MAX_SPEED)
        {
            boid.speedSec = boid.speedSec.Normalize().Multiply(MAX_SPEED);
        }

        // if (distanceFromMid < 10)
        // {
        //     let drift = g * 250;
        //     boid.speedSec = boid.speedSec.Substract(boidToMidDir.Multiply(drift).Multiply(dt));
        // }
        
        // prevent going outside of border
        const margin = 50;
        const fromWallConst = 150000;
        if (boid.pos.x < margin || boid.pos.x > (boid.width - margin))
        {
            let fromWall = boid.pos.x < margin ? new Vec2(1, 0) : new Vec2(-1, 0);
            let fromWallDistance = boid.pos.x < margin ? boid.pos.x : boid.width - boid.pos.x;
            const fromWallAccel = fromWall.Multiply(fromWallConst).Divide(fromWallDistance ** 2);
            boid.speedSec = boid.speedSec.Add(fromWallAccel.Multiply(dt))
        }

        if (boid.pos.y < margin || boid.pos.y > (boid.height - margin))
        {
            let fromWall = boid.pos.y < margin ? new Vec2(0, 1) : new Vec2(0, -1);
            let fromWallDistance = boid.pos.y < margin ? boid.pos.y : boid.height - boid.pos.y;
            const fromWallAccel = fromWall.Multiply(fromWallConst).Divide(fromWallDistance ** 2);
            console.log(fromWallAccel);
            boid.speedSec = boid.speedSec.Add(fromWallAccel.Multiply(dt))
        }

        boid.pos = boid.pos.Add(boid.speedSec.Multiply(dt));

        ctx.beginPath();
        ctx.moveTo(boid.pos.x, boid.pos.y);
        ctx.lineTo(boid.pos.x + gravityAcceleration.x * 100, boid.pos.y + gravityAcceleration.y * 100);
        ctx.strokeStyle = "orange";
        ctx.stroke();
        ctx.closePath();
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
        // var speed = getRandomVec2NegativeAlso(10, 10)
        // var boid = new Boid(pos, speed, width, height);

        // var pos = new Vec2((width / 9) * 4, (height / 9) * 4);
        var speed = getInitialSpeed(pos);
        var boid = new Boid(pos, speed, width, height);
        
        boids.push(boid);
    }

    var lastTime = Date.now();

    function loop() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000;
        
        // console.log(dt);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        updateBoids(boids, dt, ctx);

        boids.forEach(boid => boid.draw(ctx));
        let x = Math.round(mid.x);
        let y = Math.round(mid.y);
        ctx.beginPath();
        ctx.arc(x, y, BOID_RADIUS, 0, Math.PI * 2, true);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
        ctx.closePath();

        lastTime = now;
        requestAnimationFrame(loop);
    }

    // setInterval(loop, 100);

    loop();
}
  
start()