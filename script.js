

// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

var currentPlayer = spacePlayerOne;

const gameBoard = (() => {
    // create a 2d array where each cell contains a 0
    // let array = Array(rows).fill().map(() => Array(columns).fill(0));
    this.boardGrid = Array(3).fill().map(() => Array(3).fill(0)); // this is "function scope", ie, private

    const markSpace = (row, column, currentPlayer) => {
        console.log("marking space");
        boardGrid[row][column] = currentPlayer;
    };

    const printBoardState = () => {
        boardGrid.forEach(function(space) {
            console.log(space);
        });
    }

    return {
        markSpace,
        printBoardState
    }
})();

const HTMLcontroller = (() => {

    this.gridParentDiv = document.querySelector(".gameGrid");
    this.gridSquareDivs = [];
    
    const InitializeGame = () => {
        // get children, then convert into a 3x3 2D array
        this.newArr = Array.from(gridParentDiv.children);
        while(newArr.length) gridSquareDivs.push(newArr.splice(0,3));
        
        PrintDivs();

        MarkSpaceWithPlayer(0, 1, spacePlayerOne);
        gridSquareDivs[2][1].classList.add("occupied");
    }

    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        let currentSpace = gridSquareDivs[row][column];

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

gameBoard.printBoardState();
gameBoard.markSpace(1, 1, spacePlayerOne);
gameBoard.printBoardState();
// console.log(game.boardGrid[0][0]); // produces error because boardGrid is private

