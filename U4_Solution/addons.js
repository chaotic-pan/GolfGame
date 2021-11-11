/**************************** 4. Übung/add ons **************************************/
/* Autor: Dr.-Ing. V. Naumburger	                                                */
/* Datum: 27.10.2021                                                                */
/************************************************************************************/

/*************************** Variablendeklaration ***********************************/
/* Spielfeld */
var N = [0, 0];									// Nullpunkt
var Point = [0, 0];								// variabler Punkt

var G = [										// Playground Kontur
			[0.82, -0.3],						// 0 - rechts verschoben
			[0.82, 0],							// 1 - rechts verschoben
			[-1.2, 0],							// 2
			[-2.1, 0.4],						// 3
			[-3.0, 0],							// 4
			[-3.4, 0],							// 5
			[-3.43, -0.2],						// 6
			[-4.0, -0.2],						// 7
			[-4.03, 0],							// 8
			[-4.9, 0],							// 9
			[-4.9, -0.2],						// 10
			[-5.1, -0.2],						// 11
			[-5.1, 0],							// 12
			[-5.7, 0],							// 13
			[-6.56, 0.9],						// 14
			[-6.56, -0.3],						// 15			
		];

var P = [										// Oberfläche
			[0.82, 0],							// 0
			[-1.2, 0],							// 1
			[-2.1, 0.4],						// 2
			[-3.0, 0],							// 3
			[-3.4, 0],							// 4
			[-4.03, 0],							// 5
			[-4.9, 0],							// 6
			[-5.1, 0],							// 7
			[-5.7, 0],							// 8
			[-6.56, 0.9],						// 9
		];

var beta = 0, beta_i = [];						// Neigungswinkel, Neigungswinkel des i-ten der Geradenstücks
var len = 0, len_i= [];							// Länge, Länge des i-ten Geradenstücks
var g_, g_i = [];								// wirksame Erdbeschleunigungskonstante, wirksame Erdbeschleunigungskonstante des i-ten Geradenstücks

/***************************** Subroutines *******************************************/
function ballOnSlope(s, len, beta, Point)
	{
		//console.log("s: "+s+"  "+degrees(beta)+"° "+len+"m "+Point);
		
		push();
			translate(Point[0]*M, (Point[1] + 0.5*dBall)*M);
			rotate(beta);
			fill(colorBall);							// Golfball
			ellipse(s*M, 0, dBall*M);
			fill(0);
			if(debug)
				{
					line(0, 0, len*M, 0);				// Weg des Balls im Segment
					ellipse(0,0,0.4*dBall*M);			// Weganfang
				}
		pop();
			
		if (debug)
			{
				push();
					noFill();
					ellipse(xBall*M, (G[0][1]-dBall)*M, dBall*M); // Projektion des Balls auf die x-Achse
				pop();
			}
	}
	
function playGround()
	{
		fill(0,0,200);							// Wassergraben
		rect(G[8][0]*M,G[7][1]*M, (G[5][0] - G[8][0])*M, 0.9*(G[5][1] - G[6][1])*M);

		fill(100, 50, 0);						// Playground
		beginShape();
			for (var i = 0; i < G.length; i++)
				//console.log(G[i]);
				vertex(G[i][0]*M,G[i][1]*M);
		endShape();			

		push(); 								// Rasen
			strokeWeight(5);
			noFill();
			push();
				stroke(0, 200, 0);
				beginShape();
					for (var i = 1; i < 6; i++)
						//console.log(G[i]);
						vertex(G[i][0]*M,G[i][1]*M);
				endShape();
				line(G[8][0]*M,G[8][1]*M, G[9][0]*M,G[9][1]*M);
			pop();
			push();								// Sandberg
				stroke(200, 200, 0);
				beginShape();
					for (var i = 12; i < 15; i++)
						//console.log(G[i]);
						vertex(G[i][0]*M,G[i][1]*M);
				endShape();
			pop();
		pop();		
	}

function drawZeroCross()
	{ // markiert den Nullpunkt des Koordinatensystems
		if (debug)
			{
				push();
					stroke(0);			
					strokeWeight(1);
					noFill();
					line(10, 0, -10, 0);
					line(0, 10, 0, -10);
				pop();
			}		
	}	
