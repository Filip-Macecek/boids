var width;
var height;
var mid;
var mousePos = null;

function updateBoids(boids, obstacles, dt)
{
    boids.forEach(boid =>
    {
        let boidsWithinDistance = boids.filter(b => b.pos.Distance(boid.pos) < BOID_VISIBILITY && b !== boid);
        let acceleration = new Vec2(0, 0);

        if (boidsWithinDistance.length > 0)
        {
            let sepForce = boidsWithinDistance.reduce((acc, otherBoid) => 
            {
                let posDif = boid.pos.Substract(otherBoid.pos);
                return acc.Add(posDif.Divide(posDif.Magnitude() ** 2));
            }, new Vec2(0, 0)).Multiply(SEPARATION_FACTOR);
            acceleration = acceleration.Add(sepForce.Multiply(dt));

            let otherBoidsAverageVelocity = boidsWithinDistance.reduce((acc, otherBoid) => acc.Add(otherBoid.speedSec), new Vec2(0, 0)).Divide(boidsWithinDistance.length);
            let alignmentForce = otherBoidsAverageVelocity.Substract(boid.speedSec).Multiply(VELOCITY_ALIGNMENT_FACTOR);
            acceleration = acceleration.Add(alignmentForce.Multiply(dt));

            let otherBoidsAveragePos = boidsWithinDistance.reduce((acc, otherBoid) => acc.Add(otherBoid.pos), new Vec2(0, 0)).Divide(boidsWithinDistance.length);
            let cohesionForce = otherBoidsAveragePos.Substract(boid.pos).Multiply(COHESION_FACTOR);
            acceleration = acceleration.Add(cohesionForce.Multiply(dt));
        }

        obstacles.filter(o => o.pos.Distance(boid.pos) < BOID_VISIBILITY).forEach(obstacle => 
        {
            let distance = obstacle.pos.Distance(boid.pos);
            let gravityForce = OBSTACLE_FORCE / (distance ** 2);
            let direction = obstacle.pos.Substract(boid.pos).Normalize();
            let gravityAcceleration = direction.Multiply(gravityForce).Multiply(dt);
            acceleration = acceleration.Substract(gravityAcceleration);
        })

        if (boid.pos.x < WALL_MARGIN || boid.pos.x > (width - WALL_MARGIN))
        {
            let fromWall = boid.pos.x < WALL_MARGIN ? new Vec2(1, 0) : new Vec2(-1, 0);
            let fromWallDistance = boid.pos.x < WALL_MARGIN ? boid.pos.x : width - boid.pos.x;
            const fromWallAccel = fromWall.Multiply(OBSTACLE_FORCE).Divide(fromWallDistance ** 2);
            acceleration = acceleration.Add(fromWallAccel.Multiply(dt))
        }

        if (boid.pos.y < WALL_MARGIN || boid.pos.y > (height - WALL_MARGIN))
        {
            let fromWall = boid.pos.y < WALL_MARGIN ? new Vec2(0, 1) : new Vec2(0, -1);
            let fromWallDistance = boid.pos.y < WALL_MARGIN ? boid.pos.y : height - boid.pos.y;
            const fromWallAccel = fromWall.Multiply(OBSTACLE_FORCE).Divide(fromWallDistance ** 2);
            acceleration = acceleration.Add(fromWallAccel.Multiply(dt))
        }

        if (mousePos != null)
        {
            let dir = boid.pos.Substract(mousePos);
            let distance = dir.Magnitude();
            if (distance < BOID_VISIBILITY)
            {
                let avoidAcceleration = dir.Normalize().Multiply(OBSTACLE_FORCE / (distance ** 2));
                acceleration = acceleration.Add(avoidAcceleration);
            }
        }


        boid.speedSec = boid.speedSec.Add(acceleration);
        if (boid.speedSec.Magnitude() > MAX_SPEED)
        {
            boid.speedSec = boid.speedSec.Normalize().Multiply(MAX_SPEED);
        }
        boid.pos = boid.pos.Add(boid.speedSec.Multiply(dt));

        if (boid.pos.x < -WALL_MARGIN || boid.pos.x > (width + WALL_MARGIN) || boid.pos.y < -WALL_MARGIN || boid.pos.y > (height + WALL_MARGIN))
        {
            boid.pos = new Vec2(Math.random() * width, Math.random() * height);
        }
    });
}

function start() {
    let canvas = document.getElementById('canvas');
    width = canvas.width;
    height = canvas.height;

    let canvasElem = document.querySelector("canvas");

    let rect = canvas.getBoundingClientRect();
    canvasElem.addEventListener("mouseenter", function (e) 
    {
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        mousePos = new Vec2(x, y);
    }); 
    canvasElem.addEventListener("mousemove", function (e)
    {
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        mousePos = new Vec2(x, y);
    }); 
    canvasElem.addEventListener("mouseleave", function (e) 
    {
        mousePos = null;
    }); 

    mid = new Vec2(width / 2, height / 2);
    let ctx = canvas.getContext('2d');
    
    let boids = [];
    for (let i = 0; i < BOID_COUNT; i++)
    {
        let pos = new Vec2(Math.random() * width, Math.random() * height);
        let speed = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1);
        speed = speed.Multiply(Math.random() * MAX_SPEED + 200);
        let boid = new Boid(pos, speed, width, height);
        
        boids.push(boid);
    }

    let obstacles = [];
    for (let i = 0; i < OBSTACLE_COUNT; i++)
    {
        obstacles.push(new Obstacle(new Vec2(Math.random() * width, Math.random() * height)));
    }

    let lastTime = Date.now();

    function loop() {
        let now = Date.now();
        let dt = (now - lastTime) / 1000;
        
        updateBoids(boids, obstacles, dt, ctx);

        ctx.clearRect(0, 0, width, height);
        obstacles.forEach(obstacle => obstacle.draw(ctx))
        boids.forEach(boid => boid.draw(ctx));

        lastTime = now;
        requestAnimationFrame(loop);
    }

    loop();
}
  
start()