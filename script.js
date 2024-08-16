// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

var currentPlayerID = spacePlayerOne;
var playerVictor = null;
var playerVictorCombo = null;
var gameLocked = true; // start as true
function InputIsAllowed() { return (!gameLocked && CurrentPlayer().isCPU == false); }

let players = []; // a 2D array consisting of 2 Player objects
function Player1() { return players[0]; }
function Player2() { return players[1]; }
function CurrentPlayer() { return players[currentPlayerID - 1]; }
function CurrentPlayerOpponent() { return players[currentPlayerID % 2]; }

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
    this.boardGrid; // this is "function scope", ie, private

    const SetInitialGameState = () => {
        ResetBoard();

        players = []; // make sure we clear out the old Player objects
        players[0] = new Player(0, "Player 1", getComputedStyle(document.querySelector(':root')).getPropertyValue('--colorPlayerOne'), 0);
        players[1] = new Player(1, "Player 2", getComputedStyle(document.querySelector(':root')).getPropertyValue('--colorPlayerTwo'), 1);
    };

    const StartGame = () => {
        gameLocked = false;
        CheckForCPU();
    };

    const ResetBoard = () => {
        this.boardGrid = Array(3).fill().map(() => Array(3).fill(0));
        playerVictor = null;
        playerVictorCombo = null;
        gameLocked = true;
        currentPlayerID = spacePlayerOne;
    }
    
    async function MarkSpaceWithPlayer (row, column, playerNumber) {
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);
        HTMLcontroller.SetPlayerInputBlocker(true);

        // add a pause here
        await ComputerPlayer.sleep(500);

        if (GameIsOver() == true) {
            LockGame();

            if (playerVictor != null) {
                await ComputerPlayer.sleep(500);
                await RecolorWinningPanels(playerVictorCombo);
                await ComputerPlayer.sleep(750);
            }

            HTMLcontroller.ShowVictoryScreen();
        }
        else {
            ToggleCurrentPlayer();
            HTMLcontroller.SetActivePlayer(currentPlayerID - 1);
        }
    }

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
        //console.log("check if player is AI here _" + CurrentPlayer().isCPU);
        HTMLcontroller.SetPlayerInputBlocker(CurrentPlayer().isCPU);
        if (CurrentPlayer().isCPU) {
            ComputerPlayer.PerformMove(boardGrid);
        }
    }

    async function RecolorWinningPanels(winningPanelsCombo) {
        for (let i = 0; i < winningPanelsCombo.length; i++) {
            HTMLcontroller.MarkSpaceAsVictor(winningPanelsCombo[i][0], winningPanelsCombo[i][1]);
            await ComputerPlayer.sleep(250);
        }
    }

    function CheckWin(playerID) {
        let player = players[playerID-1]
        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            let combo = WINNING_COMBINATIONS[i];
            if ((boardGrid[combo[0][0]][combo[0][1]] == playerID)
            && (boardGrid[combo[1][0]][combo[1][1]] == playerID)
            && (boardGrid[combo[2][0]][combo[2][1]] == playerID)) {
                //console.log("YOU'RE WINNER_" + player + "should now return TRUE");
                playerVictor = player;
                playerVictorCombo = combo;
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
        HTMLcontroller.SetPlayerInputBlocker(true);
        
        HTMLcontroller.ApplyLockVisual(AllSquaresOccupied && playerVictor == null);
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
        ResetBoard,
        ClickOnSpace
    }
})();

const HTMLcontroller = (() => {
    const r = document.querySelector(':root');
    
    const gridParentDiv = document.querySelector(".gameGrid");
    let gridSquareDivs = [];

    let playerOneHUD = null;

    const InitializeApp = () => {
        gameBoard.SetInitialGameState();

        AddEventListeners();
        
        const StartGameModal = document.querySelector(".StartGameModal");
        const StartGameButton = document.getElementById("StartGameButton");

        StartGameModal.showModal();

        StartGameButton.addEventListener("click", () => {
            StartGameModal.close();
            ShowSelectionScreen();
        });

        // console.log("TODO: Add the intro screen");
        StartGameModal.close();
        InitializeGame();
        ShowSelectionScreen();
    }

    function ShowSelectionScreen() {
        const SelectionScreenModal = document.querySelector(".SelectScreenModal");

        // prevent automatic tab selection
        SelectionScreenModal.inert = true;
        SelectionScreenModal.showModal();
        SelectionScreenModal.inert = false;

        HideGameGrid();
    }

    const HideGameGrid = () => {
        document.querySelector(".gameGridRoot .whiteOverlay").style.display = "block";

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gridSquareDivs[i][j].classList.add('hidden');
            }
        }

        // ANIMATE HUD
        const HUDpanels = document.querySelectorAll(".activePlayerBackground");
        for (let i = 0; i < HUDpanels.length; i++) {
            let HUDpanel = HUDpanels[i];
            HUDpanel.classList.add("HiddenState");
        }
    };

    const ShowVictoryScreen = () => {
        const VictoryScreenModal = document.querySelector(".VictoryScreenModal");
        const DialogBackdrop = document.querySelector(".dialogBackdrop");

        DialogBackdrop.style.display = "block";

        if (playerVictor == null) {
            VictoryScreenModal.classList.add("TieGame");
            VictoryScreenModal.querySelector("h2").textContent = `It's a tie!`;
            //VictoryScreenModal.querySelector("img").src = ``;
        }
        else {
            VictoryScreenModal.classList.remove("TieGame");
            VictoryScreenModal.querySelector("h2").textContent = `${playerVictor.name}`;
            VictoryScreenModal.querySelector("img").src = `img/avatar/${playerVictor.avatar}.png`;
            VictoryScreenModal.querySelector(".VictoryScreen").id = playerVictor.id + 1;
        }

        // prevent auto tab highlighting 
        VictoryScreenModal.inert = true;
        VictoryScreenModal.showModal();
        VictoryScreenModal.inert = false;
    };



    const RandomizePlayer = (player) => {
        // name
        let playerNames = [Player1().name, Player2().name];
        player.name = `${shuffleController.GetRandomAdj(playerNames)} ${shuffleController.GetRandomNoun(playerNames)}`
        
        // avatar
        let playerAvatars = [Player1().avatar, Player2().avatar];
        player.avatar = shuffleController.getRandomAvatar(playerAvatars);
        
        // color
        let playerColors = [Player1().color, Player2().color];
        player.color = shuffleController.getRandomColorRGB(playerColors);
    };

    const SelectScreenRefreshPlayer = (currentFighter, currentFighterNode) => {
        // AVATAR
        let currentAvatar = currentFighterNode.querySelector('img');
        currentAvatar.src = ``;
        currentAvatar.src = `img/avatar/${currentFighter.avatar}.png`;

        // NAME
        let playerNameInput = currentFighterNode.querySelector('input[type="text"]');
        playerNameInput.value = currentFighter.name;

        // COLOR
        let colorPicker = currentFighterNode.querySelector('input[type="color"]');
        colorPicker.value = currentFighter.color;

        let toggleIsHuman = currentFighterNode.querySelector('[name="isHumanToggle"]');
        currentFighter.isCPU = (!toggleIsHuman.checked); // do this at least once in case it's set checked/unchecked in the HTML

        UpdatePlayerHUD();
    };

    
    const VictoryScreenModal = document.querySelector(".VictoryScreenModal");

    const PlayAgainButton = document.getElementById("PlayAgainButton");
    PlayAgainButton.addEventListener("click", () => {
        VictoryScreenModal.close();
        gameBoard.ResetBoard();
        RefreshBoardVisual();

        ShowSelectionScreen();
    });

    const AddEventListeners = () => {
        const FightButton = document.getElementById("FightButton");

        // when the "FIGHT" button is clicked, we start the new game
        // this is where all the player input needs to be read, and inserted into the game
        FightButton.addEventListener("click", () => {
            FightButtonClicked();
        });

        let allFighters = document.querySelectorAll(".fighterParent");
        for (let i = 0; i < allFighters.length; i++) {
            let currentFighterNode = allFighters[i];
            let currentFighter = players[i];

            // sync the display with the default player info
            SelectScreenRefreshPlayer(currentFighter, currentFighterNode);

            // AVATAR
            let avatarSpace = currentFighterNode.querySelector(".characterSelectAvatarParent");
            avatarSpace.addEventListener("click", (event) => {
                currentFighter.avatar = (currentFighter.avatar + 1) % TOTAL_AVATARS;
                SelectScreenRefreshPlayer(currentFighter, currentFighterNode);
            });

            // COLOR PICKER
            let colorPicker = currentFighterNode.querySelector('input[type="color"]');
            colorPicker.addEventListener("input", (event) => {
                let customColor = event.target.value;
                currentFighter.color = customColor;
                UpdateColors();
            });

            // PLAYER NAME
            let playerNameInput = currentFighterNode.querySelector('input[type="text"]');
            playerNameInput.addEventListener("input", (event) => {
                currentFighter.name = playerNameInput.value;
                // basic check to make sure the player's name isn't blank
                if (currentFighter.name.trim().length == 0) {
                    currentFighter.name = "Player " + (currentFighter.id + 1);
                }
            });

            // IS HUMAN?
            let toggleIsHuman = currentFighterNode.querySelector('[name="isHumanToggle"]');
            toggleIsHuman.addEventListener("input", (event) => {
                //console.log(toggleIsHuman.checked);
                currentFighter.isCPU = (!toggleIsHuman.checked);
            });

            // SHUFFLE
            let shuffleButton = currentFighterNode.querySelector(".shuffleButton");
            shuffleButton.addEventListener("click", (event) => {
                RandomizePlayer(currentFighter);
                SelectScreenRefreshPlayer(currentFighter, currentFighterNode);

                // play the overlay flash animation
                let overlayFlash = currentFighterNode.querySelector(".fighterOverlayFlash");
                // removing, accessing the offset, and adding the class will make the animation play
                overlayFlash.classList.remove("fighterOverlayFlash");
                void overlayFlash.offsetWidth;
                overlayFlash.classList.add("fighterOverlayFlash"); 
            });
        }

        // Preload all images in the game
        for (let i = 0; i < TOTAL_AVATARS; i++) {
            let img = new Image(); // need to create a new one each time, or it won't actually load anything
            img.src = `img/avatar/${i}.png`;
        }
        let img2 = new Image();
        img2.src = `img/batsu.svg`;
        let img3 = new Image();
        img3.src = `img/maru.svg`;

    };

    async function FightButtonClicked () {
        const SelectionScreenModal = document.querySelector(".SelectScreenModal");
        const DialogBackdrop = document.querySelector(".dialogBackdrop");
        const gridWhiteOverlay = document.querySelector(".gameGridRoot .whiteOverlay");

        UpdatePlayerHUD();
        
        SelectionScreenModal.classList.add("PlayFadeOut");
        await ComputerPlayer.sleep(500);
        SelectionScreenModal.close();
        SelectionScreenModal.classList.remove("PlayFadeOut");
        SelectionScreenModal.classList.remove("PlayFadeOutBackdrop");

        DialogBackdrop.classList.add("PlayFadeOutBackdrop");
        await ComputerPlayer.sleep(500);
        DialogBackdrop.style.display = "none";
        DialogBackdrop.classList.remove("PlayFadeOutBackdrop");


        // ANIMATE HUD
        SetBothPlayersInactive();
        document.querySelector(".hudParent .whiteOverlay").style.display = "none";
        const HUDpanels = document.querySelectorAll(".activePlayerBackground");
        for (let i = 0; i < HUDpanels.length; i++) {
            let HUDpanel = HUDpanels[i];
            HUDpanel.classList.remove("HiddenState");
            await ComputerPlayer.sleep(250);
        }

        await ComputerPlayer.sleep(250);

        // ANIMATE PANELS
        gridWhiteOverlay.style.display = "none";

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gridSquareDivs[i][j].classList.add('fadingIn');
                gridSquareDivs[i][j].classList.add('darkenedSquare');
                gridSquareDivs[i][j].classList.remove('hidden');
                await ComputerPlayer.sleep(100);
            }
        }

        await ComputerPlayer.sleep(750);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gridSquareDivs[i][j].classList.remove('fadingIn');
                gridSquareDivs[i][j].classList.remove('darkenedSquare');
            }
        }

        SetActivePlayer(0);
        SetHoverPreviewToCurrentPlayer();
        gameBoard.StartGame();
    }

    const RefreshBoardVisual = () => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                MarkSpaceWithPlayer(i, j, spaceEmpty);
            }
        }

        r.style.setProperty('--gridSquareBgOccupied', 'white');
    };

    const SetPlayerInputBlocker = (isVisible) => {
        const inputBlockOverlay = document.querySelector(".inputBlock");
        inputBlockOverlay.style.display = (isVisible) ? "block" : "none";
    };


    const UpdatePlayerHUD = () => {
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

        let avatars = document.querySelectorAll(".playerHUD img");
        avatars[0].src = `img/avatar/${Player1().avatar}.png`;
        avatars[1].src = `img/avatar/${Player2().avatar}.png`;
    };

    const SetHoverPreviewToCurrentPlayer = () => {
        r.style.setProperty('--colorPlayerCurrent', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--colorPlayerOne' : '--colorPlayerTwo'));
        r.style.setProperty('--currentSymbolSize', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--sizePercentPlayerOne' : '--sizePercentPlayerTwo'));
        r.style.setProperty('--currentSymbolURL', getComputedStyle(r).getPropertyValue((currentPlayerID == spacePlayerOne) ? '--imageURLx' : '--imageURLo'));
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
    }

    const SetActivePlayer = (playerNumber) => {
        let playerHTMLroots = document.getElementsByClassName("activePlayerBackground");
        playerHTMLroots[(playerNumber+1)%2].classList.remove("active");
        playerHTMLroots[playerNumber].classList.add("active");
    }

    const ApplyLockVisual = (matchEndedInTie) => {
        if (matchEndedInTie) {
            SetBothPlayersInactive();
        }
        r.style.setProperty('--gridSquareBgOccupied', getComputedStyle(r).getPropertyValue('--gridSquareBg'));
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

        if (playerNumber == spaceEmpty) {
            currentSpace.classList.remove("occupied", "clicked", "playerX", "playerO", "victory");
            return;
        }

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

    return {
        InitializeApp,
        InitializeGame,
        SetPlayerInputBlocker,
        UpdateNameTagText,
        SetHoverPreviewToCurrentPlayer,
        MarkSpaceWithPlayer,
        SetActivePlayer,
        ApplyLockVisual,
        MarkSpaceAsVictor,
        ShowVictoryScreen,
    }
})();

HTMLcontroller.InitializeApp();

// console.log(game.boardGrid[0][0]); // produces error because boardGrid is private