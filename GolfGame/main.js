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
    // Hole
    [4.89, 0],       // 2
    [4.90, -.24],    // 3
    [5.06,-.24],     // 4
    [5.07,0],        // 5
    
    [6.6, 0],       // 6
    [6.6,-.42],     // 7
];

let skyColor; let grassColor; let dirtColor; let sandColor; let waterColor;
let red; let green; let nightColor;
let gray1; let gray2; let gray3;
let textColor; let nightText;

let night = true;


function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {

    drawMain();
    drawMainUI();

}

function x(coord){
    return (-coord+iO[0])*M;
}

function y(coord){
    return (-coord+iO[1])*M;
}

function mousePressed() {
   
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
   
    if (mouseX >= x(6.6) && mouseX <= x(5.9) &&
        mouseY >= y(2.3) && mouseY <= y(2.15)) {
        night=!night;
    }

}

function drawMainUI() {
    clear();

    drawMain();

    // headline
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(.3 * M);
    fill(green);
    text("The ultimate Golf-Game", x(2.925), y(2.4));

    
    // buttons
    stroke(0);
    strokeWeight(1);
    rectMode(CORNER);
    fill(green);
    rect(x(3.5), y(1.75), M, .3* M);
    rect(x(3.5), y(1.4), M, .3* M);
    rect(x(3.5), y(1.05), M, .3* M);
    rect(x(3.5), y(0.7), M, .3* M);
    
    fill(textColor);
    strokeWeight(0);
    textAlign(CENTER);
    textSize(0.15 * M);
    text("Level 1", x(3), y(1.6));
    text("Level 2", x(3), y(1.25));
    text("Level 3", x(3), y(0.9));
    text("Level 4", x(3), y(0.55));
    
    fill(nightColor);
    rectMode(CORNER);
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

function drawMain(){
    
    if (night) {
        background('#262626');
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

    stroke(0);
    strokeWeight(1);
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
    let grass = [1,2, 5,6];
    for (let i=0; i<grass.length; i++) {
        vertex(x(G[grass[i]][0]), y(G[grass[i]][1]));
    }
    endShape();
    
    // Flag
    stroke(0);
    strokeWeight(1);
    fill(red);
    beginShape(TRIANGLES);
    vertex(x(5.25), y(1.2));
    vertex(x(5.25), y(1.02));
    vertex(x(5.55), y(1.11));
    endShape();

    stroke(gray1);
    strokeWeight(5);
    beginShape(LINES);
    vertex(x(5.25), y(0));
    vertex(x(5.25), y(1.2));
    endShape();

    // Golf ball
    stroke(0);
    strokeWeight(1);
    fill(gray3)
    rectMode(CENTER);
    let ballRadius = .06;
    circle(x(0), y(ballRadius), 2*ballRadius*M);

    // Golf club
    let clubRadius = .08;
    let clubRest = [-ballRadius-clubRadius, clubRadius];
    stroke(gray1);
    strokeWeight(5);
    beginShape(LINES);
    vertex(x(clubRest[0]), y(clubRest[1]));
    vertex(x(clubRest[0]), y(1.2));
    endShape();

    strokeWeight(0);
    fill(gray2);
    rectMode(CENTER);
    circle(x(clubRest[0]), y(clubRest[1]), 2*clubRadius*M);

  
}

function windowResized() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    M= (16.7/25.5)*canvasWidth/5;
}
