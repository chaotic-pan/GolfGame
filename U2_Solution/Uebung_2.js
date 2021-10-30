/******************************* 2. Übung *******************************************/
/* Autor: Dr.-Ing. V. Naumburger	                                                */
/* Datum: 14.10.2021                                                                */
/************************************************************************************/

/*************************** Variablendeklaration ***********************************/
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var M;											// Maßstab
var xi0, yi0;                                	// Koordinatenursprung intern
var basicLength = 5;							// Grundlänge in [m]
var bodyHeight = 1.8;							// Körpergröße in [m]
var playgroundWidth = basicLength*23.9/16.9;	// Playgroundbreite in [m]

var x0, y0;										// Koordinatenursprung	
var frmRate = 60;      							// Screen-Refreshrate 

var xBall, yBall;								// Golfball
var dBall = 0.1;								// Balldurchmesser real: 3,2cm => 0.032m
var colorBall = "#aaaa00";	

var xPutter, yPutter;							// Golfschläger (Putter)
var gammaPutter = 0;							// Winkel des Golfschlägers
var lengthPutter = 0.35*bodyHeight;
var dPutter = 0.1;								// Durchmesser Golfschläger real: 3,2cm => 0.032m
var colorPutter = "#aaaaaa";	
var Putter, putter;								// Schläger, Maus sensibel

function setup() {								/* prepare program */
  	createCanvas(windowWidth, windowHeight);
	evaluateConstants(90, 90);					// Erzeuge elementare Konstanten
	M = 0.85*canvasWidth/playgroundWidth; 		// dynamischer Maßstab
	
	xi0 = 25.0*canvasWidth/29.7;				// Koordinatenursprung (willkürlich gewählt)
	yi0 = 15.3*canvasHeight/21.0;

	// Starteinstellungen
	xPutter = 0;								// Startlage Putter bezügl. "0"
	yPutter = dPutter/2;
	radiusPutter = lengthPutter;
	xBall = 0;									// Startlage Golfball
	yBall = dBall/2;
}

function draw() {
	background(255);							// Hintergrund: weiß
/* administration */
	push();										// Style sichern
		textAlign(CENTER, CENTER);
		textSize(2.5*fontSize);
		text("Das ultimative Golf-Spiel", 50*gridX, 10*gridY);

		textSize(2.0*fontSize);     							// fontSize responsive (in evaluateConstants.js)
		fill('#00ff00');	// NEW-Button
		rect(80*gridX, 90*gridY, buttonWidth, buttonHeight);      	// gridX, gridY, buttonWidth, buttonHeight: responsive (in evaluateConstants.js)
		fill(0);
		text("NEW", 80*gridX+0.5*buttonWidth, 90*gridY+0.5*buttonHeight);
		fill('#ff0000');	// RESET-Button
		rect(10*gridX, 90*gridY, buttonWidth, buttonHeight);      	// gridX, gridY responsive (in evaluateConstants.js)
		fill(0);
		text("RESET", 10*gridX+0.5*buttonWidth, 90*gridY+0.5*buttonHeight);	
	pop();
		
		
/* calculation */

/* display */
	push();
	translate(xi0, yi0);
	scale(1, -1);
		playGround();								// Playground darstellen

		push();										// Golfer
		translate(0, (lengthPutter + dPutter/2)*M);		// Verschieben in Drehpunkt
		rotate(PI/10);
			noFill();								// Drehpunkt
			ellipse(0,0, 0.05*M);
			fill(colorPutter);						// Golfschläger
			stroke(colorPutter);
			push();
				translate(0, -lengthPutter*M);		// Verschieben aus dem Drehpunkt
				ellipse(0, 0, dPutter*M);
				strokeWeight(3);
				line(0, 0, 0, 0.7*lengthPutter*M);  // Schlägerlänge reduziert
			pop();			
		pop();
		
		fill(colorBall);							// Golfball
		ellipse(xBall*M, yBall*M, dBall*M);

		push();										// markiert den Nullpunkt des Koordinatensystems
			stroke(0);	
			strokeWeight(2);
			line(10, 0, -10, 0);
			line(0, 10, 0, -10);
		pop();
	pop();
}

function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
