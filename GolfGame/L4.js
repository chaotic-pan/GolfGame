/* template GTAT2 Game Technology & Interactive Systems 
Liz Kintzel
 */

// Coordinates collection of Playground
let G = [
    // Start point
    [-.75, -.42],   // 0
    [-.75, 0],      // 1
    //Hill
    [1.05, 0],       // 2
    [1.95, .45],     // 3
    [2.85, 0],       // 4
    // Water Hole
    [3.36, 0],       // 5
    [3.42, -.24],    // 6
    [3.9, -.24],     // 7
    [3.96, 0],       // 8
    //Hole
    [4.89, 0],       // 9
    [4.90, -.24],    // 10
    [5.06,-.24],     // 11
    [5.07,0],        // 12
    //Sand Hill
    [5.7,0],         // 13
    [6.6, .87],      // 14
    [6.6,-.42],      // 15
];
// surface Segments vectors
let S = Array(G.length-2).fill(0);
// lenght of surface Segments vectors
let Sl = Array(G.length-2).fill(0);
let Si = 0;
// angles of the playground
let beta = Array(G.length-2).fill(0);

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(frRate);
    
    ballPos = ballRest.slice();

    for (let i=0; i<G.length-2; i++) {
        let x = G[i+2][0]-G[i+1][0];
        let y = G[i+2][1]-G[i+1][1];
        S[i]= [x,y];
        
        Sl[i] = Math.sqrt(Math.pow(S[i][0],2)+Math.pow(S[i][1],2));

        beta[i] = Math.atan((G[i+2][1]-G[i+1][1])/(G[i+2][0]-G[i+1][0]));
    }
}

function draw() {
    clear();
    drawBackground(G);
    drawWater([[3.95,-.06], G[7], G[6], [3.375, -.06]]);
    drawGrass([1,2, 2,3, 3,4, 4,5, 8,9]);
    drawSand( [12,13, 13,14]);
    drawMainUI();
    drawGameUI();
    
    stateChanging: {
        // reached foot of first slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > G[2][0]-ballRadius/2 && ballPos[0] < G[3][0]) {
            ballPos[0] = G[2][0]-ballRadius/2;
            Si = 1;
            state = states.SLOPE;
            break stateChanging;
        }
        // reached foot of second slope --> SLOPE
        if (state === states.PLANE && ballPos[0] > G[13][0]-ballRadius/2) {
            ballPos[0] = G[13][0]-ballRadius/2;
            Si = 12;
            state = states.SLOPE;
            break stateChanging;
        }
        // reached right end of game canvas --> OFF
        if (ballPos[0] < G[1][0]+ballRadius) {
            ballPos = [G[1][0]+ballRadius, G[1][1]];
            state = states.OFF;
            break stateChanging;
        }
        // reached left end of game canvas --> Yeet
        if (ballPos[0] >= G[14][0]+ballRadius) {
            Si = 12;
            vX= v * Math.cos(beta[Si]);
            vY = v * Math.sin(beta[Si]);
            break stateChanging;
        }
        // when up the first slope --> THROW
        if (state===states.SLOPE && ballPos[0]>=G[3][0] && ballPos[0]<G[4][0]) {
            state = states.THROW;
            Si = 1;
            vX= v * Math.cos(beta[Si]);
            vY = v * Math.sin(beta[Si]);
            break stateChanging;
        }
        // stop ball from rolling out of water again
        if (ballPos[1] < -2*ballRadius && ballPos[0] > G[7][0]-ballRadius/2 && ballPos[0] < G[8][0]) {
            ballPos[0] = ballPos[0] -ballRadius/2;
            ballPos[1] = G[7][1];
            v = 0;
            state = states.OFF;
            break stateChanging;
        }
        // when roll over water --> loose
        if ((ballPos[0]>=G[5][0] && ballPos[0]<=G[8][0]) &&  ballPos[1] <= 0){
            if (state===states.PLANE || state===states.PLANE_BACK) {
                Si = 3;
                state = states.THROW;
                vX= v * Math.cos(beta[Si]);
                vY = v * Math.sin(beta[Si]);
            }
            console.log("water");
            water = true;
            break stateChanging;
        }
        // when roll over hole --> win
        if ((ballPos[0]>=G[9][0]  && ballPos[0]<=G[12][0]) &&  ballPos[1] <= 0){
            if (state===states.PLANE || state===states.PLANE_BACK) {
                Si = 7;
                state = states.THROW;
                vX= v * Math.cos(beta[Si]);
                vY = v * Math.sin(beta[Si]);
            }
            console.log("goal");
            goal = true;
            if (oldHits === hits) {
                hits++;
            }
            break stateChanging;
        }
    }
    
    // start
    if (!locked && JSON.stringify(clubPos) !== JSON.stringify(clubRest)) {

        let dis = Math.sqrt(Math.pow((ballPos[0]-clubPos[0]),2) + Math.pow((ballPos[1]+ballRadius-clubPos[1]),2));
        dis = dis - ballRadius - clubRadius;
        
        if (clubPos[0] >= clubRest[0]) {
            damp = true;
        }
        
        if (!damp) {
            vClub = vClub - (90 * (clubPos[0]-clubRest[0]))*dt;
        } else {
            vClub = vClub - (4*vClub + 90 * (clubPos[0]-clubRest[0]))*dt;
        }

        if (dis <= 0) {
            
            let phi = Math.atan((ballPos[1]+ballRadius-clubPos[1]) / (ballPos[0]-clubPos[0])) /2;
          
            // start moving ball
            if (state===states.OFF && JSON.stringify(ballPos) === JSON.stringify(ballRest)) {
                sign = 1;
                v = 2*vClub;
                vX= v * Math.cos(phi);
                vY = v * Math.sin(phi);
                state = states.THROW;
            }
        }
        
        clubPos[0] = clubPos[0]+vClub*dt;

        if (damp && clubPos[0]<clubRest[0]) {
            clubPos[0]=clubRest[0];
            vClub = 0;
            // didn't hit ball
            if (state === states.OFF) {
                tries++;
            }
        }
    }
    
    running: if (state !== states.OFF) {
        // collision
        let dMin = 1000;
        for (let i=0; i<S.length-1; i++) {
            if (!water && (i === 4 || i === 5 || i === 6)
                && (ballPos[0]<G[5][0] || ballPos[0]>G[8][0]+2*ballRadius))
                 continue;
            if (!goal && (i === 8 || i === 9 || i === 10)
                && (ballPos[0]<G[9][0] || ballPos[0]>G[12][0]+2*ballRadius))
                 continue;   
            if (water) {
                if (i !== 4 && i !== 5 && i !== 6) continue 
            }
            if (goal) {
                if (i !== 8 && i !== 9 && i !== 10) continue
            }
            
            
            // vector from Point i to Ball pos
            let B = [ballPos[0]-G[i+1][0], ballPos[1]-G[i+1][1]];
            d = (S[i][0]*B[1] - S[i][1]*B[0]) / Sl[i];
            lPart = (S[i][0]*B[0] + S[i][1]*B[1]) / Sl[i];
            
            if (lPart > 0 && lPart < Sl[i]) {
                if (d < dMin) {
                    dMin=d;
                    Si = i;
                    // lotFuß
                    F = [G[Si+1][0] + (lPart/Sl[Si]) * (G[Si+2][0]-G[Si+1][0]),
                        G[Si+1][1] + (lPart/Sl[Si]) * (G[Si+2][1]-G[Si+1][1])]; 
                }
            }

            /* Debug Stuff */
            // let P = [G[i+1][0] + (lPart/Sl[i]) * (G[i+2][0]-G[i+1][0]),
            //     G[i+1][1] + (lPart/Sl[i]) * (G[i+2][1]-G[i+1][1])];
            // strokeWeight(0);
            // fill('#0fadd5');
            // if (i===6) fill('#ff6914');
            // rectMode(CENTER);
            // circle(x(P[0]), y(P[1]), clubRadius*M);
            //
            // fill(255);
            // textSize(.8*clubRadius*M)
            // text(i, x(P[0]), y(P[1]));
            
            if (dMin<0) {
                ballPos = F;
                
                if (Si === 1) {
                    if (state === states.THROW){
                        let vDreh = dreh([vX,vY],beta[Si]);
                        v = vDreh[0];
                    }
                    state = states.SLOPE;        
                } else if (Si === 2 || Si === 4 || Si === 8) {
                    if (state === states.THROW){
                        v = vX;
                    }
                    state = states.SLOPE_DOWN;
                } else if (Si === 11) {
                    if (state === states.THROW){
                        v = vX/3;
                    }
                    state = states.PLANE;
                } else if (Si === 6 || Si === 10) {
                    if (state === states.THROW){
                        v = 0;
                    }
                    state = states.SLOPE;
                }
                else if (Si === 12) {
                    if (state === states.THROW){
                        let vDreh = dreh([vX,vY],beta[Si]);
                        v = vDreh[0]/3;
                    }
                    state = states.SLOPE;
                } else {
                    if (state === states.THROW){
                        v = vX;
                    }
                    state = states.PLANE;
                }
            }
        }
        
        let c =  cR[0];
        if (Si >= 11) c = cR[1];
        g1 = sign * g * (Math.sin(-beta[Si]) - c * Math.cos(-beta[Si]));
        
        if (state===states.THROW) {
            vX= vX-((cW*roh*A)/(2*m) * Math.sqrt(Math.pow(vX-vWind, 2) + vY*vY) * vX)*dt;
            vY = vY -(g+(cW*roh*A)/(2*m) * Math.sqrt(vX*vX + vY*vY) * vX)*dt;
            
            ballPos[0] = ballPos[0] + vX * dt;
            ballPos[1] = ballPos[1] + vY * dt;
        }
        else if (state === states.SLOPE) {
            v = v + g1*dt;
            let vDreh = dreh([v,0],beta[Si]);
            ballPos[0] = ballPos[0] + vDreh[0]*dt;
            ballPos[1] = ballPos[1] + vDreh[1]*dt;
            if (Si !== 6 && Si !== 10 && ballPos[1] < 0) {
                ballPos[1] = 0;
                // landing in Sand
                if (Si === 12) v=v/3;
                state = states.PLANE_BACK;
            }
        }
        else if (state === states.SLOPE_DOWN) {
            v = v + g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            ballPos[1] = ballPos[1] - v*dt;
            if (Si !== 4 && Si !== 8 && ballPos[1] < 0) {
                ballPos[1] = 0;
                state = states.PLANE;
            }
        }
        else if (state === states.PLANE) {
            v = v + g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            if (v <= 0) {
                // stopping
                v=0;
                state = states.OFF;
                break running;
            }
        }
        else if (state === states.PLANE_BACK) {
            v = v - g1*dt;
            ballPos[0] = ballPos[0] + v*dt;
            if (v >= 0) {
                // stopping
                v=0;
                state = states.OFF;
                break running;
            }
        }
    }

    /* Debug Stuff */
    // strokeWeight(0);
    // fill('#0fadd5');
    // rectMode(CENTER);
    // circle(x(F[0]), y(F[1]), clubRadius*M);
    //
    // fill(0);
    // textSize(.8*clubRadius*M)
    // text(Si, x(F[0]), y(F[1]));
    
    drawForeground(0);
}
    

    