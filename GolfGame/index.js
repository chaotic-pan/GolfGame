/* template GTAT2 Game Technology & Interactive Systems 
Liz Kintzel
 */

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

function setup() {
    createCanvas(windowWidth, windowHeight);

    if (sessionStorage.getItem("night") === null) {
        sessionStorage.setItem("night", "1");
    }
   
}

function draw() {
    drawBackground(G);
    drawGrass([1,2, 5,6])
    drawMainUI();
    drawLevels();
    vWind=30/3.6;
    drawForeground(0);
}

function drawLevels() {
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
    textStyle(NORMAL);
    textSize(0.15 * M);
    text("Level 1", x(3), y(1.6));
    text("Level 2", x(3), y(1.25));
    text("Level 3", x(3), y(0.9));
    text("Level 4", x(3), y(0.55));
}

