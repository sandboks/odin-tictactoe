

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
    // DIAGONAL
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
];

const gameBoard = (() => {
    // create a 2d array where each cell contains a 0
    // let array = Array(rows).fill().map(() => Array(columns).fill(0));
    this.boardGrid = Array(3).fill().map(() => Array(3).fill(0)); // this is "function scope", ie, private

    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        //console.log("marking space");
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);

        ToggleCurrentPlayer();
        HTMLcontroller.SetActivePlayer(currentPlayer - 1);

        CheckWinCondition();
    };

    function ToggleCurrentPlayer() {
        switch(currentPlayer) {
            case spacePlayerOne:
                currentPlayer = spacePlayerTwo;
                break;
            case spacePlayerTwo:
                currentPlayer = spacePlayerOne;
                break;
        }
    }

    function CheckWin(player) {
        WINNING_COMBINATIONS.forEach(function(combo) {
            if ((boardGrid[combo[0][0]][combo[0][1]] == player)
            && (boardGrid[combo[1][0]][combo[1][1]] == player)
            && (boardGrid[combo[2][0]][combo[2][1]] == player)) {
                //console.log("YOU'RE WINNER" + player);
                alert("YOU'RE WINNER" + player);
            }
        });
    }



    function CheckWinCondition() {
        CheckWin(spacePlayerOne);
        CheckWin(spacePlayerTwo);
    }

    const ClickOnSpace = (index) => {
        //alert("you clicked on space #: " + index);
        
        let y = Math.floor(index / 3);
        let x = index % 3

        if (boardGrid[y][x] == spaceEmpty)
            MarkSpaceWithPlayer (y, x, currentPlayer);
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

    const gridParentDiv = document.querySelector(".gameGrid");
    let gridSquareDivs = [];

    let playerOneHUD = null;
    
    const InitializeGame = () => {
        this.newArr = Array.from(gridParentDiv.children);
        for (let i = 0; i < newArr.length; i++) {
            let child = newArr[i];
            child.addEventListener("click", () => {
                gameBoard.ClickOnSpace(i);
            })
        }

        // convert into a 3x3 2D array
        while(newArr.length) gridSquareDivs.push(newArr.splice(0,3));

        SetActivePlayer(0);
    }

    const SetActivePlayer = (playerNumber) => {
        let playerHTMLroots = document.getElementsByClassName("activePlayerBackground");
        playerHTMLroots[(playerNumber+1)%2].classList.remove("active");
        playerHTMLroots[playerNumber].classList.add("active");
    }

    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        //console.log(row + " / " + column + " / " + playerNumber);
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
        MarkSpaceWithPlayer,
        SetActivePlayer
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

