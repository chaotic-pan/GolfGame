/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 10,  Dienstag, 21. Dezember, 00:00
 */

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Scale "Maßstab"
let M= (16.7/25.5)*canvasWidth/5;
// Coordinates transformation cartesian<->internal
let iO=[6.75, 2.7];
// Coordinates collection of Playground
let G = [
    // Start point
    [-.75, -.42],   // 0
    [-.75, 0],      // 1
    //Hill
    [1.05, 0],       // 2
    [1.95, .45],     // 3
    [2.85, 0],       // 4
    // Water Hole
    [3.36, 0],      // 5
    [3.42, -.24],    // 6
    [3.9, -.24],      // 7
    [3.96, 0],      // 8
    //Hole
    [4.89, 0],      // 9
    [4.89, -.24],    // 10
    [5.07,-.24],     // 11
    [5.07,0],       // 12
    //Sand Hill
    [5.7,0],         // 13
    [6.6, .87],      // 14
    [6.6,-.42],      // 15
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

let tries=1;
let hits=0;


// ballDiameter is only used to draw the ball, not for the Throw calculation
let ballDiameter = .12;
let ballCenter = (ballDiameter/2);
let ballPos = [0,0];
// radius of the golf club head
let club = .08;
// current club position
let clubPos = [-ballCenter-club, club];
// resting point of club
let clubRest = [-ballCenter-club, club];
// attenuation "Dämpfung"
let damp = false;

// frameRate (cannot be called "frameRate" cause apparently the internal function is already called that)
let frRate = 50;
let timeScale = 1;
// delta time
let dt = timeScale/frRate;
// starting velocity
let v0= 4.3;
    // <=4.4 rolls back
    // <= 6.8 Water
        // exact: 5.6-6.8
    // <= 8.2 Goal
        // exact: 8.1 - 8.2
    // >= 8.7 Sand
let wind = 0;
let vWind = 0;
// current velocity
let v;
// velocity of Club
let vC = 0;
let v0X; let v0Y; let vY; let vX;
let roh=1.3; let cW=0.45; let m=0.0025; let A=0.001;
// angles of the playground
let beta = [Math.atan((P[1][1]-P[0][1])/(P[1][0]-P[0][0])),       // 0 Plane
            Math.atan((P[2][1]-P[1][1])/(P[2][0]-P[1][0]))+.04,   // 1 Grass Slope
            Math.atan((P[9][1]-P[8][1])/(P[9][0]-P[8][0]))];      // 2 Sand Slope
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

let locked;

/* here are program-essentials to put */
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(frRate);
}

/* here is the dynamic part to put */
function draw() {

    /* administrative work */
    drawUI();

    /* calculations */
    stateChanging: {
        // reached foot of first slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > P[1][0]-ballCenter/2) {
            ballPos[0] = P[1][0]-ballCenter/2;
            stateChance(states.SLOPE);
            break stateChanging;
        }
        // ball rolled back down slope --> PLANE
        if (state !== states.OFF && state !== states.PLANE &&
            ballPos[0] < P[1][0]-ballCenter/2 && ballPos[0] > P[0][0]) {
            ballPos[1] = P[1][1];
            stateChance(states.PLANE);
            break stateChanging;
        }
        // reached end of game canvas --> OFF
        if (ballPos[0] < P[0][0]+ballCenter) {
            ballPos =  [P[0][0]+ballCenter, P[0][1]];
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

    // end
    if (ballPos[1] < 0) {
        if (state !== states.OFF)
            stateChance(states.OFF);
        // hit Water
        if (ballPos[0]>=P[4][0] && ballPos[0]<=P[5][0]) {
            ballPos[1] = -0.24;
            ballPos[0] = (P[4][0]+P[5][0])/2;
        }
        // hit goal
        else if (ballPos[0]>=P[6][0]  && ballPos[0]<=P[7][0]) {
            // so hits gets only increased once
            if (JSON.stringify(ballPos) !== "[4.98,-0.24]")
                hits++;
            ballPos[1] = -0.24;
            ballPos[0] = (P[6][0]+P[7][0])/2;
            console.log(ballPos);
        }
        // there's a mistake somewhere
        else {
            fill(red);
            stroke(255);
            strokeWeight(1);
            textSize(0.15 * M);
            text("Oopsie!", x(ballPos[0]-ballCenter), y(ballPos[1]+3*ballCenter));
        }
    }

    if (!locked && clubPos[0]!==clubRest[0]) {
        if (!damp && clubPos[0]>=clubRest[0]) {
            damp = true;
        }if (!damp) {
            vC = vC - (10 * (clubPos[0]-clubRest[0]))*dt;
        } else {
            vC = vC - (4*vC + 10 * (clubPos[0]-clubRest[0]))*dt;
            // start moving ball
            if (state===states.OFF && JSON.stringify(ballPos) === "[0,0]") {
                sign = 1;
                v = 2*vC;
                stateChance(states.PLANE);
            }
        }
        clubPos[0] = clubPos[0]+vC*dt;

        if (damp && clubPos[0]<=clubRest[0]) {
            clubPos[0]=clubRest[0];
        }
    }

    running: if (i != null) {
        if (state===states.THROW) {
            vX= vX-((cW*roh*A)/(2*m) * Math.sqrt(Math.pow(vX-vWind, 2) + vY*vY) * vX)*dt;
            vY = vY -(g+(cW*roh*A)/(2*m) * Math.sqrt(vX*vX + vY*vY) * vX)*dt;
            ballPos[0] = ballPos[0] + vX * dt;
            ballPos[1] = ballPos[1] + vY * dt;
        }
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
            ballPos[0] = ballPos[0] + v*dt;
            ballPos[1] = ballPos[1] + v*Math.sin(beta[i]) * dt;
        }

    }

    /* display */
    //Flag
    stroke(0);
    strokeWeight(1);
    fill(255, 68, 31);
    beginShape(TRIANGLES);
    vertex(x(5.25), y(1.2));
    vertex(x(5.25), y(1.02));
    vertex(x(5.25+wind), y(1.11));
    endShape();

    stroke(75);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    vertex(x(5.25), y(0));
    vertex(x(5.25), y(1.2));
    endShape();


    // Golf club
    stroke(75);
    beginShape(LINES);
    vertex(x(clubPos[0]), y(clubPos[1]));
    vertex(x(clubRest[0]), y(1.2));
    endShape();

    strokeWeight(0);
    fill(150);
    rectMode(CENTER);
    circle(x(clubPos[0]), y(clubPos[1]), 2*club*M);


    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(240);
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]), y(ballPos[1]+ballCenter), ballDiameter*M);
}

function x(coord){
    return (-coord+iO[0])*M;
}

function y(coord){
    return (-coord+iO[1])*M;
}

function mousePressed() {
    if (mouseX >= x(-ballCenter) && mouseX <= x(-ballCenter-2*club) &&
        mouseY >= y(2*club) && mouseY <= y(0)) {
        locked = true;
        vC = 0;
        damp = false;
        return;
    }

    if (mouseX >= x(6.6) && mouseX <= x(5.7) &&
        mouseY >= y(-.6) && mouseY <= y(-.9)) {
        resetB();
        return;
    }
    if (mouseX >= x(.15) && mouseX <= x(-1.05) &&
        mouseY >= y(-.6) && mouseY <= y(-.9)) {
        newB();
    }

}

function mouseDragged() {
    if (locked) {
        clubPos[0] = -(mouseX/M -iO[0]);
        if (clubPos[0] >= clubRest[0]) {
            clubPos[0] = clubRest[0];
        }
    }
}

function mouseReleased() {
    locked = false;
}

function resetB() {
    newB();
    tries = 1;
    hits = 0;
}

function newB(){
    // wtf JS???? lemme just compare a goddamn array
    if (JSON.stringify(ballPos) !== "[0,0]") {
        tries++;
        stateChance(states.OFF);
        ballPos = [0, 0];

        vWind = (floor(random() * (30))-15)/3.6;
        wind = (vWind*3.6)/30;
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
            vY = v0Y;
            vX = v0X;
            break;
        }
    }

    if (i != null)
        g1 = sign*g * (Math.sin(-beta[i]) - cR[1] * Math.cos(-beta[i]));

}

function drawUI() {
    clear();

    //game canvas / sky
    stroke(0);
    strokeWeight(1);
    fill(skyColor);
    beginShape();
    vertex(x(6.6), y(2.1));
    vertex(x(-.75), y(2.1));
    vertex(x(-.75), y(-.42));
    vertex(x(6.6), y(-.42));
    endShape(CLOSE);

    drawBG();

    // headline
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(.3 * M);
    fill(grassColor);
    text("The ultimate Golf-Game", x(2.925), y(2.4));

    // headline
    textAlign(LEFT, BOTTOM);
    strokeWeight(0);
    textSize(0.12 * M);
    fill(50);
    text("Tries: "+tries, x(6.6), y(2.13));
    textAlign(RIGHT, BOTTOM);
    text("Hits: "+hits, x(-.75), y(2.13));

    // buttons
    stroke(0);
    strokeWeight(1);
    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    fill(green);
    rect(x(.15), y(-.6), .9* M, .3* M);
    textAlign(CENTER);

    fill(red);
    rect(x(6.6), y(-.6), .9 * M, .3 * M);
    textAlign(CENTER);

    fill(255);
    strokeWeight(0);
    textSize(0.15 * M);
    text("NEW", x(-.3), y(-.75));
    text("RESET", x(6.15), y(-.75));
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
    vertex(x(3.945), y(-.06));
    vertex(x(G[7][0]), y(G[7][1]));
    vertex(x(G[6][0]), y(G[6][1]));
    vertex(x(3.375), y(-.06));
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
}

function windowResized() {					/* responsive part */
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    M= (16.7/25.5)*canvasWidth/5;
}
