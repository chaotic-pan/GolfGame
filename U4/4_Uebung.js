/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 4,  1. November 2021, 23:00
 */

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Scale "Maßstab"
let M= (16.7/25.5)*canvasWidth/5;
// ratio to convert the centimeter of the printed picture to the given Scale
let ratio = 5/16.7;
// Coordinates transformation cartesian<->internal
let iO=[22.5*ratio, 9*ratio];
// Coordinates collection of Ground
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

let ballPos = [0, 0];
let ball0=[0,0];

let fRate = 50;
let timescale = 1;

let dt = timescale/fRate;
let t=0;
let v0= 2/ratio;
let v;
let b = (P[2][1]-P[1][1])/(P[2][0]-P[1][0]);
let g = 9.81;

//state machine
const states = {
    OFF: "off",
    PLANE_1: {
        TOL: "1. Ebene, to the left",
        TOR: "1. Ebene, to the right"
    },
    SLOPE_1: "1. schiefe Ebene"
};
let state = states.OFF;

let skyColor = '#dcebff';
let grassColor = '#18c918';
let dirtColor = '#f5aa42';
let sandColor = '#fff61f';
let waterColor = '#9696ff';
let red = '#e34132';
let green = '#35e332';

function setup() {	/* here are program-essentials to put */
    createCanvas(windowWidth, windowHeight);
    frameRate(fRate);
}

function draw() {							/* here is the dynamic part to put */
    /* administrative work */
    clear();
    //game canvas
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
    textSize(ratio*M);
    fill(grassColor);
    text("The ultimate Golf-Game", x(9.75), y(8));

    // buttons
    rectMode(CORNER)
    fill(green);
    rect(x(.5), y(-2), 3*ratio*M, ratio*M);
    textAlign(CENTER);

    fill(red);
    rect(x(22), y(-2), 3*ratio*M, ratio*M);
    textAlign(CENTER);

    fill(255);
    strokeWeight(0);
    textSize(0.5*ratio*M);
    text("NEW", x(-1), y(-2.5));
    text("RESET", x(20.5), y(-2.5));
    if (mouseIsPressed) {
        if (mouseX>=x(22) && mouseX<=x(19) &&
            mouseY>=y(-2) && mouseY<=y(-3)){
            resetB();
        }
        if (mouseX>=x(.5) && mouseX<=x(-3.5) &&
            mouseY>=y(-2) && mouseY<=y(-3)){
            newB();
        }
    }

    /* calculations */
    if (state===states.PLANE_1.TOL && ballPos[0]>=P[1][0]) {
        ballPos=P[1].slice();
        ball0=ballPos.slice();
        t=0;
        state = states.SLOPE_1;
    }
    if (state===states.SLOPE_1 && v<=0) {
        ball0=ballPos.slice();
        t=0
        state = states.PLANE_1.TOR;
    }
    if (state===states.PLANE_1.TOR && ballPos[0]<=P[0][0]) {
        ballPos=P[0].slice();
        state = states.OFF;
    }

    switch (state) {
        case states.OFF: {
            //console.log(state);
            ball0=ballPos.slice();
            t=0;
            v = v0;
            break;
        }
        case states.PLANE_1.TOL:
        case states.PLANE_1.TOR:{
            //console.log(state);
            let d;
            if (state===states.PLANE_1.TOL) d=1;
            else d=-1;
            t= t+ dt;
            ballPos[0] = ball0[0] +d*(v0 * t);
            break;
        }
        case states.SLOPE_1: {
            //console.log(state);
            t= t+ dt;
            v = -((g * Math.sin(b)) * (t*t)/2) + v0 * t;
            ballPos[0] = v + ball0[0];
            ballPos[1] = v * b;
            break;
        }
    }



    /* display */
    drawBG();

    // Golf club
    stroke(0);
    strokeWeight(1);
    fill(0);
    rectMode(CORNER);
    rect(x((-.08/ratio)), y(4), .03*M, 4*ratio*M);

    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(240);
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]), y(ballPos[1]+(.08/ratio)), .16*M);

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
    state=states.OFF;
    ballPos = [0, 0];
}

function newB(){
    // wtf JS???? lemme just compare a goddamn array
    if (JSON.stringify(ballPos) === "[0,0]") {
        state = states.PLANE_1.TOL;
    }
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
