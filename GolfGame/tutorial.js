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

    ballPos = ballRest.slice();

    if (sessionStorage.getItem("night") === null) {
        sessionStorage.setItem("night", "1");
    }
}

function draw() {
    drawBackground(G);
    drawGrass([1,2, 5,6])
    drawMainUI();
    vWind=30/3.6;
    drawForeground(0);
}


