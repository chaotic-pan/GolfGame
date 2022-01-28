/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 13, 25. Januar 2022, 00:00
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
    //Hole
    [4.89, 0],       // 9
    [4.90, -.24],    // 10
    [5.06,-.24],     // 11
    [5.07,0],        // 12
    // Hill
    [5.7,0],         // 13
    [6.6, .87],      // 14
    [6.6,-.42],      // 15
];
// surface Segments vectors
let S = Array(G.length-2).fill(0);
// lenght of surface Segments vectors
let Sl = Array(G.length-2).fill(0);
let Si = 0;

// angles of the playground
let beta = Array(G.length-2).fill(0);

// ballRadius is only used to draw the ball, not for the Throw calculation
let ballRadius = .06;
// current ball position
let ballPos = [0, 0];

// radius of the golf club head
let clubRadius = .08;
// resting point of club
let clubRest = [-ballRadius-clubRadius, clubRadius];
// current club position
let clubPos = clubRest.slice();
// attenuation "Dämpfung" of club swing
let damp = false;

let ballRest = [0, 1.4*clubRadius];

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
let vY; let vX;
let roh=1.3; let cW=0.45; let m=0.0459; let dBall=0.043; 
let A= Math.PI * Math.pow((dBall/2),2);

// Collision
let d; let lPart; 
// lotFuß
let F = [0,0];

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
	SLOPE_L: "schiefe Ebene, landing",
    SLOPE_DOWN: "schiefe Ebene runter",
    THROW: "schräger Wurf"
};
// current state
let state = states.OFF;
let water = false; let goal = false;

// locks Mouse down for club interaction
let locked;

let tries = 1;
let hits = 0;
let oldHits = 0;

let skyColor; let grassColor; let dirtColor; let sandColor; let waterColor;
let red; let green; let nightColor;
let gray1; let gray2; let gray3;
let textColor; let nightText;

let night = true;

function changeBG() {
    window.location.href = "index.html";
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(frRate);

    let button = createButton('click me');
    button.position(0, 0);
    button.mousePressed(changeBG);
    
    ballPos = ballRest.slice();

    for (let i=0; i<G.length-2; i++) {
        let x = G[i+2][0]-G[i+1][0];
        let y = G[i+2][1]-G[i+1][1];
        S[i]= [x,y];
        
        Sl[i] = Math.sqrt(Math.pow(S[i][0],2)+Math.pow(S[i][1],2));

        beta[i] = Math.atan((G[i+2][1]-G[i+1][1])/(G[i+2][0]-G[i+1][0]));
    }
}

function draw() {
    
    drawUI();
    
    stateChanging: {
        // reached foot of first slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > G[6][0]-ballRadius/2) {
            ballPos[0] = G[6][0]-ballRadius/2;
            Si = 4;
            state = states.SLOPE;
            console.log(state);
            break stateChanging;
        }
        // reached right end of game canvas --> OFF
        if (ballPos[0] < G[1][0]+ballRadius) {
            ballPos = [G[1][0]+ballRadius, G[1][1]];
            state = states.OFF;
            console.log(state);
            break stateChanging;
        }
        // reached left end of game canvas --> Yeet
        if (ballPos[0] >= G[7][0]+ballRadius) {
            Si = 5;
            vX= v * Math.cos(beta[Si]);
            vY = v * Math.sin(beta[Si]);
            break stateChanging;
        }
        // when roll over hole --> win
        if ((ballPos[0]>=G[2][0]-ballRadius  && ballPos[0]<=G[5][0]) &&  ballPos[1] <= 0){
            if (state===states.PLANE || state===states.PLANE_BACK) {
                Si = 0;
                state = states.THROW;
                console.log(state);
                vX= v * Math.cos(beta[Si]);
                vY = v * Math.sin(beta[Si]);
            }
            console.log("goal");
            goal = true;
            if (oldHits === hits) {
                hits++;
            }
            break stateChanging;
        }
    }
    
    // start
    if (!locked && JSON.stringify(clubPos) !== JSON.stringify(clubRest)) {

        let dis = Math.sqrt(Math.pow((ballPos[0]-clubPos[0]),2) + Math.pow((ballPos[1]+ballRadius-clubPos[1]),2));
        dis = dis - ballRadius - clubRadius;
        
        if (clubPos[0] >= clubRest[0]) {
            damp = true;
        } 
        
        if (dis <= 0) {
            
            let phi = Math.atan((ballPos[1]+ballRadius-clubPos[1]) / (ballPos[0]-clubPos[0])) /2;
          
            // start moving ball
            if (state===states.OFF && JSON.stringify(ballPos) === JSON.stringify(ballRest)) {
                sign = 1;
                v = 2*vClub;
                vX= v * Math.cos(phi);
                vY = v * Math.sin(phi);
                state = states.THROW;
                console.log(state);
            }
        }
       
        if (!damp) {
            vClub = vClub - (90 * (clubPos[0]-clubRest[0]))*dt;
        } else {
            vClub = vClub - (4*vClub + 90 * (clubPos[0]-clubRest[0]))*dt;
        }
        
        clubPos[0] = clubPos[0]+vClub*dt;

        if (damp && clubPos[0]<clubRest[0]) {
            clubPos[0]=clubRest[0];
            vClub = 0;
            // didn't hit ball
            if (state === states.OFF) {
                tries++;
            }
        }
    }
    
    running: if (state !== states.OFF) {
        // collision
        let dMin = 1000;
        for (let i=0; i<S.length-1; i++) {
            
            if (!goal && (i === 1 || i === 2 || i === 3)
                && (ballPos[0]<G[2][0] || ballPos[0]>G[5][0]+2*ballRadius))
                 continue;
            if (goal) {
                if (i !== 1 && i !== 2 && i !== 3) continue
            }
            
            
            // vector from Point i to Ball pos
            let B = [ballPos[0]-G[i+1][0], ballPos[1]-G[i+1][1]];
            d = (S[i][0]*B[1] - S[i][1]*B[0]) / Sl[i];
            lPart = (S[i][0]*B[0] + S[i][1]*B[1]) / Sl[i];
            
            if (lPart > 0 && lPart < Sl[i]) {
                if (d < dMin) {
                    dMin=d;
                    Si = i;
                    // lotFuß
                    F = [G[Si+1][0] + (lPart/Sl[Si]) * (G[Si+2][0]-G[Si+1][0]),
                        G[Si+1][1] + (lPart/Sl[Si]) * (G[Si+2][1]-G[Si+1][1])]; 
                }
            }

            /* Debug Stuff */
            // let P = [G[i+1][0] + (lPart/Sl[i]) * (G[i+2][0]-G[i+1][0]),
            //     G[i+1][1] + (lPart/Sl[i]) * (G[i+2][1]-G[i+1][1])];
            // strokeWeight(0);
            // fill('#0fadd5');
            // if (i===6) fill('#ff6914');
            // rectMode(CENTER);
            // circle(x(P[0]), y(P[1]), clubRadius*M);
            //
            // fill(255);
            // textSize(.8*clubRadius*M)
            // text(i, x(P[0]), y(P[1]));
            
            if (dMin<0) {
                ballPos = F;
                
                if (Si === 1) {
                    if (state === states.THROW){
                        v = vX;
                    }
                    state = states.SLOPE_DOWN;
                    console.log(state);      
                } else if (Si === 3 || Si === 5) {
                    if (state === states.THROW){
                        let vDreh = dreh([vX,vY],beta[Si]);
                        v = vDreh[0];
                    }
                    state = states.SLOPE;
                    console.log(state);
                } else {
                    if (state === states.THROW){
                        v = vX;
                    }
                    state = states.PLANE;
                    console.log(state);
                }
            }
        }
        
        let c =  cR[0];
        if (Si >= 11) c = cR[1];
        g1 = sign * g * (Math.sin(-beta[Si]) - c * Math.cos(-beta[Si]));
        
        if (state===states.THROW) {
            vX= vX-((cW*roh*A)/(2*m) * Math.sqrt(Math.pow(vX-vWind, 2) + vY*vY) * vX)*dt;
            vY = vY -(g+(cW*roh*A)/(2*m) * Math.sqrt(vX*vX + vY*vY) * vX)*dt;
            
            ballPos[0] = ballPos[0] + vX * dt;
            ballPos[1] = ballPos[1] + vY * dt;
        }
        else if (state === states.SLOPE) {
            v = v + g1*dt;
            let vDreh = dreh([v,0],beta[Si]);
            ballPos[0] = ballPos[0] + vDreh[0]*dt;
            ballPos[1] = ballPos[1] + vDreh[1]*dt;
            if (Si !== 3 && Si !== 1 && ballPos[1] < 0) {
                ballPos[1] = 0;
                state = states.PLANE_BACK;
                console.log(Si)
                console.log(state);
            }
        }
        else if (state === states.SLOPE_DOWN) {
            v = v + g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            ballPos[1] = ballPos[1] - v*dt;
            if (Si !== 1 && ballPos[1] < 0) {
                ballPos[1] = 0;
                state = states.PLANE;
                console.log(state);
            }
        }
        else if (state === states.PLANE) {
            v = v + g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            if (v <= 0) {
                // stopping
                v=0;
                state = states.OFF;
                console.log(state);
                break running;
            }
        }
        else if (state === states.PLANE_BACK) {
            v = v - g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            if (v >= 0) {
                // stopping
                v=0;
                state = states.OFF;
                console.log(state);
                break running;
            }
        }
    }

    /* Debug Stuff */
    // strokeWeight(0);
    // fill('#0fadd5');
    // rectMode(CENTER);
    // circle(x(F[0]), y(F[1]), clubRadius*M);
    //
    // fill(0);
    // textSize(.8*clubRadius*M)
    // text(Si, x(F[0]), y(F[1]));
    
    drawForeground();
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
    if (mouseX >= x(clubPos[0]+clubRadius) && mouseX <= x(clubPos[0]-clubRadius) &&
        mouseY >= y(clubPos[1]+clubRadius) && mouseY <= y(clubPos[1]-clubRadius)) {
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
    if (mouseX >= x(6.6) && mouseX <= x(5.9) &&
        mouseY >= y(2.3) && mouseY <= y(2.15)) {
        night=!night;
    }

}

function mouseDragged() {
    if (locked) {
        clubPos[0] = -(mouseX/M -iO[0]);
        if (clubPos[0] >= clubRest[0]) {
            clubPos[0] = clubRest[0];
        }
        if (clubPos[0] <= G[0][0]+clubRadius) {
            clubPos[0] =  G[0][0]+clubRadius;
        }
        
        clubPos[1] = -(mouseY/M -iO[1]);
        if (clubPos[1] <= clubRadius) {
            clubPos[1] = clubRadius;
        }
        if (clubPos[1] >= 5*clubRadius) {
            clubPos[1] = 5*clubRadius;
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
    if (JSON.stringify(ballPos) !== JSON.stringify(ballRest)) {
        tries++;
        state = states.OFF;
        ballPos = ballRest.slice();
        clubPos = clubRest.slice();
        Si = 0;
        oldHits = hits;
        water = false; goal = false;
        
        vWind = (floor(random() * (100))-50)/3.6;
    }
   
}

function drawForeground() {
    //Flag
    stroke(0);
    strokeWeight(1);
    fill(red);
    beginShape(TRIANGLES);
    vertex(x(5.25), y(1.2));
    vertex(x(5.25), y(1.02));
    vertex(x(5.25+(vWind*3.6)/100), y(1.11));
    endShape();

    stroke(gray1);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    vertex(x(5.25), y(0));
    vertex(x(5.25), y(1.2));
    endShape();


    // Golf club
    stroke(gray1);
    beginShape(LINES);
    vertex(x(clubPos[0]), y(clubPos[1]));
    vertex(x(clubRest[0]), y(1.2));
    endShape();

    strokeWeight(0);
    fill(gray2);
    rectMode(CENTER);
    circle(x(clubPos[0]), y(clubPos[1]), 2*clubRadius*M);


    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(gray3)
    rectMode(CENTER);
    //ball coordinates are set at the bottom of the ball
    //to display the ball properly the y coordinate need to be moved up by half the diameter
    circle(x(ballPos[0]), y(ballPos[1]+ballRadius), 2*ballRadius*M);
}

function drawUI() {
    clear();

    drawBackground();

    // headline
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(.3 * M);
    fill(green);
    text("The ultimate Golf-Game", x(2.925), y(2.4));

    // Hit Count
    strokeWeight(0);
    textSize(0.12 * M);
    fill(nightColor);
    textAlign(RIGHT, BOTTOM);
    text("Hits: "+hits + "/"+tries, x(-.7), y(2.13));

    // buttons
    stroke(0);
    strokeWeight(1);
    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    fill(green);
    rect(x(.15), y(-.6), .9* M, .3* M);

    fill(red);
    rect(x(6.6), y(-.6), .9 * M, .3 * M);
    
    fill(textColor);
    strokeWeight(0);
    textSize(0.15 * M);
    text("NEW", x(-.3), y(-.75));
    text("RESET", x(6.15), y(-.75));
    
    fill(nightColor);
    strokeWeight(1);
    rect(x(6.6), y(2.3), .7 * M, .15 * M);
    fill(nightText);
    textAlign(CENTER);
    strokeWeight(0);
    textStyle(BOLD);
    textSize(0.08 * M);
    let str = "Nightmode";
    if (night) str = "Lightmode";
    text(str, x(6.25), y(2.225));
    
}

function drawBackground(){
    
    if (night) {
        background('#202424');
        skyColor = '#1a2133';
        grassColor = '#074107';
        dirtColor = '#49391e';
        sandColor = '#77752c';
        waterColor = '#38386b';
        red = '#641c16';
        green = '#165b15';
        gray1 = 40;
        gray2 = 75;
        gray3 = 150;
        textColor = '#989898';
        nightColor = '#4c5454';
        nightText = '#131515';
    } else {
        background('#ffffff');
        skyColor = '#e6efff';
        grassColor = '#18c918';
        dirtColor = '#f5aa42';
        sandColor = '#fff61f';
        waterColor = '#9696ff';
        red = '#e34132';
        green = '#35e332';
        gray1 = 75;
        gray2 = 150;
        gray3 = 240;
        textColor = '#ffffff';
        nightColor = '#707c7c'; 
        nightText = '#2e3333';
    }
    
    let gradient = drawingContext.createLinearGradient(1,y(2.1), 1,y(-.42));
    gradient.addColorStop(0, skyColor);
    if (night) gradient.addColorStop(1, '#0e131c');
    else gradient.addColorStop(1, '#b0d1ff');
    drawingContext.fillStyle = gradient;

    rectMode(CORNER);
    rect(x(6.6), y(2.1), 7.35*M, 2.52*M);
    
    // moon
    if (night) {
        strokeWeight(0);
        fill('#b6b432');
        rectMode(CENTER);
        circle(x(5.9), y(1.5), .8*M);

        drawingContext.fillStyle = gradient;
        rectMode(CENTER);
        circle(x(5.77), y(1.56), .6*M);
    }

    //Ground
    fill(dirtColor)
    strokeWeight(0);
    beginShape(TESS);
    for (let i=0; i<G.length; i++) {
        vertex(x(G[i][0]), y(G[i][1]));
    }
    endShape(CLOSE);

    // Grass
    stroke(grassColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    //Points between which the grass line needs to be drawn
    let grass = [1,2, 5,6, 6,7];
    for (let i=0; i<grass.length; i++) {
        vertex(x(G[grass[i]][0]), y(G[grass[i]][1]));
    }
    endShape();
    
    // Tee
    strokeWeight(0);
    fill(gray2);
    beginShape(TESS);
    vertex(x(ballRest[0]+ballRadius/2), y(ballRest[1]));
    vertex(x(ballRest[0]-ballRadius/2), y(ballRest[1]));
    vertex(x(ballRest[0]), y(0));
    endShape(CLOSE);
}

function windowResized() {					/* responsive part */
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    M= (16.7/25.5)*canvasWidth/5;
}
