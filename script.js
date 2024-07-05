

// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

var currentPlayer = spacePlayerOne;

const WINNING_COMBINATIONS = [
    // HORIZONTAL
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // VERTICAL
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
];

const gameBoard = (() => {
    // create a 2d array where each cell contains a 0
    // let array = Array(rows).fill().map(() => Array(columns).fill(0));
    this.boardGrid = Array(3).fill().map(() => Array(3).fill(0)); // this is "function scope", ie, private

    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        console.log("marking space");
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);

        CheckWinCondition();
    };

    function CheckWin(player) {
        WINNING_COMBINATIONS.forEach(function(combo) {
            if ((boardGrid[combo[0][0]][combo[0][1]] == player)
            && (boardGrid[combo[1][0]][combo[1][1]] == player)
            && (boardGrid[combo[2][0]][combo[2][1]] == player)) {
                console.log("YOU'RE WINNER" + player);
            }
        });
    }



    function CheckWinCondition() {
        CheckWin(spacePlayerOne);
        CheckWin(spacePlayerTwo);
        /*
        // HORIZONTAL
        if ((boardGrid[0][0] == boardGrid[0][1] && boardGrid[0][1] == boardGrid[0][2]) ||
        (boardGrid[1][0] == boardGrid[1][1] && boardGrid[1][1] == boardGrid[1][2]) ||
        (boardGrid[2][0] == boardGrid[2][1] && boardGrid[2][1] == boardGrid[2][2])) {
            console.log("YOU'RE WINNER");
        }
        */

        /*
        if ( (gridSquareDivs[0][0] == gridSquareDivs[0][1] && gridSquareDivs[0][1] == gridSquareDivs[0][2]) ||
        (gridSquareDivs[1][0] == gridSquareDivs[1][1] && gridSquareDivs[0][1] == gridSquareDivs[1][2]) ||
        )
        */
    }

    const ClickOnSpace = (index) => {
        //console.log(index);
        alert("you clicked on space #: " + index);
        /*
        let y = Math.floor(index / 3);
        let x = index % 3
        console.log("x = " + x);
        console.log("y = " + y);
        MarkSpaceWithPlayer (x, y, currentPlayer);
        */
    };

    const printBoardState = () => {
        boardGrid.forEach(function(space) {
            console.log(space);
        });
    }

    return {
        MarkSpaceWithPlayer,
        printBoardState,
        ClickOnSpace
    }
})();

const HTMLcontroller = (() => {

    this.gridParentDiv = document.querySelector(".gameGrid");
    this.gridSquareDivs = [];
    
    const InitializeGame = () => {
        // get children, then convert into a 3x3 2D array
        this.newArr = Array.from(gridParentDiv.children);
        var i = 0;
        newArr.forEach(function(child) {
            console.log(i);
            child.addEventListener("click", () => {
                gameBoard.ClickOnSpace(i);
            })
            i++;
        });

        while(newArr.length) gridSquareDivs.push(newArr.splice(0,3));
        
        PrintDivs();
    }

    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        console.log(row + " / " + column + " / " + playerNumber);
        let currentSpace = gridSquareDivs[row][column];

        if (currentSpace == null)
            console.log("Oh no");

        currentSpace.classList.add("occupied");
        switch(playerNumber) {
            case spacePlayerOne:
                currentSpace.classList.add("playerX");
                break;
            case spacePlayerTwo:
                currentSpace.classList.add("playerO");
                break;
        }
    }

    function PrintDivs() {
        console.log(gridSquareDivs.length);
        gridSquareDivs.forEach(function(child) {
            console.log(child);
        });
    }

    return {
        InitializeGame,
        MarkSpaceWithPlayer
    }
})();

HTMLcontroller.InitializeGame();

/*
gameBoard.printBoardState();
gameBoard.MarkSpaceWithPlayer(0, 0, spacePlayerOne);
gameBoard.MarkSpaceWithPlayer(1, 0, spacePlayerTwo);
gameBoard.MarkSpaceWithPlayer(0, 1, spacePlayerOne);
gameBoard.MarkSpaceWithPlayer(1, 1, spacePlayerTwo);
gameBoard.MarkSpaceWithPlayer(0, 2, spacePlayerOne);
gameBoard.printBoardState();
*/
// console.log(game.boardGrid[0][0]); // produces error because boardGrid is private

