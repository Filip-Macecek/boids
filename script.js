var width;
var height;
var mid;
var mousePos = null;
var VISIBILITY_SQUARED = BOID_VISIBILITY ** 2;
var MAX_SPEED_SQUARED = MAX_SPEED ** 2;

function updateBoids(boids, obstacles, tree, dt)
{
    boids.forEach(boid =>
    {
        let boidsWithinDistance = [];
        if (QUADTREE_OPTIMIZATION_ENABLED)
        {
            let halfVisibility = BOID_VISIBILITY / 2;
            let queryRect = new Rectangle(boid.pos.x - halfVisibility, boid.pos.y - halfVisibility, BOID_VISIBILITY, BOID_VISIBILITY)
            let nearbyBoids = tree.get(queryRect);
            boidsWithinDistance = nearbyBoids.filter(b => b.pos.SquareDistance(boid.pos) < VISIBILITY_SQUARED && b !== boid);
        }
        else 
        {
            boidsWithinDistance = boids.filter(b => b.pos.SquareDistance(boid.pos) < VISIBILITY_SQUARED && b !== boid);
        }
        let acceleration = new Vec2(0, 0);

        if (boidsWithinDistance.length > 0)
        {
            let sepForce = boidsWithinDistance.reduce((acc, otherBoid) => 
            {
                let posDif = boid.pos.Substract(otherBoid.pos);
                return acc.Add(posDif.Divide(posDif.SquareMagnitude()));
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
            let distance = dir.SquareMagnitude();
            if (distance < VISIBILITY_SQUARED)
            {
                let avoidAcceleration = dir.Normalize().Multiply(OBSTACLE_FORCE / distance);
                acceleration = acceleration.Add(avoidAcceleration);
            }
        }

        boid.speedSec = boid.speedSec.Add(acceleration);
        if (boid.speedSec.SquareMagnitude() > MAX_SPEED_SQUARED)
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

    if (QUADTREE_OPTIMIZATION_ENABLED)
    {
        var tree = new QuadTree(new Rectangle(0, 0, width, height), 4);
        boids.forEach(b => 
        {
            if (!tree.insert(b)) throw "Could not insert." + JSON.stringify(b);
        });
    }

    function loop() {
        let now = Date.now();
        let dt = (now - lastTime) / 1000;
        
        updateBoids(boids, obstacles, tree, dt);

        ctx.clearRect(0, 0, width, height);
        obstacles.forEach(obstacle => obstacle.draw(ctx))
        boids.forEach(boid => boid.draw(ctx));
        
        if (QUADTREE_OPTIMIZATION_ENABLED)
        {
            tree = new QuadTree(new Rectangle(0, 0, width, height), QUADTREE_CAPACITY);
            boids.forEach(b => 
            {
                if (!tree.insert(b)) {
                    console.log("Could not insert.");
                }
            });

            tree.draw(ctx);
        }

        
        let fps = Math.round(1 / dt);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${fps}`, 10, 30);

        lastTime = now;
        requestAnimationFrame(loop);
    }

    loop();
}
  
start()