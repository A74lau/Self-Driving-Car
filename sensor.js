class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI/2;

        //store individual rays
        this.rays = [];

        //store ray readings
        this.readings = [];
    }

    update(roadBorders,traffic) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push (
                this.#getReading(this.rays[i],roadBorders,traffic)
            );
        }
    }

    #getReading(ray,roadBorders,traffic) {

        //store touched object coordinates
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );

            //if an object is touched then push it to the touch array
            if(touch) {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;

            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0) {
            return null;
        } else {
            //offsets is a new array which takes the offset of each element in the touches array
            const offsets = touches.map(e=>e.offset);

            //we want to take the nearest object intersection
                //"..." operator seperates array values into individual values
                //we use this because Math.min does not accept array inputs
            const minOffset = Math.min(...offsets);

            //iterates thorugh the touches array to find the offset of each touch element
                //if the element offset is equal to the minimum offset it will return the touch element
            return touches.find(e=>e.offset==minOffset);
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            //user linear interpolation to space out the rays
            const rayAngle = linear(
                this.raySpread/2,
                -this.raySpread/2,

                //for the condition that there is 1 ray
                this.rayCount == 1?0.5:i/(this.rayCount-1)
            ) + this.car.angle;

            //create a start and end point for the rays
            const start = {x:this.car.x, y:this.car.y};
            const end = {
                //use a unit circle to set degrees for the rays
                x:this.car.x - Math.sin(rayAngle)*this.rayLength,
                y:this.car.y - Math.cos(rayAngle)*this.rayLength 
            };
            this.rays.push([start,end]);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if(this.readings[i]) {
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";

            //rays start location
            ctx.moveTo (
                this.rays[i][0].x,
                this.rays[i][0].y
            );

            //rays end location
            ctx.lineTo (
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            //rays start location
            ctx.moveTo (
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            //rays end location
            ctx.lineTo (
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}