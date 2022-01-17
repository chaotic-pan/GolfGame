/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 11, 11. Januar 2022, 00:00
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
// surface Segments vectors
let S = Array(10).fill(0);
// lenght of surface Segments vectors
let Sl = Array(10).fill(0);
let Si;

// angles of the playground
let beta = Array(10).fill(0); 

// indicator for beta array
let b;

// ballRadius is only used to draw the ball, not for the Throw calculation
let ballRadius = .06;
// current ball position
let ballPos = [0,0];

// radius of the golf club head
let clubRadius = .08;
// resting point of club
let clubRest = [-ballRadius-clubRadius, clubRadius];
// current club position
let clubPos = clubRest.slice();
// attenuation "Dämpfung" of club swing
let damp = false;

// frameRate (cannot be called "frameRate" cause apparently a internal function is already called like that)
let frRate = 50;
let timeScale = 1;
// delta time
let dt = timeScale/frRate;

// starting velocity for ball
let v0= 4.3;
// current velocity of ball
let v;
// velocity of Wind
let vWind = 0;
// velocity of Club
let vClub = 0;

// throw
let v0X; let v0Y; let vY; let vX; let vY2; let vX2;
let roh=1.3; let cW=0.45; let m=0.0459; let dBall=0.043; 
let A= Math.PI * Math.pow((dBall/2),2);

// Collision
let d; let lPart;

// gravitational constant on earth
let g = 9.81;
// g'
let g1;
// + / -
let sign = 1;
// coefficient of Rolling friction [Grass, Sand]
let cR = [.2, .5];

//state machine
let states = {
    OFF: "off",
    PLANE: "grade Ebene",
    PLANE_BACK: "grade Ebene zurück",
    SLOPE: "schiefe Ebene",
    THROW: "schräger Wurf",
    AFTER_THROW: "nach Wurf"
};
// current state
let state = states.OFF;

// locks Mouse down for club interaction
let locked;

let tries=1;
let hits=0;

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

    for (let i=0; i<P.length-1; i++) {
        let x = P[i+1][0]-P[i][0];
        let y = P[i+1][1]-P[i][1];
        S[i]= [x,y];
        
        Sl[i] = Math.sqrt(Math.pow(S[i][0],2)+Math.pow(S[i][1],2));

        beta[i] = Math.atan((P[i+1][1]-P[i][1])/(P[i+1][0]-P[i][0]));
    }
}

/* here is the dynamic part to put */
function draw() {

    /* administrative work */
    drawUI();

    /* calculations */
    stateChanging: {
        // reached foot of first slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > P[1][0]-ballRadius/2 && ballPos[0] < P[2][0]) {
            ballPos[0] = P[1][0]-ballRadius/2;
            b = 1;
            stateChange(states.SLOPE);
            break stateChanging;
        }
        // reached foot of second slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > P[8][0]-ballRadius/2) {
            ballPos[0] = P[8][0]-ballRadius/2;
            b = 8;
            stateChange(states.SLOPE);
            break stateChanging;
        }
        // reached end of game canvas --> OFF
        if (ballPos[0] < P[0][0]+ballRadius) {
            ballPos =  [P[0][0]+ballRadius, P[0][1]];
            stateChange(states.OFF);
            break stateChanging;
        }
        // when up the first slope --> THROW
        if (state===states.SLOPE && ballPos[0]>=P[2][0] && ballPos[0]<=P[3][0]) {
            stateChange(states.THROW);
            break stateChanging;
        }
        if ((state===states.PLANE|| state===states.PLANE_BACK) && 
            ballPos[0]>=P[4][0] && ballPos[0]<=P[5][0]) {
            stateChange(states.OFF);
            ballPos[1] = -0.24;
        }
        if ((state===states.PLANE || state===states.PLANE_BACK) && 
            (ballPos[0]>=P[6][0] && ballPos[0]<=P[7][0])) {
            stateChange(states.OFF);
            hits++;
            ballPos[1] = -0.24;
        }
    }
    
    // start
    if (!locked && clubPos[0]!==clubRest[0]) {
        if (!damp && clubPos[0]>=clubRest[0]) {
            damp = true;
        }if (!damp) {
            vClub = vClub - (90 * (clubPos[0]-clubRest[0]))*dt;
        } else {
            vClub = vClub - (4*vClub + 90 * (clubPos[0]-clubRest[0]))*dt;
            // start moving ball
            if (state===states.OFF && JSON.stringify(ballPos) === "[0,0]") {
                sign = 1;
                v = 2*vClub;
                stateChange(states.PLANE);
            }
        }
        clubPos[0] = clubPos[0]+vClub*dt;

        if (damp && clubPos[0]<=clubRest[0]) {
            clubPos[0]=clubRest[0];
        }
    }

    
    running: if (b != null) {
        // collision
        let dMin = 1000;
        Si = -1;
        for (let i=0; i<S.length-1; i++) {
            // vector from Point i to Ball pos
            let B = [ballPos[0]-P[i][0], ballPos[1]-P[i][1]];
            d = (S[i][0]*B[1] - S[i][1]*B[0]) / Sl[i];
            lPart = (S[i][0]*B[0] + S[i][1]*B[1]) / Sl[i];

            if (lPart > 0 && lPart < Sl[i]) {
                if (d < dMin) dMin=d;
                Si = i;
            }

            if (dMin<0) {

                // hit Water
                if (Si===4) {
                    stateChange(states.OFF);
                    ballPos[1] = -0.24;
                    break running;
                } else
                // hit Goal
                if (Si===6) {
                    stateChange(states.OFF);
                    hits++;
                    ballPos[1] = -0.24;
                    break running;
                }
                else {
                    if (Si===8 && state === states.THROW) {
                       v = v/2;
                    } 
                    stateChange(states.AFTER_THROW);
                }
            }
        }
        // let x2 = ballPos[0] + vX2 * dt;
        // let y2 = ballPos[1] + vY2 * dt;
        //
        // let B = [x2-P[Si][0], y2-P[Si][1]];
        // d = (S[Si][0]*B[1] - S[Si][1]*B[0]) / Sl[Si];
        // lPart = (S[Si][0]*B[0] + S[Si][1]*B[1]) / Sl[Si];
        //
        // if (d<0) {
        //     state=states.OFF
        //     break running;
        // }

        if (state===states.THROW) {
            vX= vX-((cW*roh*A)/(2*m) * Math.sqrt(Math.pow(vX-vWind, 2) + vY*vY) * vX)*dt;
            vX2= vX-((cW*roh*A)/(2*m) * Math.sqrt(Math.pow(vX-vWind, 2) + vY*vY) * vX)*dt;
            vY = vY -(g+(cW*roh*A)/(2*m) * Math.sqrt(vX*vX + vY*vY) * vX)*dt;
            vY2 = vY -(g+(cW*roh*A)/(2*m) * Math.sqrt(vX*vX + vY*vY) * vX)*dt;
            
            ballPos[0] = ballPos[0] + vX * dt;
            ballPos[1] = ballPos[1] + vY * dt;
        } 
        else if (state === states.AFTER_THROW) {
            if (Si === 1 || Si === 2 || Si === 8) {
                stateChange(states.SLOPE);
                b = Si;
                console.log("SLOPE");
            }else {
                stateChange(states.PLANE);
                console.log("plane");
                v = vX;
                ballPos[1] = 0;
            }
            
            // vX = vX + g1 * dt;
            // vY = vY * dt;
            // let vD= dreh([vX, vY], beta[2]);
            // ballPos[0] = ballPos[0] + vD[0]*dt;
            // ballPos[1] = ballPos[1] + vD[1]*dt;
            // if (vX <= 0) {
            //     // stopping
            //     vX=0;
            //     stateChange(states.OFF);
            //     break running;        
            // }
        }
        if (state === states.SLOPE) {
            v = v + g1*dt;
            let vDreh = dreh([v,0],beta[b]);
            ballPos[0] = ballPos[0] + vDreh[0]*dt;
            ballPos[1] = ballPos[1] + vDreh[1]*dt;
            if (ballPos[1] <= 0) {
                ballPos[1] = 0;
                v = vDreh[0];
                stateChange(states.PLANE_BACK);
            }
        }
        else if (state === states.PLANE) {
            v = v + g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            ballPos[1] = 0;
            if (v <= 0) {
                // stopping
                v=0;
                stateChange(states.OFF);
                break running;
            }
        }
        else if (state === states.PLANE_BACK) {
            v = v - g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            if (v >= 0) {
                // stopping
                v=0;
                stateChange(states.OFF);
                break running;
            }
        }
        // else {
        //     v = v + g1*dt;
        //     if (v <= 0 && sign===1) {
        //         // not yet on slope
        //         if (state === states.SLOPE) {
        //             // rolling downhill
        //             sign = -1;
        //         } else {
        //             // stopping
        //             v=0;
        //             stateChange(states.OFF);
        //             break running;
        //         }
        //     }
        //     if (v >= 0 && sign===-1) {
        //         // stopping after rolling slope back down
        //         v=0;
        //         stateChange(states.OFF);
        //         break running;
        //     }
        //    
        //     let vDreh = dreh([v,0],beta[b]);
        //     ballPos[0] = ballPos[0] + vDreh[0]*dt;
        //     ballPos[1] = ballPos[1] + vDreh[1]*dt;
        // }

    }


    // stroke(red);
    // strokeWeight(2);
    // beginShape(LINES);
    // vertex(x(ballPos[0]), y(ballPos[1]));
    // vertex(x(ballPos[0]+xOld*0.1), y(ballPos[1]));
    // endShape();    
    //
    // stroke(red);
    // strokeWeight(2);
    // beginShape(LINES);
    // vertex(x(ballPos[0]), y(ballPos[1]));
    // vertex(x(ballPos[0]), y(ballPos[1]+yOld*0.1));
    // endShape();
    //
    // stroke(green);
    // beginShape(LINES);
    // vertex(x(ballPos[0]), y(ballPos[1]));
    // vertex(x(ballPos[0]+xOld*0.1), y(ballPos[1]+yOld*0.1));
    // endShape();
    // if (state === states.AFTER_THROW) {
    //     stroke('#0fadd5');
    //     beginShape(LINES);
    //     vertex(x(ballPos[0]), y(ballPos[1]));
    //     vertex(x(ballPos[0]+vX*0.1), y(ballPos[1]+vY*0.1));
    //     endShape();
    // }
    

    /* display */
    drawFG();
}

function x(coord){
    return (-coord+iO[0])*M;
}

function y(coord){
    return (-coord+iO[1])*M;
}

function dreh(pos, angle) {
    let dreh = [0,0];
    
    dreh[0] = pos[0]*Math.cos(-angle) + pos[1]*Math.sin(-angle);
    dreh[1] = pos[0]*-Math.sin(-angle) + pos[1]*Math.cos(-angle);
    
    return dreh;
}

function mousePressed() {
    if (mouseX >= x(-ballRadius) && mouseX <= x(-ballRadius-2*clubRadius) &&
        mouseY >= y(2*clubRadius) && mouseY <= y(0)) {
        locked = true;
        vClub = 0;
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
        stateChange(states.OFF);
        ballPos = [0, 0];
        vX2 = 0;
        vY2=0;

        vWind = (floor(random() * (100))-50)/3.6;
    }
}

function stateChange(st) {
    switch (st) {
        case states.OFF: {
            state = states.OFF;
            b = null;
            break;
        }
        case states.PLANE: {
            state = states.PLANE;
            b = 0;
            break;
        }
        case states.PLANE_BACK: {
            state = states.PLANE_BACK;
            b = 0;
            break;
        }
        case states.SLOPE: {
            state = states.SLOPE;
            break;
        }
        case states.THROW: {
            state = states.THROW;
            b = 1;
            v0X= v * Math.cos(beta[b]);
            v0Y = v * Math.sin(beta[b]);
            vY = v0Y;
            vX = v0X;
            break;
        }
        case states.AFTER_THROW: {
            state = states.AFTER_THROW;
            b = 0;
            break;
        }
    }

    console.log(state);

    if (b != null) {
        let c =  cR[1];
        if (Si >= 8) c = cR[0]; 
        g1 = sign * g * (Math.sin(-beta[b]) - c * Math.cos(-beta[b]));
    }
}

// foreground
function drawFG() {
    //Flag
    stroke(0);
    strokeWeight(1);
    fill(255, 68, 31);
    beginShape(TRIANGLES);
    vertex(x(5.25), y(1.2));
    vertex(x(5.25), y(1.02));
    vertex(x(5.25+(vWind*3.6)/100), y(1.11));
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
    circle(x(clubPos[0]), y(clubPos[1]), 2*clubRadius*M);


    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(240);
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]), y(ballPos[1]+ballRadius), 2*ballRadius*M);
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

// background
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
