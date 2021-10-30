/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 2, 19. Oktober 2021, 00:00
 */

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

// Scale "Maßstab"
let M= (16.7/25.5)*canvasWidth/5;
// ratio to convert the centimeter of the printed picture to the given Scale
let ratio = 5/16.7;
// Coordinates transformation cartesian<->internal
let iO=[22.5*ratio, 7.5*ratio];
// Coordinates collection of Ground
let G = [
    // Start point
    [0, 0],         // 0
    [-2.5, 0],      // 1
    [-2.5, -1.4],   // 2
    [22,-1.4],      // 3
    //Sand Hill
    [22, 2.9],      // 4
    [19,0],         // 5
    //Hole
    [16.9,0],       // 6
    [16.9,-.8],     // 7
    [16.3, -.8],    // 8
    [16.3, 0],      // 9
    // Water Hole
    [13.2, 0],      // 10
    [13, -.8],      // 11
    [11.4, -.8],    // 12
    [11.2, 0],      // 13
    //Hill
    [9.5, 0],       // 14
    [6.5, 1.5],     // 15
    [3.5, 0]        // 16
];

let ballPos = [0, 0];

let skyColor = '#dcebff';
let grassColor = '#18c918';
let dirtColor = '#f5aa42';
let sandColor = '#fff61f';
let waterColor = '#9696ff';

let resetButton;
let newButton;

function setup() {	/* here are program-essentials to put */
    createCanvas(windowWidth, windowHeight);

    resetButton = createButton('reset');
    resetButton.position(x(22), y(-2));
    resetButton.size(3*ratio*M, ratio*M);
    resetButton.mousePressed(resetB);
    resetButton.style("color", '#FFFFFF');
    resetButton.style("background-color", '#e34132');

    newButton = createButton('new');
    newButton.position(x(.5), y(-2));
    newButton.size(3*ratio*M, ratio*M);
    newButton.mousePressed(newB);
    newButton.style("color", '#FFFFFF');
    newButton.style("background-color", '#35e332');

}

function draw() {							/* here is the dynamic part to put */
	/* administrative work */

	/* calculations */

	/* display */
    stroke(0);
    strokeWeight(1);

    fill(skyColor);
    beginShape();
    vertex(x(22), y(7));
    vertex(x(-2.5), y(7));
    vertex(x(-2.5), y(-1.4));
    vertex(x(22), y(-1.4));
    endShape(CLOSE);

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
    vertex(x(G[11][0]), y(G[11][1]));
    vertex(x(G[12][0]), y(G[12][1]));
    vertex(x(11.25), y(-.2));
    endShape(CLOSE);

    stroke(grassColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    //Points between which the grass line needs to be drawn
    var grass = [9,10, 13,14, 14,15, 15,16, 16,0, 0,1];
    for (i=0; i<grass.length; i++) {
        vertex(x(G[grass[i]][0]), y(G[grass[i]][1]));
    }
    endShape();

    stroke(sandColor);
    strokeWeight(5);
    noFill();
    beginShape(LINES);
    var sand = [4, 5, 5, 6];
    for (i=0; i<sand.length; i++) {
        vertex(x(G[sand[i]][0]), y(G[sand[i]][1]));
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
    console.log("reset");
}

function newB(){
    console.log("new");
}

function windowResized() {					/* responsive part */
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    resizeCanvas(windowWidth, windowHeight);
    resetButton.position(x(22), y(-2));
    resetButton.size(3*ratio*M, ratio*M);
    newButton.position(x(.5), y(-2));
    newButton.size(3*ratio*M, ratio*M);
    M= (16.7/25.5)*canvasWidth/5;
}
