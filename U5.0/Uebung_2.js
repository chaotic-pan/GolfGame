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

var ballPos;							// Golfball
var dBall = 0.1;								// Balldurchmesser real: 3,2cm => 0.032m
var colorBall = "#aaaa00";	

var xPutter, yPutter;							// Golfschläger (Putter)
var gammaPutter = 0;							// Winkel des Golfschlägers
var lengthPutter = 0.35*bodyHeight;
var dPutter = 0.1;								// Durchmesser Golfschläger real: 3,2cm => 0.032m
var colorPutter = "#aaaaaa";	
var Putter, putter;								// Schläger, Maus sensibel

let red = '#e34132';
let green = '#35e332';

const states = {
    OFF: "off",
    PLANE_1: {
        TOL: "1. Ebene, to the left",
        TOR: "1. Ebene, to the right"
    },
    SLOPE_1: "1. schiefe Ebene"
};
let state = states.OFF;

v0=2;

function setup() {								/* prepare program */
  	createCanvas(windowWidth, windowHeight);
	evaluateConstants(90, 90);					// Erzeuge elementare Konstanten
	M = 0.85*canvasWidth/playgroundWidth; 		// dynamischer Maßstab
	
	xi0 = 25.0*canvasWidth/29.7;				// Koordinatenursprung (willkürlich gewählt)
	yi0 = 9*canvasHeight/21.0;

	// Starteinstellungen
	xPutter = 0;								// Startlage Putter bezügl. "0"
	yPutter = dPutter/2;
	radiusPutter = lengthPutter;

	// Startlage Golfball
	ballPos = [0,  dBall/2];
}

function draw() {
/* administration */
    clear();
	push();										// Style sichern
	    //headline
	    stroke(0);
        strokeWeight(1);
		textAlign(CENTER, CENTER);
		textSize(3.5*fontSize);
		fill(grassColor);
		text("The ultimate Golf-Game", 50*gridX, 5*gridY);

        //buttons
        rectMode(CORNER)
		textSize(2.0*fontSize);     							// fontSize responsive (in evaluateConstants.js)
		fill(green);	// NEW-Button
		rect(79*gridX, 50*gridY, buttonWidth, buttonHeight);      	// gridX, gridY, buttonWidth, buttonHeight: responsive (in evaluateConstants.js)
		fill(red);	// RESET-Button
        rect(5.5*gridX, 50*gridY, buttonWidth, buttonHeight);      	// gridX, gridY responsive (in evaluateConstants.js)

		fill(255);
        strokeWeight(0);
		text("NEW", 79*gridX+0.5*buttonWidth, 50*gridY+0.5*buttonHeight);
		text("RESET", 5.5*gridX+0.5*buttonWidth, 50*gridY+0.5*buttonHeight);

		if (mouseIsPressed) {
                if (mouseX>=79*gridX && mouseX<=79*gridX+buttonWidth &&
                    mouseY>=50*gridY && mouseY<=50*gridY+buttonHeight){
                    newB();
                }
                if (mouseX>=5.5*gridX && mouseX<=5.5*gridX+buttonWidth &&
                    mouseY>=50*gridY && mouseY<=50*gridY+buttonHeight){
                    resetB();
                }
            }
	pop();
		
		
/* calculation */
    if (state===states.PLANE_1.TOL && ballPos[0]>=P[1][0]) {
            ballPos=P[1].slice();
            ball0=ballPos.slice();
            t=0;
            state = states.SLOPE_1;
        }
        if (state===states.SLOPE_1 && v<=0) {
            ball0=ballPos.slice();
            t=0
            state = states.PLANE_1.TOR;
        }
        if (state===states.PLANE_1.TOR && ballPos[0]<=P[0][0]) {
            ballPos=P[0].slice();
            state = states.OFF;
        }

     switch (state) {
            case states.OFF: {
                //console.log(state);
                ball0=ballPos.slice();
                t=0;
                v = v0;
                break;
            }
            case states.PLANE_1.TOL:
            case states.PLANE_1.TOR:{
                //console.log(state);
                let d;
                if (state===states.PLANE_1.TOL) d=1;
                else d=-1;
                t= t+ dt;
                ballPos[0] = ball0[0] +d*(v0 * t);
                break;
            }
            case states.SLOPE_1: {
                //console.log(state);
                /*v = -((g * Math.sin(b)) * (t*t)/2) + v0 * t;
                ballPos[0] = v + ball0[0];
                ballPos[1] = v * b;*/
                vy = v0y - g * dt;
                ballPos[0] = ball0[0] + v0x*dt;
                ballPos[1] = ball0[1] + vy*dt;
                break;
            }
        }

/* display */
	push();
	translate(xi0, yi0);
	scale(1, -1);
	    // Playground darstellen
		playGround();

        // Golfer
		push();
		// Verschieben in Drehpunkt
		translate(0, (lengthPutter + dPutter/2)*M);
		rotate(PI/10);
		    // Drehpunkt
			noFill();
			ellipse(0,0, 0.05*M);
			// Golfschläger
			fill(colorPutter);
			stroke(colorPutter);
			push();
			    // Verschieben aus dem Drehpunkt
				translate(0, -lengthPutter*M);
				ellipse(0, 0, dPutter*M);
				strokeWeight(3);
				// Schlägerlänge reduziert
				line(0, 0, 0, 0.7*lengthPutter*M);
			pop();			
		pop();

		// Golfball
		fill(240);
		strokeWeight(1);
		ellipse(ballPos[0]*M, ballPos[1]*M, dBall*M);

        // markiert den Nullpunkt des Koordinatensystems
		push();
			stroke(red);
			strokeWeight(2);
			line(10, 0, -10, 0);
			line(0, 10, 0, -10);
		pop();
	pop();
}

function resetB(){
    console.log("reset");
    //state=states.OFF;
    //ballPos = [0, 0];
}

function newB(){
    console.log("new");
    // wtf JS???? lemme just compare a goddamn array
    //if (JSON.stringify(ballPos) === "[0,0]") {
        state = states.PLANE_1.TOL;
    //}
}

function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
