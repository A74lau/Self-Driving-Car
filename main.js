const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2,carCanvas.width*0.9);

const N = 1;
const cars= generateCars(N);

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        
        if(i != 0) {
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}


//obstacle set up
const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),50,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-520,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-800,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-800,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-1000,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-1100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-1200,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-1250,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-1400,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-1400,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-1500,30,50,"DUMMY",2),

];

animate();

//save the cars that perform well
function save() {
    //serializing the brain of the best cars into local storage
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

//discard stored brain
function discard() {
    localStorage.removeItem("bestBrain");
}

//parallelization so that we can run multiple AI cars simultaneously
function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI",3))
    }
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders,[]);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders,traffic);
    }

    //we want to follow the "best" car which has the lowest y value (goes the furthest)
    bestCar = cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    );

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx,"red");
    }

    //set the transparency value of the drawing
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx,"blue");
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx,"blue",true);

    carCtx.restore();

    networkCtx.lineDashOffset = time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}