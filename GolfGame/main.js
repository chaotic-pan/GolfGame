/* template GTAT2 Game Technology & Interactive Systems 
Liz Kintzel
 */

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Scale "Maßstab"
let M= (16.7/25.5)*canvasWidth/5;
// Coordinates transformation cartesian<->internal
let iO=[6.75, 2.7];

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

// ballRadius is only used to draw the ball, not for the Throw calculation
let ballRadius = .06;
// current ball position
let ballPos = [0, 0];

// radius of the golf club head
let clubRadius = .08;
// resting point of club
let clubRest = [-.25, clubRadius];
// lenght of club
let l;
// current club position
let clubPos = clubRest.slice();
let ballRest = [0, 1.4*clubRadius];

let skyColor; let grassColor; let dirtColor; let sandColor; let waterColor;
let red; let green; let nightColor;
let gray1; let gray2; let gray3;
let textColor; let nightText;

let night =  sessionStorage.getItem("night");
let moon, sun, homeB, homeW, tutB, tutW;

function preload() {
    moon = loadImage("moon.png");
    sun = loadImage("sun.png");
    homeB = loadImage('homeB.png');
    homeW = loadImage('homeW.png');
    tutB = loadImage("tutorialB.png");
    tutW = loadImage("tutorialW.png");
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
    // level select page
    if (window.location.href.includes("index.html")) {
        if (mouseX >= x(3.5) && mouseX <= x(2.5) &&
            mouseY >= y(1.75) && mouseY <= y(1.45)) {
            window.location.href = "L1.html";
            return;
        }
        if (mouseX >= x(3.5) && mouseX <= x(2.5) &&
            mouseY >= y(1.4) && mouseY <= y(1.1)) {
            window.location.href = "L2.html";
            return;
        }
        if (mouseX >= x(3.5) && mouseX <= x(2.5) &&
            mouseY >= y(1.05) && mouseY <= y(0.8)) {
            window.location.href = "L3.html";
            return;
        }
        if (mouseX >= x(3.5) && mouseX <= x(2.5) &&
            mouseY >= y(0.7) && mouseY <= y(0.4)) {
            window.location.href = "L4.html";
            return;
        }
    }
    // actual levels
    else {
        l = null;

        if (mouseX >= x(clubPos[0] + clubRadius) && mouseX <= x(clubPos[0] - clubRadius) &&
            mouseY >= y(clubPos[1] + clubRadius) && mouseY <= y(clubPos[1] - clubRadius)) {
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

        if (mouseX >= x(6.6) && mouseX <= x(6.4) &&
            mouseY >= y(2.35) && mouseY <= y(2.15)) {
            window.location.href = "index.html";
        }
    }
    
    if (mouseX >= x(6.35) && mouseX <= x(6.15) &&
        mouseY >= y(2.35) && mouseY <= y(2.15)) {
        if (night === "0") night="1";
        else night="0";
        sessionStorage.setItem("night", night);
    }
    
    // if (mouseX >= x(6.1) && mouseX <= x(5.9) &&
    //     mouseY >= y(2.35) && mouseY <= y(2.15)) {
    //     if (night === "0") night="1";
    //     else night="0";
    //     sessionStorage.setItem("night", night);
    // }

}

function mouseDragged() {
    if (window.location.href.includes("index.html")) return;

    if (locked) {
        clubPos[0] = -(mouseX/M -iO[0]);
        if (clubPos[0] >= clubRest[0]) {
            clubPos[0] = clubRest[0];
        }

        clubPos[1] = -(mouseY/M -iO[1]);
    }
}

function mouseReleased() {
    locked = false;

    let clubAnchor = [clubRest[0], 1.2];
    let club = [clubPos[0]-clubAnchor[0], clubPos[1]-clubAnchor[1]];
    l = Math.sqrt(Math.pow(club[0],2)+Math.pow(club[1],2));

    if (l < .8) l = .8;
    if (l > 1.2) l = 1.12;

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
        l = null;
        vWind = (floor(random() * (100))-50)/3.6;
    } else if (JSON.stringify(clubPos) !== JSON.stringify(clubRest)) {
        clubPos = clubRest.slice();
        l = null;
    }
}

function drawBackground(G){
    if (night==="1") {
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
    if (night==="1") gradient.addColorStop(1, '#0e131c');
    else gradient.addColorStop(1, '#b0d1ff');
    drawingContext.fillStyle = gradient;

    rectMode(CORNER);
    rect(x(6.6), y(2.1), 7.35*M, 2.52*M);

    // moon
    if (night==="1") {
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
}

function drawGrass(grass) {
    stroke(grassColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    for (let i=0; i<grass.length; i++) {
        vertex(x(G[grass[i]][0]), y(G[grass[i]][1]));
    }
    endShape();
}

function drawSand(sand) {
    stroke(sandColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    for (let i=0; i<sand.length; i++) {
        vertex(x(G[sand[i]][0]), y(G[sand[i]][1]));
    }
    endShape();
}

function drawWater(water) {
    let gradient = drawingContext.createLinearGradient(1,y(-.06), 1,y(G[7][1]));
    gradient.addColorStop(0, waterColor);
    if (night==="1") gradient.addColorStop(1, '#2e2e5e');
    else gradient.addColorStop(1, '#6f6fdc');
    drawingContext.fillStyle = gradient;
    
    beginShape(TESS);
    for (let i=0; i<water.length; i++) {
        vertex(x(water[i][0]), y(water[i][1]));
    }
    endShape(CLOSE);
}

function drawMainUI() {
    // headline
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(.3 * M);
    fill(green);
    text("The ultimate Golf-Game", x(2.925), y(2.4));

    // nightmode button
    rectMode(CORNER);
    fill(nightColor);
    strokeWeight(1);
    rect(x(6.6), y(2.35), .2 * M, .2 * M);
    rect(x(6.35), y(2.35), .2 * M, .2 * M);
    // rect(x(6.1), y(2.35), .2 * M, .2 * M);

    if (night==="1") {
        image(homeB, x(6.6), y(2.35), .2 * M, .2 * M);
        image(moon, x(6.35), y(2.35), .2 * M, .2 * M);
        // image(tutB, x(6.1), y(2.35), .2 * M, .2 * M);

    }
    else {
        image(homeW, x(6.6), y(2.35), .2 * M, .2 * M);
        image(sun, x(6.35), y(2.35), .2 * M, .2 * M);
        // image(tutW, x(6.1), y(2.35), .2 * M, .2 * M);
    }
}

function drawGameUI() {

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
    textStyle(NORMAL);
    text("NEW", x(-.3), y(-.75));
    text("RESET", x(6.15), y(-.75));
}

function drawForeground(flagHeight) {
    //Flag
    stroke(0);
    strokeWeight(1);
    fill(red);
    beginShape(TRIANGLES);
    vertex(x(5.25), y(flagHeight+1.2));
    vertex(x(5.25), y(flagHeight+1.02));
    vertex(x(5.25+(vWind*3.6)/100), y(flagHeight+1.11));
    endShape();

    stroke(gray1);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    vertex(x(5.25), y(flagHeight));
    vertex(x(5.25), y(flagHeight+1.2));
    endShape();

    // Tee
    strokeWeight(0);
    fill(gray2);
    beginShape(TESS);
    vertex(x(ballRest[0]+ballRadius/2), y(ballRest[1]));
    vertex(x(ballRest[0]-ballRadius/2), y(ballRest[1]));
    vertex(x(ballRest[0]), y(0));
    endShape(CLOSE);

    // Golf club
    let clubAnchor = [clubRest[0], 1.2];
    // stop club from being pull back more than 90°
    if (clubPos[1] > clubAnchor[1]) clubPos[1] = clubAnchor[1];
    let club = [clubPos[0]-clubAnchor[0], clubPos[1]-clubAnchor[1]];
    let lenght = Math.sqrt(Math.pow(club[0],2)+Math.pow(club[1],2));

    if (lenght < .8) {
        clubPos = [clubAnchor[0] + (.8/lenght) * (club[0]),
            clubAnchor[1] + (.8/lenght) * (club[1])];
    }
    if (lenght > 1.12) {
        clubPos = [clubAnchor[0] + (1.12/lenght) * (club[0]),
            clubAnchor[1] + (1.12/lenght) * (club[1])];
    }

    if (l != null) {
        console.log("AAA")
        if (lenght !== l) {
            clubPos = [clubAnchor[0] + (l / lenght) * (club[0]),
                clubAnchor[1] + (l / lenght) * (club[1])];
        }
    }

    stroke(gray1);
    strokeWeight(5);
    beginShape(LINES);
    vertex(x(clubPos[0]), y(clubPos[1]));
    vertex(x(clubAnchor[0]), y(clubAnchor[1]));
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

function windowResized() {					/* responsive part */
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    M= (16.7/25.5)*canvasWidth/5;
}
