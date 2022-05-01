/*--------------------------------------
|       Sections:                       |
|           1.  VARIABLES               |
|           2.  USER INPUTS             |
|           3.  FILLING THE SLOTS       |
|           4.  GAME-ENDING             |
---------------------------------------*/


/*  1.  SETTING UP VARIABLES */

/* 1.1. The Document Object */

const playerTurn = document.getElementById('playerTurn');
const form = document.getElementById('settings');
const compDifficulyDiv = document.getElementsByClassName('compDifficulty')[0];
const startBtn = document.getElementsByClassName('startBtn')[0];
const board = document.getElementById('board');
//(the message div above the board)
const turns = document.getElementsByClassName('turns')[0];
const welcomeScr = document.getElementsByClassName('welcome')[0];
//Audio Tags
const startSound = document.getElementById('startSound');
const resetSound = document.getElementById('resetSound');
const winSound = document.getElementById('winSound');
const clickedSound1 = document.getElementById('clickedSound1');
const clickedSound2 = document.getElementById('clickedSound2');
const clickedSound3 = document.getElementById('clickedSound3');

/* 1.2. Program */

//Players and Colors
let players = ['player1', 'player2'];
let dotColors = ['#F74420','#C520F7'];
let clickedSounds = [clickedSound1, clickedSound2];
//Initialization
let boardSize, winningPoints, mode, difficulty;
let rowArr = []; // three temporary variables to help with building the 'circleArr'.
let column = 0;
let row = 0;
let filledSlots = 0;
let game = true; //Game running or not;
//Players and turns
let turn = 0; // 0 for player 1, 1 for player 2.
let circleArr = []; // 0 for player 1, 1 for player 2, -1 for empty slot.

/*-----------------------------------------------------------------------------------------------*/

/*  2.   USER INPUTS & BOARD BUILDING */

/* 2.1. User's inputs */
//Modes:
function vsMode(pvp){
    //' Player Vs Player Mode' or not.
    if(pvp){
        compDifficulyDiv.style.display = 'none';
        document.getElementById('p2Name').style.display = 'block';
    }
    else{
        compDifficulyDiv.style.display = 'block';
        document.getElementById('p2Name').style.display = 'none';
    }
}
//Getting form inputs:
function startGame(){
    document.getElementById('navOnOffBtn').checked = true;
    startSound.play();
    //Getting form data:
    form.addEventListener('submit',e => submitEvent(e));
    function submitEvent(e){
        e.preventDefault();
        players[0] = document.getElementById('p1Name').value;
        players[1] = document.getElementById('p2Name').value;
        boardSize = document.getElementById('boardSize').value;
        // NOTE: setting a different winning point would require checking the consecutiveness of circles.
        document.getElementById('winningPoint').value = boardSize;
        winningPoints = document.getElementById('winningPoint').value;
        pvpMode = document.getElementById('pvp').checked;
        easyMode = document.getElementById('easy').checked;
        normalMode = document.getElementById('normal').checked;
        
        if(!pvpMode){
            easyMode? players[1] = 'Steve': players[1] = 'Marc';
        }

        startBtn.disabled = true;
        startBtn.style.backgroundColor = 'var(--color6)';
        turns.style.display = 'block';
        welcomeScr.style.display = 'none';

        //Building the board:
        buildBoard(boardSize);
    }
}

/* 2.2. Building the board */
//Main function to build the board.
function buildBoard(n){
    board.innerHTML = '';
    
    let i = 0;
    while(i<n){
        board.innerHTML += "<div class='row flexbox'>"  
                            + buildBoardHelper(n);
                        + "</div>"; 
        
        row++;
        circleArr[i] = rowArr;
        rowArr = []; column = 0;
        i++;
    }

    const circleObjArr = Array.from(document.getElementsByClassName('circle'));
    circleObjArr.forEach(circleObj => setSize(circleObj));
}
//Helper function _ Adding rows recursively.
function buildBoardHelper(n){
    if(n===0){return '';}
    rowArr[column] = -1; //Also filling in the circleArr.
    column++;
    return "<div class='circle' id='"+row+(column-1)+"' onclick='clickedCircle(this)'></div>" 
            + buildBoardHelper(n-1);
}
//Helper function _ setting circle sizes according to given number.
function setSize(circleObj){
    circleObj.style.padding = (10/boardSize)+'vw'; // total board size is 10vw-ish.
}
/*-----------------------------------------------------------------------------------------------*/

/*  3.   FILLING IN SLOTS */

/* 3.1. User's choosing */
function clickedCircle(obj){
    if(!game || (!pvpMode && turn===1)){
        clickedSound3.play();
        return;
    }
    
    //Getting row and column indices of the object:
    let objRow, objColumn;
    objRow = Number(obj.id[0]);
    objColumn = Number(obj.id[1]);

    //Validating and filling in the board:
    if(circleArr[objRow][objColumn] === -1){
        obj.style.transform = 'rotateX(180deg)';
        obj.style.transition = '300ms';
        obj.style.backgroundColor = dotColors[turn];
        play(objRow,objColumn);
        if(game && !pvpMode){
            //Computer will play if not in pvpMode.
            setTimeout(()=>compChoose(), 500);
        }
    }
}

/* 3.2. Computer's choosing */
//Computer deciding based on difficulty.
function compChoose(){
    let compSlotRow = 0;
    let compSlotColumn = 0;
    let iterated = 0; //Will only randomize a certain number of times.
    let randomizationLimitExceeds = false;

    //Easy Mode
    if(easyMode){
        while(circleArr[compSlotRow][compSlotColumn] !== -1){
            compSlotRow = Math.floor(Math.random()*boardSize);
            compSlotColumn = Math.floor(Math.random()*boardSize);
            iterated ++;
            if(iterated === 10){
                randomizationLimitExceeds = true;
                break;
            }
        }
        if(randomizationLimitExceeds){
            let slotFound = false;
            for(let i = 0; i<boardSize; i++){
                for(let j = 0; j<boardSize; j++){
                    if(circleArr[i][j] === -1){
                        compSlotRow = i;
                        compSlotColumn = j;
                        slotFound = true;
                        break;
                    }
                }
                if(slotFound){break;}
            }
        }
        compPlay(compSlotRow,compSlotColumn);
    }
    //Normal Mode
    else if(normalMode){
        let playerSlotsHor = []; 
        let playerSlotsVer = [];
        let playerSlot = 0; //Former is an array, latter is an element in that array.

        //Calculating the row with most player-winning potential.
        for(let i = 0; i<boardSize; i++){
            for(let j = 0; j<boardSize; j++){
                if(circleArr[i][j] === 0){
                    playerSlot++;}
            }
            playerSlotsHor[i] = playerSlot;
            playerSlot=0;
        }
        //Calculating the column with most player-winning potential.
        for(let i = 0; i<boardSize; i++){
            for(let j = 0; j<boardSize; j++){
                if(circleArr[j][i] === 0){playerSlot++};
            }
            playerSlotsVer[i] = playerSlot;
            playerSlot=0;
        }        
        //Choosing
        let maxIndex;
        let filledFlag = false;
        let rowMax = Math.max(...playerSlotsHor);
        let columnMax = Math.max(...playerSlotsVer);
        //If rowMax is greater:
        if(rowMax > columnMax){
            maxIndex = playerSlotsHor.indexOf(rowMax);
            console.log('maxrow',maxIndex);
            for(let i = 0; i<boardSize; i++){
                if(circleArr[maxIndex][i] === -1){
                    filledFlag = true;
                    compPlay(maxIndex,i);
                    break;
                }
            }
        }
        //If columnMax is greater:
        if(filledFlag === false){
            maxIndex = playerSlotsVer.indexOf(columnMax);
            for(let i = 0; i<boardSize; i++){
                if(circleArr[i][maxIndex] === -1){
                    filledFlag = true;
                    compPlay(i,maxIndex);
                    break;
                }
            }
        }
        //If no slot is available for such method:
        if(filledFlag === false){
            easyMode = true;
            compChoose();
            easyMode = false;
        }
    }
}

//Computer filling in the slots
function compPlay(row,column){
    let objID = row+''+column;
    let obj = document.getElementById(objID);
    obj.style.backgroundColor = dotColors[turn];
    obj.style.transform = 'rotateX(180deg)';
    obj.style.transition = '300ms';
    play(row,column);
}

/* 3.3. Updating the array and status. */
//Updates the 'circleArr'.
function play(row,column){
    clickedSounds[turn].play();
    circleArr[row][column] = turn;
        filledSlots ++;
        //Checking if anybody wins, or if it's a draw:
        if(filledSlots === boardSize**2){
            draw();
        }
        else if(filledSlots >= (2*winningPoints-1)){
            calculateScores();
            }
        turn = 1 - turn; //Toggling player numbers.
        playerTurn.textContent = players[turn];
        playerTurn.style.color = dotColors[turn];
}

//Calcultating the scores.
function calculateScores(){
    let score, candidate;
        //Checking for horizontal rows:
        for(let i = 0; i<boardSize; i++){
            score = 1;
           candidate = circleArr[i][0]; //j === 0 condition is already taken into account.
            for(j = 1; j<boardSize; j++){
                if(circleArr[i][j] === candidate){
                    score++;}
                // in progress: checking for the consecutiveness.
                // else if(j + winningPoints <= boardSize){
                //     score=1; candidate = circleArr[i][j];}
                else{break;}
            }
            checkStatus(score,candidate);
            if(!game) return;
            }
        //Checking for vertical rows:
        for(let i = 0; i<boardSize; i++){
            score = 1;
            candidate = circleArr[0][i]; //j === 0 condition is already taken into account.
            for(j = 1; j<boardSize; j++){
                if(circleArr[j][i] === candidate){
                    score++;}
                else{break;}
            }
            checkStatus(score,candidate);
            if(!game) return;
            }
        //Checking for diagonals:
            score = 1;
            candidate = circleArr[0][0]; //Since boardSize === winningPoints, only two diagonals need to be checked.
            for(j = 1; j<boardSize; j++){
                if(circleArr[j][j] === candidate){
                    score++;}
                else{break;}
            }
            checkStatus(score,candidate);
            if(!game) {return;}
            else{
                let rightmostIndex = boardSize -1;
                score = 1;
                candidate = circleArr[0][rightmostIndex];
                for(j = 1; j<boardSize; j++){
                        if(circleArr[j][rightmostIndex-j] === candidate){
                            score++;}
                        else{break;}
                    }
                console.log('score is now ', score);
                checkStatus(score,candidate);
            }
    }
        

//Sees if someone wins.
function checkStatus(score, candidate){
    if(score >= winningPoints && candidate !== -1){
        game = false;
        winSound.play();
        setTimeout(()=>win(candidate), 1000);
    }
    
}
/*-----------------------------------------------------------------------------------------------*/

/*  4.  ENDGAME CONDITIONS */

function win(winnerIndex){
    turns.style.display = 'none';
    board.style.display = 'none';
    welcomeScr.innerHTML = 
            "<img src='medal.png' width='60vw'>"
        +   "<p text-align='center'> Congratualations to " + players[winnerIndex] + "</p>";
    welcomeScr.style.display = 'block';
    welcomeScr.style.color='white';
    document.getElementsByClassName('turn')[0].style.backgroundColor = dotColors[winnerIndex];
    document.getElementsByClassName('credit')[0].style.display = 'block';
}
function draw(){    
    turns.style.display = 'none';
    board.style.display = 'none';
    welcomeScr.innerHTML = "<p text-align='center'> It's a draw! <br> Congratualations to you both. </p>";
    welcomeScr.style.display = 'block';
    welcomeScr.style.color='var(--color7)';
    document.getElementsByClassName('turn')[0].style.backgroundColor = '#eee';
}
/*-----------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------
Ideas for expansion:
//  Figure out how to make section 3 consise.
//  Modify to make Marc (normal Computer mode) smarter about diagonals.
//  Add option to customize colors.
----------------------------------------------------------------------------------------------------*/