/*--------------------------------------

Trying OOP Concepts       


---------------------------------------*/

function boardObjects(){
    return{
        board : document.getElementById('board')
    }
}

function windowObjects(){
    return {
        //playerTurn : document.getElementById('playerTurn'),
        startBtn : document.getElementsByClassName('startBtn')[0],
        //(the message div above the board)
        turns : document.getElementsByClassName('turns')[0],
        welcomeScr : document.getElementsByClassName('welcome')[0],
        //Audio Tags
        startSound : document.getElementById('startSound'),
        resetSound : document.getElementById('resetSound'),
        winSound : document.getElementById('winSound'),
        clickedSound1 : document.getElementById('clickedSound1'),
        clickedSound2 : document.getElementById('clickedSound2'),
        clickedSound3 : document.getElementById('clickedSound3')
    }
}

class Board{
    constructor(boardSize){
        this.boardSize = boardSize;
        this.circleObjArr = [];
        this.buildBoard(boardSize);
    }
    circleArr = [];
    row = 0;
    rowArr = []; // three temporary variables to help with building the 'circleArr'.
    column = 0;
    
    buildBoard(n){
        const boardObj = boardObjects();
        boardObj.board.innerHTML = '';
        let i = 0;
        while(i<n){
            boardObj.board.innerHTML += "<div class='row flexbox'>"  
                                + this.buildBoardHelper(n);
                                + "</div>"; 
            
            this.row++;
            this.circleArr[i] = this.rowArr;
            this.rowArr = []; this.column = 0;
            i++;
        }

        this.circleObjArr = Array.from(document.getElementsByClassName('circle'));
        this.circleObjArr.forEach(circleObj => this.setSize(circleObj));
    }
    //Helper function _ Adding rows recursively.
    buildBoardHelper(n){
        if(n===0){return '';}
        this.rowArr[this.column] = -1; //Also filling in the circleArr.
        this.column++;
        return "<div class='circle' id='"+this.row+(this.column-1)+"'></div>" 
                + this.buildBoardHelper(n-1);
    }
    //Helper function _ setting circle sizes according to given number.
    setSize(circleObj){
        circleObj.style.padding = (10/this.boardSize)+'vw'; // total board size is 10vw-ish.
    }
}

//Factory Function for players:
function Player(){
    let p1Name = document.getElementById('p1Name').value;
    let p2Name = document.getElementById('p2Name').value;
    let color1 = '#F74420';
    let color2 = '#C520F7';
    return{
        names: [p1Name,p2Name],
        colors:[color1, color2]
        //playerStats: localStorage.getItem('playerStats') || {win:0, draw:0, lost:0}
    }
}
class GameSettings{
    sound1 = document.getElementById('clickedSound1');
    sound2 = document.getElementById('clickedSound2');
    boardSize = document.getElementById('boardSize').value;
    winningPoints = boardSize;
    constructor(){
        this.setWinningPoint();
        this.pvpMode = document.getElementById('pvp').checked;
        this.easyMode = document.getElementById('easy').checked;
        this.normalMode = document.getElementById('normal').checked;
        this.modeChecker();
    }
    setWinningPoint(){
        // NOTE: setting a different winning point would require checking the consecutiveness of circles.
        //       That functionality that hasn't been added, yet. Hence, this method.
        document.getElementById('winningPoint').value = boardSize;
    }
    modeChecker(){
        mode = this.pvpMode? 'pvpMode' : (this.easyMode? 'easyMode' : 'normalMode');
        if(!this.pvpMode){
            document.getElementById('p2Name').value = this.easyMode? 'Steve': 'Marc';
        }
    }

}

const compDifficulyDiv = document.getElementsByClassName('compDifficulty')[0];
function vsMode(pvp){
    // Toggling the CompDifficulty Panel accordingly:
    if(pvp){
        compDifficulyDiv.style.display = 'none';
        document.getElementById('p2Name').style.display = 'block';
    }
    else{
        compDifficulyDiv.style.display = 'block';
        document.getElementById('p2Name').style.display = 'none';
    }
}

//Getting form data:
document.getElementById('settings').addEventListener('submit',e => {
    e.preventDefault();
    const dom = windowObjects();
    dom.startBtn.disabled = true;
    dom.startBtn.style.backgroundColor = 'var(--color6)';
    dom.turns.style.display = 'block';
    dom.welcomeScr.style.display = 'none';

    document.getElementById('navOnOffBtn').checked = true;
    dom.startSound.play();

    let gameSettings = new GameSettings();
    let newBoard = new Board(gameSettings.boardSize);
    newBoard.circleObjArr.forEach(circleObj=>{
        circleObj.addEventListener('mousedown', e=>{
            new ClickedCircle(e.target,gameSettings.mode, newBoard);
        })
    })

});


let mode, difficulty;
let filledSlots = 0;
let game = true;
let turn = 0;


class ClickedCircle{
    constructor(obj,mode, board){
        if(!game) {return;}
        this.obj = obj;
        this.mode = mode;
        this.colors = Player().colors;
        this.fillCircle(board);
    }

    fillCircle(board){
        let objRow = Number(this.obj.id[0]);
        let objColumn = Number(this.obj.id[1]);
        if(board.circleArr[objRow][objColumn] === -1){
            this.obj.style.transform = 'rotateX(180deg)';
            this.obj.style.transition = '300ms';
            //let color = (turn===0)? this.color1 : this.color2;
            this.obj.style.backgroundColor = this.colors[turn];
            play(objRow,objColumn,board);
            if(mode !== 'pvpMode' && game){
                setTimeout(()=>new ComputerMove(board), 500);
            }
        }
    }
}

class ComputerMove{
    constructor(board){
        this.boardSize = board.boardSize;
        this.compChoose(board);
    }
    compChoose(board){
        let compSlotRow = 0;
        let compSlotColumn = 0;
        let iterated = 0; //Will only randomize a certain number of times.
        let randomizationLimitExceeds = false;
        const boardSize = this.boardSize;

        //Easy Mode
        if(mode === 'easyMode'){
            while(board.circleArr[compSlotRow][compSlotColumn] !== -1){
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
                        if(board.circleArr[i][j] === -1){
                            compSlotRow = i;
                            compSlotColumn = j;
                            slotFound = true;
                            break;
                        }
                    }
                    if(slotFound){break;}
                }
            }
            this.compPlay(compSlotRow,compSlotColumn, board);
        }
        //Normal Mode
        else if(mode === 'normalMode'){
            let playerSlotsHor = []; 
            let playerSlotsVer = [];
            let playerSlot = 0; //Former is an array, latter is an element in that array.
    
            //Calculating the row with most player-winning potential.
            for(let i = 0; i<boardSize; i++){
                for(let j = 0; j<boardSize; j++){
                    if(board.circleArr[i][j] === 0){
                        playerSlot++;}
                }
                playerSlotsHor[i] = playerSlot;
                playerSlot=0;
                console.log("Marc's calculating: ", playerSlotsHor);
            }
            //Calculating the column with most player-winning potential.
            for(let i = 0; i<boardSize; i++){
                for(let j = 0; j<boardSize; j++){
                    if(board.circleArr[j][i] === 0){playerSlot++};
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
                for(let i = 0; i<boardSize; i++){
                    if(board.circleArr[maxIndex][i] === -1){
                        filledFlag = true;
                        this.compPlay(maxIndex,i,board);
                        break;
                    }
                }
            }
            //If columnMax is greater:
            if(filledFlag === false){
                maxIndex = playerSlotsVer.indexOf(columnMax);
                for(let i = 0; i<boardSize; i++){
                    if(board.circleArr[i][maxIndex] === -1){
                        filledFlag = true;
                        this.compPlay(i,maxIndex,board);
                        break;
                    }
                }
            }
            //If no slot is available for such method:
            if(filledFlag === false){
                mode = 'easyMode';
                this.compChoose(board);
                mode = 'normalMode';
            }
        }
    }
    compPlay(row,column,board){
        let objID = row+''+column;
        let obj = document.getElementById(objID);
        obj.style.backgroundColor = Player().colors[turn];
        obj.style.transform = 'rotateX(180deg)';
        obj.style.transition = '300ms';
        play(row,column,board);
    }
}
function play(row,column,board){
    let playerStats = Player();
    //clickedSounds[turn].play();
    board.circleArr[row][column] = turn;
        filledSlots ++;
        //Checking if anybody wins, or if it's a draw:
        if(filledSlots === board.boardSize**2){
            console.log("you guys drew");
            EndingGame().draw();
        }
        else if(filledSlots >= (2*board.boardSize-1)){
            console.log({
                limit : board.boardSize**2,
                filledSlots
            })
            new ScoreCalculator(board);
        }
        
        turn = 1 - turn; //Toggling player numbers.
        const playerTurn = document.getElementById('playerTurn');
        playerTurn.textContent = playerStats.names[turn];
        playerTurn.style.color = playerStats.colors[turn];
}


class ScoreCalculator{
    constructor(board){
        this.boardSize = board.boardSize;
        this.circleArr = board.circleArr;
        this.calculateScores();
    }
    calculateScores(){
        let score, candidate,j;
        //Checking for horizontal rows:
        for(let i = 0; i<this.boardSize; i++){
            score = 1;
            candidate = this.circleArr[i][0]; //j === 0 condition is already taken into account.
            for(j = 1; j<this.boardSize; j++){
                if(this.circleArr[i][j] === candidate){
                    score++;}
                else{break;}
            }
            this.checkStatus(score,candidate);
            if(!game) return;
            }
        //Checking for vertical rows:
        for(let i = 0; i<this.boardSize; i++){
            score = 1;
            candidate = this.circleArr[0][i]; //j === 0 condition is already taken into account.
            for(j = 1; j<this.boardSize; j++){
                if(this.circleArr[j][i] === candidate){
                    score++;}
                else{break;}
            }
            this.checkStatus(score,candidate);
            if(!game) return;
            }
        //Checking for diagonals:
            score = 1;
            candidate = this.circleArr[0][0]; //Since boardSize === winningPoints, only two diagonals need to be checked.
            for(j = 1; j<this.boardSize; j++){
                if(this.circleArr[j][j] === candidate){
                    score++;}
                else{break;}
            }
            this.checkStatus(score,candidate);
            if(!game) {return;}
            else{
                let rightmostIndex = this.boardSize -1;
                score = 1;
                candidate = this.circleArr[0][rightmostIndex];
                for(j = 1; j<this.boardSize; j++){
                        if(this.circleArr[j][rightmostIndex-j] === candidate){
                            score++;}
                        else{break;}
                    }
                    this.checkStatus(score,candidate);
            }
    }
    checkStatus(score, candidate){
            if(score >= this.boardSize && candidate !== -1){
                game = false;
                //winSound.play();
                setTimeout(()=>EndingGame().win(candidate), 1000);
            }
        }
    }

//Factory functions for ending conditions:
function EndingGame(){
    const dom = windowObjects();
    dom.turns.style.display = 'none';
    boardObjects().board.style.display = 'none';
    dom.welcomeScr.style.display = 'block';
    return{
        win: (candidate) => {
            dom.welcomeScr.innerHTML = 
                    "<img src='medal.png' width='60vw'>"
                +   "<p text-align='center'> Congratualations to " + Player().names[candidate] + "</p>";

            dom.welcomeScr.style.color='white';
            document.getElementsByClassName('turn')[0].style.backgroundColor = Player().colors[candidate];
            //document.getElementsByClassName('credit')[0].style.display = 'block';
        },
        draw: () => {
            dom.welcomeScr.innerHTML = "<p text-align='center'> It's a draw! <br> Congratualations to you both. </p>";
            dom.welcomeScr.style.color='var(--color7)';
            document.getElementsByClassName('turn')[0].style.backgroundColor = '#eee';
        }
    }
}