/* template GTAT2 Game Technology & Interactive Systems */
/*
Elisabeth Kintzel, s0574186
Übung 1, 12. Oktober 2021, 00:00
 */
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

/*let resetButton;
let newButton;*/

let canvasBottom;
let floor;

let playerPos;
let ballX;
let ballY;
let clubPos;

let skyColor = [220, 235, 255];
let grassColor = [24, 201, 24];
let dirtColor = [245, 170, 66];
let sandColor = [255, 246, 31];

function calcVars(){
	canvasBottom = canvasHeight*0.8;
	floor = canvasBottom - canvasHeight*0.1;

	playerPos = canvasWidth*0.9;
	ballX=playerPos-canvasHeight*0.015;
	ballY=floor-canvasHeight*0.015;
	clubPos = canvasWidth*0.9;
}

function setup() {	/* here are program-essentials to put */
	calcVars()
	createCanvas(windowWidth, windowHeight);

	/*resetButton = createButton('RESET');
	resetButton.position(20, canvasBottom+20);

	newButton = createButton('NEW');
	newButton.position(120, canvasBottom+20);*/
}



function draw() {							/* here is the dynamic part to put */
	/* administrative work */
	
	/* calculations */
	
	/* display */
	
	stroke(0);
	strokeWeight(1);
	fill(skyColor);
	rectMode(CORNER);
	rect(20, 20, canvasWidth-40, canvasBottom-20);

   	drawFloor();
	drawWater();
	drawSand();
	drawGrass();
	drawPerson();
	drawFlag();
	drawBall();
}
function drawFloor() {
	noStroke();
	fill(dirtColor);
	beginShape(TESS);
	//Sand Triangle
	vertex(20, canvasBottom);
	vertex(20, floor-canvasHeight*0.15);
	vertex(canvasWidth*0.1, floor);
	//Hole
	vertex(canvasWidth*0.15, floor);
	vertex(canvasWidth*0.15, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.15+canvasWidth*0.02, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.15+canvasWidth*0.02, floor);
	//Water Hole
	vertex(canvasWidth*0.25, floor);
	vertex(canvasWidth*0.25+canvasWidth*0.01, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.25+canvasWidth*0.04, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.25+canvasWidth*0.05, floor);
	//Hill
	vertex(canvasWidth*0.4, floor);
	vertex(canvasWidth*0.5, floor-canvasHeight*0.1);
	vertex(canvasWidth*0.6, floor);

	vertex(canvasWidth-20, floor);
	vertex(canvasWidth-20, canvasBottom);
	endShape(CLOSE);
}
function drawWater() {
	stroke(100, 100, 255);
	strokeWeight(3);
	fill(150, 150, 255);
	beginShape(TESS);
	vertex(canvasWidth*0.251, floor+canvasHeight*0.005);
	vertex(canvasWidth*0.25+canvasWidth*0.01, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.25+canvasWidth*0.04, floor+canvasHeight*0.04);
	vertex(canvasWidth*0.25+canvasWidth*0.049, floor+canvasHeight*0.005);

	endShape(CLOSE);
}
function drawSand() {
	stroke(sandColor);
	strokeWeight(5);
	noFill();
	beginShape(TESS);
	vertex(20, floor-canvasHeight*0.15);
	vertex(canvasWidth*0.1, floor);
	vertex(canvasWidth*0.15, floor);
	endShape();
}
function drawGrass(){
	stroke(grassColor);
	strokeWeight(5);
	noFill();
	beginShape(TESS);
	//between hole - water
	vertex(canvasWidth*0.15+canvasWidth*0.02, floor);
	vertex(canvasWidth*0.25, floor);
	endShape();
	beginShape(TESS);
	//before water
	vertex(canvasWidth*0.25+canvasWidth*0.05, floor);
	vertex(canvasWidth*0.4, floor);
	vertex(canvasWidth*0.5, floor-canvasHeight*0.1);
	vertex(canvasWidth*0.6, floor);
	vertex(canvasWidth-20, floor);
	endShape();
}

function drawPerson() {
	//"Person"
	stroke(0);
	strokeWeight(1);
	fill(50);
	beginShape(QUADS);
	vertex(playerPos-canvasWidth*0.02, floor-canvasHeight*0.15);
	vertex(playerPos+canvasWidth*0.02, floor-canvasHeight*0.15);
	vertex(playerPos-canvasWidth*0.02, floor);
	vertex(playerPos+canvasWidth*0.02, floor);
	endShape(CLOSE);
	//head
	rectMode(CENTER);
	circle(playerPos, floor-canvasHeight*0.15-canvasWidth*0.015, canvasWidth*0.02);

	// Golf club
	fill(255, 68, 31);
	rectMode(CORNER);
	rect(playerPos, floor - canvasHeight*0.12, canvasWidth*0.005, canvasHeight*0.12);
}
function drawFlag() {
	stroke(50);
	strokeWeight(3);
	noFill();
	beginShape(TESS);
	vertex(canvasWidth*0.14, floor);
	vertex(canvasWidth*0.14, floor-canvasHeight*0.25);
	endShape();

	strokeWeight(1);
	fill(255, 68, 31);
	beginShape(TRIANGLES);
	vertex(canvasWidth*0.14, floor-canvasHeight*0.25);
	vertex(canvasWidth*0.14, floor-canvasHeight*0.20);
	vertex(canvasWidth*0.1, floor-canvasHeight*0.225);
	endShape();
}
function drawBall() {
	// Golf ball
	fill(255, 68, 31);
	rectMode(CENTER);
	circle(ballX, ballY, canvasHeight*0.03);
}

function windowResized() {					/* responsive part */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  calcVars();
  resizeCanvas(windowWidth, windowHeight);

}
