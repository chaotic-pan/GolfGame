/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 6,  Dienstag, 16. November, 00:00
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

let ballDiameter = .16;
let ballPos = [0,0];
// frameRate (cannot be called "frameRate" cause apparently the internal function is already called that)
let frRate = 50;
let timeScale = 1;
// delta time
let dt = timeScale/frRate;
// starting velocity
let v0= 2/ratio;
// current velocity
let v;
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

    // headline
    textAlign(CENTER, CENTER);
    textSize(ratio * M);
    fill(grassColor);
    text("The ultimate Golf-Game", x(9.75), y(8));

    // buttons
    rectMode(CORNER)
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

    // throw after first Slope
    if (state===states.SLOPE && ballPos[0]>=P[2][0]) {
        //ballPos=P[2].slice();
        stateChance(states.THROW);
    }
    // up first Slope
    if (state === states.PLANE && ballPos[0] > P[1][0]) {
        ballPos[0] = P[1][0];
        stateChance(states.SLOPE);
    }
    // start
    if (state !== states.OFF && state !== states.PLANE &&
        ballPos[0] < P[1][0] && ballPos[0] > P[0][0]) {
        stateChance(states.PLANE);
    }
    // end after ball rolled back to starting point
    if (ballPos[0] < P[0][0]) {
        ballPos =  [P[0][0]+ballDiameter/ratio, P[0][1]];
        stateChance(states.OFF);
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
            console.log(v);
            ballPos[0] = ballPos[0] + v*dt;
            ballPos[1] = ballPos[1] + v*Math.sin(beta[i]) * dt;
        }
    }

    /* display */
    drawBG();

    // Golf club
    stroke(0);
    strokeWeight(1);
    fill(0);
    rectMode(CORNER);
    rect(x((-ballDiameter/ratio)), y(4), .03*M, 4*ratio*M);

    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(240);
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]-((ballDiameter/2)/ratio)), y(ballPos[1]+((ballDiameter/2)/ratio)), ballDiameter*M);

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
}

function newB(){
    // wtf JS???? lemme just compare a goddamn array
    if (JSON.stringify(ballPos) === "[0,0]") {
        sign = 1;
        v = v0;
        stateChance(states.PLANE);
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
            v0X= v0 * Math.cos(beta[i]);
            v0Y = v0 * Math.sin(beta[i]);
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
    for (var i=0; i<G.length; i++) {
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
    var grass = [0,1, 1,2, 2,3, 3,4, 5,6];
    for (i=0; i<grass.length; i++) {
        vertex(x(P[grass[i]][0]), y(P[grass[i]][1]));
    }
    endShape();

    stroke(sandColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    var sand = [7,8, 8,9];
    for (i=0; i<sand.length; i++) {
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
