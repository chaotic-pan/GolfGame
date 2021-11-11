/******************************* 4. Übung *******************************************/
/* Autor: Dr.-Ing. V. Naumburger	                                                */
/* Datum: 25.10.2021                                                                */
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
var t, dt;                						// Zeitvariable, Increment der Zeitv.
var timeScale = 0.1;
var g = -9.81;									// Erdbeschleunigungskonstante [m/s²], wirksame und aktuelle Erdbeschleunigungskonstante

var s = 0, vs = 0;								// Weg, Weggeschwindigkeit

var xBall, yBall;								// Golfball
var dBall = 0.1;								// Balldurchmesser real: 3,2cm => 0.032m
var colorBall = "#aaaa00";	
var vxBall, vyBall;								// Ballgeschwindigkeit
var vx0Ball = -2.8; 							// Startgeschwindigkeit 300 km/h = 300/3,6 m/s
var vy0Ball = 0;

var xPutter, yPutter;							// Golfschläger (Putter)
var gammaPutter = 0;							// Winkel des Golfschlägers
var lengthPutter = 0.35*bodyHeight;
var dPutter = 0.1;								// Durchmesser Golfschläger real: 3,2cm => 0.032m
var colorPutter = "#aaaaaa";	

var NewTrial, newTrial = false;					// Push-Button ""neuer Versuch", Variable
var Reset, reset, START, INIT;					// Reset-Button, Variable, Start der Bewegungsberechnung
var Debug, debug, Next, next;					// Debugging Buttons

var status = "start";							// state-machine

var Putter, putter;								// Schläger, Maus sensibel

function setup() {								/* prepare program */
  	createCanvas(windowWidth, windowHeight);
	evaluateConstants(90, 90);					// Erzeuge elementare Konstanten
	M = 0.85*canvasWidth/playgroundWidth; 		// dynamischer Maßstab
	
	xi0 = 25.0*canvasWidth/29.7;				// Koordinatenursprung (willkürlich gewählt)
	yi0 = 15.3*canvasHeight/21.0;

	frameRate(frmRate); 						// setzen der Bildwechselfrequenz
	timeScale = 1; //200/abs(vx0Ball*M);				// schnelle Bewegung
	
	// Objectdeclarations
	NewTrial = new PushButton(80, 90, "NEW", '#00ff00', true);		// xPos, yPos, onName, onColor, modus
	Reset = new PushButton(10, 90, "Reset", '#ff0000', true);
	Debug = new ToggleButton(40, 90, "debug", '#00ff00', "run", '#ff0000');						//xPos, yPos, onName, onColor, offName, offColor
	Next = new PushButton(50, 90, "next", '#00ff00', true);	
	START = true;
	INIT = false;
	t = 0; 
	dt = 0;
	xPutter = 0;								// Startlage Putter bezügl. "0"
	yPutter = dPutter/2;
	radiusPutter = lengthPutter;
	xBall = 0, yBall = dBall/2;					// Startlage Golfball	
	vxBall = 0; vyBall = 0;						// Startgeschwindigkeit Golfball
	
	for (var i = 1; i < P.length - 1; i++)		// Berechnung der Neigungswinkel und Längen der Geradenstücke
		{
			beta_i[i] = atan2((P[i+1][1]-P[i][1]), (P[i+1][0]-P[i][0]));		// Segmentwinkel bezgl. x-Achse
			len_i[i] = sqrt(sq(P[i+1][1]-P[i][1]) + sq(P[i+1][0]-P[i][0]));		// Segmentlänge
			g_i[i] = g*sin(beta_i[i]);											// gewichtete Gravitationskonstante
			//console.log(i+" beta: "+degrees(beta_i[i])+"° l: "+len_i[i]);
		}
	beta_i[0] = PI;											// Neigungswinkel 1. plane
	len_i[0] = sqrt(sq(P[1][1]-N[1]) + sq(P[1][0]-N[0]));		// Länge 1. plane
	g_i[0] = 0;
	console.log(0+" beta: "+degrees(beta_i[0])+"° l: "+len_i[0]);
}

function draw() {
	background(255);							// Hintergrund: weiß
/* administration */
	push();
		textSize(2.5*fontSize);
		textAlign(CENTER);
		text("(4.) Das ultimative Golf-Spiel", 50*gridX, 10*gridY);
		textSize(fontSize);
		text("timeScale: "+timeScale, 50*gridX, 12*gridY);
		text("t: "+nf(t,3,2), 10*gridX, 20*gridY);
	pop();
	
	newTrial = NewTrial.drawButton(true);				// NewTrial-Button Darstellen und auswerten
	if (newTrial) 
		{
			newTrial = false;							// Pushbutton
			START = true;
			INIT = true;
			status = "start";
		}

	reset = Reset.drawButton(true);
	if(reset)
		{
			reset = false;								// Pushbutton
			START = true;
			INIT = false;
			status = "start";
			t = 0;
			dt = 0;
			s = 0;
			xBall = 0;									// Startlage Golfball
			yBall = dBall/2;
		}
		
	debug = Debug.drawButton()
	next = Next.drawButton(debug);
			
	if(debug)
		{
			textSize(fontSize);
			text("status: "+status, 14*gridX, 20*gridY);
			text("s: "+nf(s,2,3) + "          vs: "+nf(vs,2,3), 14*gridX, 22*gridY);
			text("xBall: "+nf(xBall,2,3) + "     yBall: "+nf(yBall,2,3), 14*gridX, 24*gridY);
			text("\u03b2: "+nf(beta,3,0), 14*gridX, 26*gridY);
		}

/* calculation */
	if (START)
		{
			beta = PI;									// Startwerte für Darstellung setzen
			len = len_i[0];
			Point = N;
			if (INIT)									// Programm wird mit NEW-Button gestartet
				{
					INIT = false;
					START = false;
					t = 0;
					dt = timeScale/frmRate;				// Zeitincrement
					xBall = 0;							// Startlage Golfball
					yBall = dBall/2;
					vxBall = vx0Ball;					// Startgeschwindigkeit setzen
					vyBall = 0;
				}
		}
	else
		{
			if (next || !debug)
				{
					next = false;						// Schrittbetrieb
					if(status == "start")										
						{	// rollt der Ball oder fliegt der Ball nach dem Start?
							if (yBall <= dBall/2 && vyBall == 0)
								{
									status = "1.plane";					// Ball bleibt auf der Ebene
									s = 0;								// Anfangsbed. für calculation
									vs = abs(vxBall);
									Point = N;							// Anfangsbed. für display
									//console.log("start"+" "+xBall);
								}				
							else
								{
									status = "flight";					// Ball startet im schrägen Wurf
									//console.log("flight"+" "+xBall);
								}	
						}
						
					switch (status)										// Berechnung vorbereiten
						{					
							case "1.plane":		if (len_i[0] > s && xBall <= P[0][0])
													{	// Ortsberechnung
														g_ = g_i[0];
														beta = beta_i[0];
														len = len_i[0];
														xBall0 = N[0];
														console.log("1.plane");		
													}
												else
													{	// Übergang 1.plane -> 1.slope
														status = "1.slope";				// Status ändern
														console.log("goto 1.slope");
														s = 0;							// Weg rücksetzen
														xBall0 = P[1][0];				// für calculation
														beta = beta_i[1];				// für calculation & display
														len = len_i[1];
														Point = P[1];					// für display
													}

												if(xBall >= P[0][0])					// Endbedingung rechter Rand
													{
														status = "end";
														dt = 0;							// Stop
														beta = PI;
														len = len_i[0];
														Point = P[0];
														xBall0 = P[0][0];
														s = 0;
														//console.log("*"+P[0][0]);
													} 
												break;
							
							case "1.slope":		if (len_i[1] > s && s >= 0) 
													{	// Zeitfunktion berechnen
														g_ = g_i[1];
														beta = beta_i[1];
														len = len_i[1];
														xBall0 = P[1][0];
														//console.log("1.slope");		
													}
												else
													{
														if (s >= len_i[1])
															{	// Übergang 1.slope -> 2.slope
																status = "2.slope";
																//console.log("goto 2.slope"+" "+len_i[2]);
																s = 0;
																beta = beta_i[2];
																len = len_i[2];
																Point = P[2];
																xBall0 = P[2][0];
																break;
															}
														if (s <= 0) 
															{	// Übergang 1.slope -> 1.plane
																status = "1.plane";
																console.log("goto 1.plane");
																s = len_i[0];
																beta = PI;
																len = len_i[0];
																xBall0 = N[0];
																Point = N;
															}
													}		
												break;
		
							case "2.slope":		if (len_i[2] > s && s >= 0) 
													{
														g_ = g_i[2];
														beta = beta_i[2];
														len = len_i[2];
														xBall0 = P[2][0];
														console.log("2.slope");		
													}
												else
													{
														if (s >= len_i[2])
															{	// Übergang 2.slope -> 2.plane
																status = "2.plane";
																console.log("goto 2.plane"+" "+len_i[2]);
																s = 0;
																beta = beta_i[3];
																len = len_i[3];
																xBall0 = P[3][0];
																Point = P[3];
																break;
															}
														if (s <= 0) 
															{
																status = "error";				// Fehler: Rückkehr auf die 1. slope ist nicht möglich!
																console.log("error");
																s = 0;
																xBall0 = N[0];
															}
													}		
												break;

							case "2.plane":		if (len_i[3] > s)
													{	// Ortsberechnung
														g_ = g_i[3];
														beta = beta_i[3];
														len = len_i[3];
														xBall0 = P[3][0];
														console.log("2.plane");		
													}
												else
													{	// Ende im Wasser
														status = "water";				// Status ändern
														console.log("in water");
														s = 0;							// Weg rücksetzen
														xBall0 = P[3][0];
														dt = 0;
													}
												break;
							
						}
		
					switch (status)															// Berechnung ausführen
						{
							case "1.plane":
							case "1.slope":
							case "2.slope":
							case "2.plane":
							case "3.plane":
							case "4.plane":
							case "3.slope": 	vs = vs + g_*dt;							// Wegberechnung für Rollbewegung
												s = s + vs*dt;
												xBall = xBall0 + s*cos(beta);
												yBall = s*sin(beta);
												break;
						}

					t = t + dt;									// Zeit incrementieren	
				}	
		}

/* display */
	push();
	translate(xi0, yi0);
	scale(1, -1);
		playGround();								// Playground darstellen

		push();										// Golfer
		translate(0, (lengthPutter + dPutter/2)*M);				// Verschieben in Drehpunkt
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
		
		switch (status)
			{
				case "start": 
				case "1.plane": 
				case "1.slope":
				case "2.slope": 
				case "2.plane":
				case "end": 		ballOnSlope(s, len, beta, Point);
									//console.log("on 3.slope");
									break;
				case "water":		push();
										translate((P[4][0]+P[5][0])*M/2, (G[6][1]+0.5*dBall)*M);
										ellipse(0, 0, dBall*M);
									pop();
									break;
			}

		drawZeroCross();								// markiert den kartesischen Nullpunkt
	pop();
}

function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
