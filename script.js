

// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

// player names
var player1Name = "Player 1"; // this feels like it could go into a class maybe?
var player2Name = "Player 2";

var currentPlayer = spacePlayerOne;
var gameLocked = false;
var playerVictor = spaceEmpty;

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
    const r = document.querySelector(':root');

    const InitializeGame = () => {
        playerVictor == spaceEmpty
        
        SetCurrentPlayer();
        HTMLcontroller.InitializeGame();

        console.log(getComputedStyle(r).getPropertyValue('--colorPlayerCurrent'));
        console.log(getComputedStyle(r).getPropertyValue('--colorPlayerOne'));
        //HTMLcontroller.SetActivePlayer(currentPlayer - 1);
    };
    
    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        //console.log("marking space");
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);

        if (GameIsOver() == true) {
            // alert("GAME OVERRRRR");
            LockGame();
        }
        else {
            ToggleCurrentPlayer();
            HTMLcontroller.SetActivePlayer(currentPlayer - 1);
        }
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

        SetCurrentPlayer();
    }

    function RecolorWinningPanels(winningPanelsCombo) {
        for (let i = 0; i < winningPanelsCombo.length; i++) {
            HTMLcontroller.MarkSpaceAsVictor(winningPanelsCombo[i][0], winningPanelsCombo[i][1]);
        }
    }

    function SetCurrentPlayer() {
        r.style.setProperty('--colorPlayerCurrent', getComputedStyle(r).getPropertyValue((currentPlayer == spacePlayerOne) ? '--colorPlayerOne' : '--colorPlayerTwo'));
        r.style.setProperty('--currentSymbolURL', getComputedStyle(r).getPropertyValue((currentPlayer == spacePlayerOne) ? '--imageURLx' : '--imageURLo'));
        r.style.setProperty('--currentSymbolSize', getComputedStyle(r).getPropertyValue((currentPlayer == spacePlayerOne) ? '--sizePercentPlayerOne' : '--sizePercentPlayerTwo'));
    }

    function CheckWin(player) {
        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            let combo = WINNING_COMBINATIONS[i];
            if ((boardGrid[combo[0][0]][combo[0][1]] == player)
            && (boardGrid[combo[1][0]][combo[1][1]] == player)
            && (boardGrid[combo[2][0]][combo[2][1]] == player)) {
                //console.log("YOU'RE WINNER_" + player + "should now return TRUE");
                playerVictor = player;
                RecolorWinningPanels(combo);
                return true;
            }
        }
        //console.log("returning FALSE");
        return false;
    }

    function GameIsOver() {
        return (CheckWin(spacePlayerOne) || CheckWin(spacePlayerTwo) || AllSquaresOccupied());
    }

    function AllSquaresOccupied() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (boardGrid[i][j] == spaceEmpty)
                    return false;
            }
        }
        return true;
    }

    function LockGame() {
        gameLocked = true;
        
        // lock the hover functionality
        //r.style.setProperty('--colorPlayerCurrent', 'white');
        r.style.setProperty('--currentSymbolURL', '');

        // if the game is over because we ran out of spaces, set the active player to no one
        if (AllSquaresOccupied && playerVictor == spaceEmpty) {
            HTMLcontroller.SetBothPlayersInactive();
            r.style.setProperty('--gridSquareBgOccupied', getComputedStyle(r).getPropertyValue('--gridSquareBg'));
        }
    }

    const ClickOnSpace = (index) => {
        if (gameLocked)
            return;
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
        InitializeGame,
        MarkSpaceWithPlayer,
        printBoardState,
        ClickOnSpace
    }
})();

const HTMLcontroller = (() => {
    const r = document.querySelector(':root');
    
    const gridParentDiv = document.querySelector(".gameGrid");
    let gridSquareDivs = [];

    let playerOneHUD = null;

    const InitializeApp = () => {
        const StartGameModal = document.querySelector(".StartGameModal");
        const StartGameButton = document.getElementById("StartGameButton");

        StartGameModal.showModal();

        StartGameButton.addEventListener("click", () => {
            StartGameModal.close();
            ShowSelectionScreen();
        });

        StartGameModal.close();
            ShowSelectionScreen();
    }

    function ShowSelectionScreen() {
        const SelectionScreenModal = document.querySelector(".SelectScreenModal");
        const FightButton = document.getElementById("FightButton");
        //FightButton

        SelectionScreenModal.showModal();

        FightButton.addEventListener("click", () => {
            SelectionScreenModal.close();
            gameBoard.InitializeGame();
        });

        let allFighters = document.querySelectorAll(".fighterParent");
        for (let i = 0; i < allFighters.length; i++) {
            let currentFighterNode = allFighters[i];
            let playerNumber = currentFighterNode.id;
            console.log(playerNumber);

            let colorPicker = currentFighterNode.querySelector('input[type="color"]');
            colorPicker.addEventListener("input", (event) => {
                let customColor = event.target.value;
                switch (~~playerNumber) { // the ~tildes~ are required or it won't work
                    case spacePlayerOne:
                        r.style.setProperty('--colorPlayerOne', customColor);
                        break;
                    case spacePlayerTwo:
                        r.style.setProperty('--colorPlayerTwo', customColor);
                        break;
                    default:
                        console.log("nothing found");
                }
            });

            let playerNameInput = currentFighterNode.querySelector('input[type="text"]');
            playerNameInput.addEventListener("input", (event) => {
                // console.log(playerNameInput.value);
                switch (~~playerNumber) { // the ~tildes~ are required or it won't work
                    case spacePlayerOne:
                        player1Name = playerNameInput.value;
                        break;
                    case spacePlayerTwo:
                        player2Name = playerNameInput.value;
                        break;
                }

                UpdateNameTagText();
            });
        }
    }

    function UpdateNameTagText() {
        let nameTags = document.querySelectorAll(".nameTagParent p");
        nameTags[0].textContent = player1Name;
        nameTags[1].textContent = player2Name;
    }
    
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

    const SetBothPlayersInactive = () => {
        let playerHTMLroots = document.getElementsByClassName("activePlayerBackground");
        playerHTMLroots[0].classList.remove("active");
        playerHTMLroots[1].classList.remove("active");
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

    const MarkSpaceAsVictor = (row, column) => {
        let currentSpace = gridSquareDivs[row][column];
        currentSpace.classList.add("victory");
    }

    function PrintDivs() {
        console.log(gridSquareDivs.length);
        gridSquareDivs.forEach(function(child) {
            console.log(child);
        });
    }

    return {
        InitializeApp,
        InitializeGame,
        MarkSpaceWithPlayer,
        SetActivePlayer,
        SetBothPlayersInactive,
        MarkSpaceAsVictor,
    }
})();

HTMLcontroller.InitializeApp();

// console.log(game.boardGrid[0][0]); // produces error because boardGrid is private

