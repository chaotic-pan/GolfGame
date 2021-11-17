/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 7,  Dienstag, 23. November 2021, 00:00
 */

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Scale "Maßstab"
let M= (16.7/25.5)*canvasWidth/5;
// ratio to convert the centimeter of the printed picture to the given Scale
let ratio = 5/16.7;
// Coordinates transformation cartesian<->internal
let iO=[22.5*ratio, 9*ratio];
// Coordinates collection of Playground
let G = [
    // Start point
    [-2.5, -1.4],   // 0
    [-2.5, 0],      // 1
    //Hill
    [3.5, 0],       // 2
    [6.5, 1.5],     // 3
    [9.5, 0],       // 4
    // Water Hole
    [11.2, 0],      // 5
    [11.4, -.8],    // 6
    [13, -.8],      // 7
    [13.2, 0],      // 8
    //Hole
    [16.3, 0],      // 9
    [16.3, -.8],    // 10
    [16.9,-.8],     // 11
    [16.9,0],       // 12
    //Sand Hill
    [19,0],         // 13
    [22, 2.9],      // 14
    [22,-1.4],      // 15
];

let P = [
    G[1],           // 0
    G[2],           // 1
    G[3],           // 2
    G[4],           // 3
    G[5],           // 4
        //Water
    G[8],           // 5
    G[9],           // 6
        //Hole
    G[12],          // 7
    G[13],          // 8
    G[14],          // 9
];

let tries=0;
let hits=0;

let ballDiameter = .16;
let ballCenter = (ballDiameter/2)/ratio;
let ballPos = [0,0];
// frameRate (cannot be called "frameRate" cause apparently the internal function is already called that)
let frRate = 50;
let timeScale = 1;
// delta time
let dt = timeScale/frRate;
// starting velocity
let v0= 2.3/ratio;
    // <=2.4 rolls back
    // <= 3.3 Water
        // exact: 3.1-3.3
    // <= 3.85 Goal
        // exact: 3.85
    // >= 3.9 Sand
// current velocity
let v;
//let tau = 0.5/(6 * Math.PI * 17.1*Math.pow(10,-6) * ballDiameter/2/ratio);
let v0X; let v0Y; let vY;
// angles of the playground
let beta = [Math.atan((P[1][1]-P[0][1])/(P[1][0]-P[0][0])),   // 0 Plane
            Math.atan((P[2][1]-P[1][1])/(P[2][0]-P[1][0])),   // 1 Grass Slope
            Math.atan((P[9][1]-P[8][1])/(P[9][0]-P[8][0]))];  // 2 Sand Slope
// indicator for beta array
let i;
// gravitational constant on earth
let g = 9.81;
// g'
let g1;
let sign = 1;
// Coefficient of rolling friction [Grass, Sand]
let cR = [.2, .3];

//state machine
let states = {
    OFF: "off",
    PLANE: "grade Ebene",
    SLOPE: "schiefe Ebene",
    THROW: "schräger Wurf"

};
// current state
let state = states.OFF;

let skyColor = '#dcebff';
let grassColor = '#18c918';
let dirtColor = '#f5aa42';
let sandColor = '#fff61f';
let waterColor = '#9696ff';
let red = '#e34132';
let green = '#35e332';

/* here are program-essentials to put */
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(frRate);
    let buttonBack;
    buttonBack = createButton('Roll Back');
    buttonBack.position(x(6.25), y(-2));
    buttonBack.size(2*ratio*M, ratio*M);
    buttonBack.style('font-size', '25px');
    buttonBack.style('color', '#FFFFFF');
    buttonBack.style('background-color', waterColor);
    buttonBack.mousePressed(backB);
    let buttonWater;
    buttonWater = createButton('Hit Water');
    buttonWater.position(x(9.25), y(-2));
    buttonWater.size(2*ratio*M, ratio*M);
    buttonWater.style('font-size', '25px');
    buttonWater.style('color', '#FFFFFF');
    buttonWater.style('background-color', waterColor);
    buttonWater.mousePressed(waterB);
    let buttonGoal;
    buttonGoal = createButton('Hit Goal');
    buttonGoal.position(x(12.25), y(-2));
    buttonGoal.size(2*ratio*M, ratio*M);
    buttonGoal.style('font-size', '25px');
    buttonGoal.style('color', '#FFFFFF');
    buttonGoal.style('background-color', waterColor);
    buttonGoal.mousePressed(goalB);
    let buttonSand;
    buttonSand = createButton('Hit Sand');
    buttonSand.position(x(15.25), y(-2));
    buttonSand.size(2*ratio*M, ratio*M);
    buttonSand.style('font-size', '25px');
    buttonSand.style('color', '#FFFFFF');
    buttonSand.style('background-color', waterColor);
    buttonSand.mousePressed(sandB);
}

/* here is the dynamic part to put */
function draw() {

    /* administrative work */
    clear();

    //game canvas / sky
    stroke(0);
    strokeWeight(1);
    fill(skyColor);
    beginShape();
    vertex(x(22), y(7));
    vertex(x(-2.5), y(7));
    vertex(x(-2.5), y(-1.4));
    vertex(x(22), y(-1.4));
    endShape(CLOSE);

    drawBG();

    // headline
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(ratio * M);
    fill(grassColor);
    text("The ultimate Golf-Game", x(9.75), y(8));

    // headline
    textAlign(LEFT, BOTTOM);
    strokeWeight(0);
    textSize(0.4 * ratio * M);
    fill(50);
    text("Tries: "+tries, x(22), y(7.1));
    textAlign(RIGHT, BOTTOM);
    text("Hits: "+hits, x(-2.5), y(7.1));

    // buttons
    stroke(0);
    strokeWeight(1);
    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    fill(green);
    rect(x(.5), y(-2), 3 * ratio * M, ratio * M);
    textAlign(CENTER);

    fill(red);
    rect(x(22), y(-2), 3 * ratio * M, ratio * M);
    textAlign(CENTER);

    fill(255);
    strokeWeight(0);
    textSize(0.5 * ratio * M);
    text("NEW", x(-1), y(-2.5));
    text("RESET", x(20.5), y(-2.5));
    if (mouseIsPressed) {
        if (mouseX >= x(22) && mouseX <= x(19) &&
            mouseY >= y(-2) && mouseY <= y(-3)) {
            resetB();
        }
        if (mouseX >= x(.5) && mouseX <= x(-3.5) &&
            mouseY >= y(-2) && mouseY <= y(-3)) {
            newB();
        }
    }

    /* calculations */

    stateChanging: {
        // reached foot of first slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > P[1][0]) {
            ballPos[0] = P[1][0];
            stateChance(states.SLOPE);
            break stateChanging;
        }
        // ball rolled back down slope --> PLANE
        if (state !== states.OFF && state !== states.PLANE &&
            ballPos[0] < P[1][0] && ballPos[0] > P[0][0]) {
            ballPos[1] = P[1][1];
            stateChance(states.PLANE);
            break stateChanging;
        }
        // reached end of game canvas --> OFF
        if (ballPos[0] < P[0][0]+2*ballCenter) {
            ballPos =  [P[0][0]+2*ballCenter, P[0][1]];
            stateChance(states.OFF);
            break stateChanging;
        }
        // when up the first slope --> THROW
        if (state===states.SLOPE && ballPos[0]>=P[2][0]) {
            //ballPos=P[2].slice();
            stateChance(states.THROW);
            break stateChanging;
        }
    }

    if (ballPos[1] < 0) {
        if (state !== states.OFF)
            stateChance(states.OFF);
        // hit Water
        if (ballPos[0]>=P[4][0] && ballPos[0]<=P[5][0] ) {
            ballPos = [12.47,-0.8];
            console.log(ballPos)
        }
        // hit goal
        else if (ballPos[0]>=P[6][0] && ballPos[0]<=P[7][0] ) {
            // so hits gets only increased once
            if (JSON.stringify(ballPos) !== "[16.87,-0.8]")
                hits++;
            ballPos = [16.87,-0.8];


        }
        // there's a mistake somewhere
        else {
            fill(red);
            stroke(255);
            strokeWeight(1);
            textSize(0.5 * ratio * M);
            text("Oopsie!", x(ballPos[0]-ballCenter), y(ballPos[1]+3*ballCenter));
        }
    }


    running: if (i != null) {
        // temporary implementation of the throw (w/o resistance)
        if (state===states.THROW) {
            ballPos[0] = ballPos[0] + v0X * dt;
            vY = vY -g*dt;
            ballPos[1] = ballPos[1] + vY * dt;
        }
        // actual running w/ resistance
        else {
            v = v + g1*dt;
            if (v <= 0 && sign===1) {
                // not yet on slope
                if (state === states.SLOPE) {
                    // rolling downhill
                    sign = -1;
                } else {
                    // stopping
                    v=0;
                    stateChance(states.OFF);
                    break running;
                }
            }
            if (v >= 0 && sign===-1) {
                // stopping after rolling slope back down
                v=0;
                stateChance(states.OFF);
                break running;
            }
            //console.log(v);
            /*if (state===states.THROW) {
                // vY = vY -(g-1/tau*vY)*dt;
                // ballPos[1] = ballPos[1] - vY*dt;
                ballPos[0] = ballPos[0] + v0X * dt;
                vY = vY -g*dt;
                ballPos[1] = ballPos[1] + vY * dt;
            } else {*/
                ballPos[0] = ballPos[0] + v*dt;
                ballPos[1] = ballPos[1] + v*Math.sin(beta[i]) * dt;
           // }

        }
    }

    /* display */

    // Golf club
    stroke(0);
    strokeWeight(1);
    fill(0);
    rectMode(CORNER);
    rect(x((-2*ballCenter)), y(4), .03*M, 4*ratio*M);

    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(240);
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]-ballCenter), y(ballPos[1]+ballCenter), ballDiameter*M);

    // coordinate system origin
    stroke(255,0,0);
    strokeWeight(2);
    line(x(-.25),y(0),x(.25),y(0));
    line(x(0),y(-.25),x(0),y(.25));
}

function x(coord){
    return (-coord*ratio+iO[0])*M;
}

function y(coord){
    return (-coord*ratio+iO[1])*M;
}

function resetB(){
    stateChance(states.OFF);
    ballPos = [0,0];
    tries=0;
    hits=0;
}

function newB(){
    // wtf JS???? lemme just compare a goddamn array
    if (JSON.stringify(ballPos) === "[0,0]") {
        tries++;
        sign = 1;
        v = v0;
        stateChance(states.PLANE);
    }
}

function backB() {
    if (JSON.stringify(ballPos) === "[0,0]") {
        v0 = 2 / ratio;
        newB();
    }
}

function waterB() {
    if (JSON.stringify(ballPos) === "[0,0]") {
        v0 = 3.2 / ratio;
        newB();
    }
}

function goalB() {
    if (JSON.stringify(ballPos) === "[0,0]") {
        v0 = 3.85 / ratio;
        newB();
    }
}

function sandB() {
    if (JSON.stringify(ballPos) === "[0,0]") {
        v0 = 4.5 / ratio;
        newB();
    }
}

function stateChance(st) {
    switch (st) {
        case states.OFF: {
            state = states.OFF;
            console.log(state);
            i = null;
            break;
        }
        case states.PLANE: {
            state = states.PLANE;
            console.log(state);
            i = 0;
            break;
        }
        case states.SLOPE: {
            state = states.SLOPE;
            console.log(state);
            i = 1;
            break;
        }
        case states.THROW: {
            state = states.THROW;
            console.log(state);
            i = 1;
            //vY = v;
            v0X= v * Math.cos(beta[i]);
            v0Y = v * Math.sin(beta[i]);
            vY = v0Y -g * dt;
            break;
        }
    }

    if (i != null)
        g1 = sign*g * (Math.sin(-beta[i]) - cR[1] * Math.cos(-beta[i]));

}

function drawBG(){
    fill(dirtColor);
    beginShape(TESS);
    for (let i=0; i<G.length; i++) {
        vertex(x(G[i][0]), y(G[i][1]));
    }
    endShape(CLOSE);

    stroke(100, 100, 255);
    strokeWeight(3);
    fill(waterColor);
    beginShape(TESS);
    vertex(x(13.15), y(-.2));
    vertex(x(G[7][0]), y(G[7][1]));
    vertex(x(G[6][0]), y(G[6][1]));
    vertex(x(11.25), y(-.2));
    endShape(CLOSE);

    stroke(grassColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    //Points between which the grass line needs to be drawn
    let grass = [0,1, 1,2, 2,3, 3,4, 5,6];
    for (let i=0; i<grass.length; i++) {
        vertex(x(P[grass[i]][0]), y(P[grass[i]][1]));
    }
    endShape();

    stroke(sandColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    let sand = [7,8, 8,9];
    for (let i=0; i<sand.length; i++) {
        vertex(x(P[sand[i]][0]), y(P[sand[i]][1]));
    }
    endShape();

    //Flag
    stroke(0);
    strokeWeight(1);
    fill(255, 68, 31);
    beginShape(TRIANGLES);
    vertex(x(17.5), y(4));
    vertex(x(17.5), y(3.4));
    vertex(x(19.3), y(3.7));
    endShape();

    stroke(75);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    vertex(x(17.5), y(0));
    vertex(x(17.5), y(4));
    endShape();
}

function windowResized() {					/* responsive part */
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    M= (16.7/25.5)*canvasWidth/5;
}
