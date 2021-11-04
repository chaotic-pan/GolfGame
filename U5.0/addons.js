/**************************** 2. Übung/add ons **************************************/
/* Autor: Dr.-Ing. V. Naumburger	                                                */
/* Datum: 08.10.2021                                                                */
/************************************************************************************/

/*************************** Variablendeklaration ***********************************/
/* Spielfeld */
//TODO mirror the coordsys
var G = [										// Playground Kontur
			[-0.82, -0.3],						// 0 - rechts verschoben
			[-0.82, 0],							// 1 - rechts verschoben
			[1.2, 0],							// 2
			[2.1, 0.4],						// 3
			[3.0, 0],							// 4
			[3.4, 0],							// 5
			[3.43, -0.2],						// 6
			[4.0, -0.2],						// 7
			[4.03, 0],							// 8
			[4.9, 0],							// 9
			[4.9, -0.2],						// 10
			[5.1, -0.2],						// 11
			[5.1, 0],							// 12
			[5.7, 0],							// 13
			[6.56, 0.9],						// 14
			[6.56, -0.3],						// 15
		];
let P = [
    G[1],           // 0
    G[2],           // 1
    G[3],           // 2
    G[4],           // 3
    G[5],           // 4
        //Water
    G[8],           // 5
    G[9],           // 6
        //Hole
    G[12],          // 7
    G[13],          // 8
    G[14],          // 9
];

let skyColor = '#dcebff';
let grassColor = '#18c918';
let dirtColor = '#f5aa42';
let sandColor = '#fff61f';
let waterColor = '#9696ff';

/***************************** Subroutines *******************************************/
function playGround()
	{
		//TODO fixx Canvas at upper border
	    // sky
	    push();
            stroke(0);
            strokeWeight(1);
            fill(skyColor);
            rect(-0.82*M, -.3*M, 7.38*M, 2*M);
        pop();

        // Wassergraben
		fill(waterColor);
		strokeWeight(0);
		rect(G[8][0]*M,G[7][1]*M, (G[5][0] - G[8][0])*M, 0.9*(G[5][1] - G[6][1])*M);

        // Playground
		fill(dirtColor);
		strokeWeight(0);
		beginShape();
			for (var i = 0; i < G.length; i++)
				//console.log(G[i]);
				vertex(G[i][0]*M,G[i][1]*M);
		endShape();

        // Rasen
		push();
			strokeWeight(5);
			noFill();
			push();
				stroke(grassColor);
				beginShape();
					for (var i = 1; i < 6; i++)
						//console.log(G[i]);
						vertex(G[i][0]*M,G[i][1]*M);
				endShape();
				line(G[8][0]*M,G[8][1]*M, G[9][0]*M,G[9][1]*M);
			pop();
			push();								// Sandberg
				stroke(sandColor);
				beginShape();
					for (var i = 12; i < 15; i++)
						//console.log(G[i]);
						vertex(G[i][0]*M,G[i][1]*M);
				endShape();
			pop();
		pop();		
	}
	
/*******************************************************/
/* Konstantendeklarationen                             */
/* basierend auf der aktuellen Fensterhöhe und         */
/* -breite                                             */
/*******************************************************/

var fontSize;									 // normierte Fontgröße, entnormierte F.


var normPixel, normPixelX, normPixelY, grid, gridX, gridY;
var buttonWidth, buttonHeight;
var backgroundColor, textColor;

function evaluateConstants()
  {
	normPixelX = width/1000.0;                // 1000 normierte Pixel = Fensterbreite
    normPixelY = height/1000.0;               // 1000 normierte Pixel = Fensterhöhe
    normPixel = sqrt(normPixelX*normPixelY);  // geom. Mittel
	fontSize = 12*normPixel;				// fontSizeNorm: 12 pixel
		
    /* Raster 100 x100 */
    gridX = width/100.0;                       // GridX = 1% Fensterbreite 
    gridY = height/100.0;                      // GridY = 1% Fensterhöhe
	grid = sqrt(gridX*gridY);
	buttonWidth = 15*gridX;                    // Buttonbreite 9% Fensterbreite, geändert: 27.03.2021
	buttonHeight = 5*grid;                    // Buttonhöhe 6% Fensterhöhe
  }



/*************************************************** controls *********************************************************/

function PushButton(xPos, yPos, onName, onColor, modus)
	{ // Anklicken mit der Maus erzeugt einen einmaligen Impuls, Button muss enabled werden!
		this.xPos = xPos;
		this.yPos = yPos;
		this.onName = onName;
		this.onColor = onColor;
		var OnColor = this.onColor;                 // Buttonfarbe
		var OffColor = manageColor(OnColor)[0];     // Textfarbe = Komplementärfarbe der Buttonfarbe
		var BlackWhite = manageColor(OnColor)[1];   // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		var WhiteBlack = manageColor(OffColor)[1];  // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		var textColor = BlackWhite;                 // Textfarbe
		var fillColor;
		this.modus = modus;                         // bestimmt ob, true = trigger oder false = solange mPressed
			
		this.drawButton = function(enable)          // inactive: gray
			{
				var x = this.xPos*gridX;
				var y = this.yPos*gridY;
				var fntSize = 22*normPixel;
				var pushB = false;
				
				//console.log("pushButton x: "+this.xPos+" "+x+" y: "+this.yPos+" "+y);
				push();
					rectMode(CORNER);
					textAlign(CENTER, CENTER);
					textStyle(BOLD);
					textFont('verdana', fntSize);
					fill(OnColor);

					if ((x < mouseX && x + buttonWidth > mouseX) && (y < mouseY && y + buttonHeight > mouseY))
						{
							//console.log("en: "+enable+" mP: "+mPressed+" mo: "+this.modus);
							//console.log("tS: "+tStarted+" tE: "+tEnded+" mP: "+mPressed);
							if ((mPressed) && enable)
								{
									fill(OffColor);        // Komplementärfarbe
									textColor = WhiteBlack;
									pushB = true;
								}
							else
								{
									pushB = false;
									textColor = BlackWhite;
								}
							if (mReleased || this.modus) mPressed = false; // Maus rücksetzen
						}
					else pushB = false;	
					
					// Buttongestaltung
					if (!enable) fillColor = '#aaaaaa'; else fillColor = OnColor;	
					stroke(textColor);
					fill(fillColor);
					rect(x, y, buttonWidth, buttonHeight, 5);   // Button
					noStroke();
					fill(textColor);
					text(this.onName, x+0.5*buttonWidth, y+0.5*buttonHeight);
				pop();
				return (pushB);
			}			
	}



/**************************************************/
/* Click & drag dreht/verlängert Handle           */
/*                                                */
/* Variablen: x, y (maßstabsrichtig - M)          */
/*            vx, vy (normiert - norm)            */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/**************************************************/

function Handle(M, D, R, dR, visible, c)
	{
		this.M = M;  			// Skalierung der Ortskoordinaten 
		this.D = D;   			// Durchmesser des sensiblen Bereiches
		this.R = R;				// Radius der Kreisbahn
		this.dR = dR;			// Schwankungsbreite +/- in %
		this.visible = visible; // Sichbarkeit
		this.c = c;

		var Head = new Circle(0.5*this.D, this.M, false, this.c, 'b');
		
		this.moveHandle = function (xPos, yPos, x, y)
			{ // Eingabe von Vektoren, z.B. Geschwindigkeiten etc. 
				var vLength = sqrt(sq(x) + sq(y));
				var vArc = atan2(y, x);
				var result;
				
				if (vLength > (1+0.01*dR)*R) vLength = (1+0.01*dR)*R;	// auf Variationsbreite beschränken
				if (vLength < (1-0.01*dR)*R) vLength = (1-0.01*dR)*R;
	
		        if (visible)
					{	// Darstellung Handle
						push();
					        stroke(this.c);
							strokeWeight(2);
					        fill(this.c);
					        translate(xi0+xPos*this.M,yi0-yPos*this.M);
					        rotate(-vArc);
									var l = vLength*this.M;
					        line(0,0,l,0);          					// Linie
							ellipse(l, 0, this.D*this.M);				// sensibler Kreis
				        pop();
					}
			result = Head.inCircle(x + xPos, y + yPos);
			x = result[1] - xPos;
			y = result[2] - yPos;
			return ([result[0], x, y, vLength, vArc]); // satus; kart.Koord. x, y; Pol.koord. Betrag, Winkel
			}	
	}

/**************************************************/
/* Click & drag verschiebt Circle                 */
/* Veränderliche: x, y, r (maßstabsrichtig)       */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/* Mode: nur Richtung x: 'x', nur Richtung y: 'y' */
/*       Richtung x und y: bel. Zeichen           */
/*       visible: sichtbar/unsichtbar             */
/**************************************************/

function Circle(r, M, visible, c, mode)
	{
		this.r = r;             // Radius!
		this.M = M;
		this.visible = visible; // boolean
		this.c = c;
		this.mode = mode;        // 'x', 'y' oder 'b'
		this.status = false;     // Bewegung des Kreises, ja: true
	 	var overBubble = false;
		 
		this.inCircle = function (xPos, yPos) // Pos in Metern und im kart. Koord.Syst.
			{
				var R = this.r;
				var Scale = this.M;
				var insideBubble;
				this.hover;         // Hilfsvariable, die die Info "mouseover" nach außen gibt
				var x, y;
				
				push();                 // Formatierung merken
				 /* Maus in der Ellipse? */
					if (sq(iXk(mouseX)-xPos*Scale) + sq(iYk(mouseY)-yPos*Scale) <= sq(R*Scale))
						{ // im Kreis, sensibler Kreis ist 1.5 mal größer als der sichtbare Kreis -> für kleine Mobilgeräte
							this.hover = true;  // Maus ist über dem Kreis
							//if (getMediaType() != 0) myCursor((xPos-1.5*R)*Scale, (yPos+1.5*R)*Scale); // Cursor als Hinweis für mobile, dass sensibles Element getouched ist
							if (mPressed)
								{
									//console.log("press: "+mPressed+" start: "+tStarted);
									mPressed = false;	
									mReleased = false; // muss rückgesetzt werden, um tEnded in Zeile 89 zu erkennen
									insideBubble = true;
									overBubble = true;
								}	
						}                                                   
					else
						{ // außerhalb des Kreises -> Koordinaten bleiben unverändert
							this.hover = false;  // Maus ist nicht über dem Kreis
							insideBubble = false;
						}
					x = xPos;
					y = yPos;								
					if ((insideBubble || this.status))
						{
							this.status = true;   // ermöglicht Kreisbewegung, auch wenn Maus außerhalb
							if (mDragged)
								{
									//console.log("drag");
									switch (this.mode)
										{
											case 'x': x = iXk(mouseX)/Scale; 
																break;
											case 'y': y = iYk(mouseY)/Scale;
																break;
											default:  x = iXk(mouseX)/Scale;
																y = iYk(mouseY)/Scale;
																break;
										}
									mDragged = false;	
								}
						
							if (mReleased)
								{
									//console.log("released: "+mReleased+" end: "+tEnded);
									insideBubble = false;
									overBubble = false;
									this.status = false;
								}
						}
					if (overBubble == true) fill(manageColor(this.c)[0]); else fill(this.c)
					if (this.visible)
						{
							stroke(manageColor(this.c)[0]);
							ellipse(kXi(xPos*Scale), kYi(yPos*Scale), 2*R*Scale, 2*R*Scale);
						}
					fill(255);
					//console.log("status: "+this.status+" x: "+x+" y: "+y+"  M: "+Scale+" visib: "+this.visible);
				pop();   // Formatierung rekonstruieren
				return([this.status, x, y]); // this.status true: mouse im Kreis clicked, false: released
			}
	}

/********************* Basisroutinen **********************/
/* Stand: 10.05.2020                                      */
/*	       canvasStyle.style.height = height;             */
/*                                                        */
/* - kXi, kYi, iXk, iYk Koordinaten-Transformationen      */
/* - Mouse-handling                             		  */
/*                                                        */
/**********************************************************/

/* Transformation kartesischer in interne Koordinaten bezügl. xi0 und yi0 (in Constants.js deklariert) */
function kXi(a)
	{ /* a ist beliebige kart. Größe */
	  return(a + xi0);
	}

function kYi(b)
	{ /* b ist bel. kart. Größe */
	  return(yi0 - b);
	}

/* Transformation interner in kartesische Koordinaten */
function iXk(a)
	{ /* a ist beliebige interne Größe */
	  return(a - xi0);
	}
  
function iYk(b)
	{ /* b ist bel. interne Größe */
	  return(yi0 - b);
	}

/* Mouse- und Touch-Eventbehandlung */
var isTouchscreen = false;

/* Mouse-Routinen */
var mClicked = false;              // Merker für Mausstati
var mPressed = false;
var mReleased = false;
var mDragged = false;

function mouseClicked()
	{  /* der Merker mClick muss nach Gebrauch extern rückgesetzt werden! */
	   mClicked = true;
		 //alert("mouse");
	   //isTouchscreen = false;
	}

function mousePressed()
	{  
	  mPressed = true;              
	  mReleased = false;
	}
 
function mouseReleased()
	{  /* der Merker mReleased muss nach Gebrauch extern rückgesetzt werden! */
	  mReleased = true;
	  mPressed = false;  
	  mClicked = false;
		//console.log("mReleased: "+mReleased+" mPressed: "+mPressed+" mClicked: "+mClicked);
	}

function mouseDragged()
	{  /* der Merker mDragged muss nach Gebrauch extern rückgesetzt werden! */
	  mDragged = true;
	}

function manageColor(c)	
	{ // input hex color, returns inverted color, brighness, dec. RGB-values
		var cString = split(c, '');  // Farbwert in String zerlegen
		var Red = unhex(cString[1] + cString[2]);
		var Green = unhex(cString[3] + cString[4]);
		var Blue = unhex(cString[5] + cString[6]);
		var r = ((hex(255-Red)).toString()).substring(6, 8);
		var g = ((hex(255-Green)).toString()).substring(6, 8);
		var b = ((hex(255-Blue)).toString()).substring(6, 8);
		var invertedColor = '#'+r+g+b;
		var brightness = sqrt(0.299*sq(Red) + 0.587*sq(Green) + 0.114*sq(Blue));

		if (brightness > 150) 
			return [invertedColor, '#000000', Red, Green, Blue];
		else
		  return [invertedColor, '#ffffff', Red, Green, Blue];
	}

