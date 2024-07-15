

// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

// player names
var player1Name = "Player 1"; // this feels like it could go into a class maybe?
var player2Name = "Player 2";

var currentPlayerID = spacePlayerOne;
var playerVictor = spaceEmpty;
var gameLocked = true; // start as true
function InputIsAllowed() { return (!gameLocked && CurrentPlayer().isCPU == false); }

let players = []; // a 2D array consisting of 2 Player objects
function Player1() { return players[0]; }
function Player2() { return players[1]; }
function CurrentPlayer() { return players[currentPlayerID - 1]; }
//const Player1 = () => { return players[0]; };
//const Player2 = () => { return players[1]; };

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

// PLAYER CLASS
// used to store info about an individual player, mainly for aesthetic reasons
class Player {
    // a '#' in front makes these variables private
    id = 0;
    name = "";
    color = "#ffffff";
    avatar = 0;

    isCPU = false;
    
    constructor(id, name, color, avatar) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.avatar = avatar;
    }
}

const gameBoard = (() => {
    // create a 2d array where each cell contains a 0
    // let array = Array(rows).fill().map(() => Array(columns).fill(0));
    this.boardGrid = Array(3).fill().map(() => Array(3).fill(0)); // this is "function scope", ie, private

    const SetInitialGameState = () => {
        playerVictor = spaceEmpty
        gameLocked = true;
        allowInput = false;

        players = []; // make sure we clear out the old Player objects
        players[0] = new Player(0, "Player 1", getComputedStyle(document.querySelector(':root')).getPropertyValue('--colorPlayerOne'), 0);
        players[1] = new Player(1, "Player 2", getComputedStyle(document.querySelector(':root')).getPropertyValue('--colorPlayerTwo'), 0);
    };

    const StartGame = () => {
        gameLocked = false;
        CheckForCPU();
    };
    
    const MarkSpaceWithPlayer = (row, column, playerNumber) => {
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);

        if (GameIsOver() == true) {
            LockGame();
        }
        else {
            ToggleCurrentPlayer();
            HTMLcontroller.SetActivePlayer(currentPlayerID - 1);
        }
    };

    function ToggleCurrentPlayer() {
        switch(currentPlayerID) {
            case spacePlayerOne:
                currentPlayerID = spacePlayerTwo;
                break;
            case spacePlayerTwo:
                currentPlayerID = spacePlayerOne;
                break;
        }

        HTMLcontroller.SetHoverPreviewToCurrentPlayer();

        CheckForCPU();
    }

    function CheckForCPU() {
        console.log("check if player is AI here _" + CurrentPlayer().isCPU);
        if (CurrentPlayer().isCPU) {
            //allowInput = false;
            ComputerPlayer.PerformMove(boardGrid);
        }
    }

    function RecolorWinningPanels(winningPanelsCombo) {
        for (let i = 0; i < winningPanelsCombo.length; i++) {
            HTMLcontroller.MarkSpaceAsVictor(winningPanelsCombo[i][0], winningPanelsCombo[i][1]);
        }
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
        
        HTMLcontroller.ApplyLockVisual(AllSquaresOccupied && playerVictor == spaceEmpty);
    }

    const ClickOnSpace = (index, override = false) => {
        if (!InputIsAllowed() && !override)
            return;
        
        // convert index to 2D array coordinates
        let y = Math.floor(index / 3);
        let x = index % 3

        if (boardGrid[y][x] == spaceEmpty)
            MarkSpaceWithPlayer (y, x, currentPlayerID);
    };

    return {
        SetInitialGameState,
        StartGame,
        ClickOnSpace
    }
})();

const ComputerPlayer = (() => {
    const PerformMove = (boardGrid) => {
        sleep(2000).then(() => { CalculateAndExecuteMove(boardGrid); });
    }

    const CalculateAndExecuteMove = (boardGrid) => {
        // go through each space and give it a "weight" based on a heuristic
        // want to rank options by some simple logic, in decreasing score:
        // if that space will win the game, give it full marks (and terminate there tbh)
        // if that space will block the other player from winning, we need to pick that, so store this but don't terminate early because there still might be a winner
        // for whatever's left, score it based on how many remaining winning combinations it's included in, and add it to a list
        // if that space is occupied, ignore it
        // once we've gone through this process:
        // do we have a "blocker"? If so, return that
        // else, return the candidate with the highest score

        // examine each space and for now, return any space that's valid
        let candidates = Array(9).fill(-1); // start by marking each space with -1
        for (let i = 0; i < candidates.length; i++) {
            // convert index to 2D array coordinates
            let y = Math.floor(i / 3);
            let x = i % 3
            let currentSpace = boardGrid[y][x];
            if (currentSpace != spaceEmpty) {
                continue; // skip this one
            }
            candidates[i] = 0; // mark this space as valid
            // we're not going to check anything else for now lol
        }

        bestCandidates = getAllIndexes(candidates, Math.max(...candidates));
        let randomElement = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
        //let chosenSpaceIndex = candidates.indexOf(Math.max(...candidates));
        gameBoard.ClickOnSpace(randomElement, true);
    }

    // get an array with all the indexes of a given value VAL in an array ARR
    // https://stackoverflow.com/questions/20798477/how-to-find-the-indexes-of-all-occurrences-of-an-element-in-array
    const getAllIndexes = (arr, val) => {
        var indexes = [], i;
        for(i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indexes.push(i);
        return indexes;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    //sleep(2000).then(() => { console.log('World!'); });

    return {
        PerformMove,
    }
})();

const HTMLcontroller = (() => {
    const r = document.querySelector(':root');
    
    const gridParentDiv = document.querySelector(".gameGrid");
    let gridSquareDivs = [];

    let playerOneHUD = null;

    const InitializeApp = () => {
        gameBoard.SetInitialGameState();
        
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

        SelectionScreenModal.showModal();

        // when the "FIGHT" button is clicked, we start the new game
        // this is where all the player input needs to be read, and inserted into the game
        FightButton.addEventListener("click", () => {
            SetupPlayerHUD();
            
            SelectionScreenModal.close();

            SetHoverPreviewToCurrentPlayer();
            InitializeGame();
            gameBoard.StartGame();
        });

        let allFighters = document.querySelectorAll(".fighterParent");
        for (let i = 0; i < allFighters.length; i++) {
            let currentFighterNode = allFighters[i];
            //players[i] = new Player(currentFighterNode.id, "Player " + (i+1), 'white', 0);
            let currentFighter = players[i];
            //let playerNumber = currentFighterNode.id;
            console.log(currentFighter.id);

            let colorPicker = currentFighterNode.querySelector('input[type="color"]');
            colorPicker.addEventListener("input", (event) => {
                let customColor = event.target.value;
                currentFighter.color = customColor;
                UpdateColors();
            });

            let playerNameInput = currentFighterNode.querySelector('input[type="text"]');
            playerNameInput.addEventListener("input", (event) => {
                currentFighter.name = playerNameInput.value;
                // basic check to make sure the player's name isn't blank
                if (currentFighter.name.trim().length == 0) {
                    currentFighter.name = "Player " + (currentFighter.id + 1);
                }
            });

            let toggleIsHuman = currentFighterNode.querySelector('#isHumanToggle');
            toggleIsHuman.addEventListener("input", (event) => {
                //console.log(toggleIsHuman.checked);
                currentFighter.isCPU = (!toggleIsHuman.checked);
            });
        }
    }


    const SetupPlayerHUD = () => {
        UpdateColors();
        UpdateNameTagText();
    };
    
    const UpdateColors = () => {
        r.style.setProperty('--colorPlayerOne', Player1().color);
        r.style.setProperty('--colorPlayerTwo', Player2().color);
    };

    
    const UpdateNameTagText = () => {
        let nameTags = document.querySelectorAll(".nameTagParent p");
        nameTags[0].textContent = Player1().name;
        nameTags[1].textContent = Player2().name;
    };

    const SetHoverPreviewToCurrentPlayer = () => {
        r.style.setProperty('--colorPlayerCurrent', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--colorPlayerOne' : '--colorPlayerTwo'));
        r.style.setProperty('--currentSymbolURL', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--imageURLx' : '--imageURLo'));
        r.style.setProperty('--currentSymbolSize', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--sizePercentPlayerOne' : '--sizePercentPlayerTwo'));
    };
    
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

    const ApplyLockVisual = (matchEndedInTie) => {
        r.style.setProperty('--currentSymbolURL', '');

        // if the game is over because we ran out of spaces, set the active player to no one
        if (matchEndedInTie) {
            SetBothPlayersInactive();
            r.style.setProperty('--gridSquareBgOccupied', getComputedStyle(r).getPropertyValue('--gridSquareBg'));

            // get rid of the "clicked" state

        }
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
        if (!currentSpace.classList.contains("clicked"))
            currentSpace.classList.add("clicked");

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
        UpdateNameTagText,
        SetHoverPreviewToCurrentPlayer,
        MarkSpaceWithPlayer,
        SetActivePlayer,
        ApplyLockVisual,
        MarkSpaceAsVictor,
    }
})();

HTMLcontroller.InitializeApp();

// console.log(game.boardGrid[0][0]); // produces error because boardGrid is private