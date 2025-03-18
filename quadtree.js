class QuadTree {
    constructor(rect, capacity)
    {
        this.rect = rect;
        this.boids = [];
        this.capacity = capacity;
    }

    divide()
    {
        if (this.quadrants != null)
        {
            return;
        }

        let qWidth = this.rect.width / 2;
        let qHeight = this.rect.height / 2;
        this.q1 = new QuadTree(new Rectangle(this.rect.x, this.rect.y, qWidth, qHeight), this.capacity);
        this.q2 = new QuadTree(new Rectangle(this.rect.x + qWidth, this.rect.y, qWidth, qHeight), this.capacity);
        this.q3 = new QuadTree(new Rectangle(this.rect.x, this.rect.y + qHeight, qWidth, qHeight), this.capacity);
        this.q4 = new QuadTree(new Rectangle(this.rect.x + qWidth, this.rect.y + qHeight, qWidth, qHeight), this.capacity);
        this.quadrants = [this.q1, this.q2, this.q3, this.q4];
    }

    insert(boid)
    {
        if (!this.rect.contains(boid.pos))
        {
            return false;
        }
        
        if (this.boids.length === this.capacity)
        {
            this.divide();
            return this.q1.insert(boid) ||
                this.q2.insert(boid) ||
                this.q3.insert(boid) ||
                this.q4.insert(boid);
        }
        else {
            this.boids.push(boid);
            return true;
        }
    }

    draw(ctx)
    {
        if (!DEBUG)
        {
            return;
        }

        this.rect.draw(ctx, "white");

        if (this.quadrants)
        {
            this.quadrants.forEach(q => q.draw(ctx));
        }
    }

    get(rect)
    {
        if (!this.rect.collides(rect))
        {
            return [];
        }

        if (this.quadrants)
        {
            let q1boids = this.q1.get(rect);
            let q2boids = this.q2.get(rect);
            let q3boids = this.q3.get(rect);
            let q4boids = this.q4.get(rect);
            return this.boids.concat(q1boids, q2boids, q3boids, q4boids);
        }
        return this.boids;
    }
}