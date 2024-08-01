// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1; // x
const spacePlayerTwo = 2; // o

var currentPlayerID = spacePlayerOne;
var playerVictor = null;
var gameLocked = true; // start as true
function InputIsAllowed() { return (!gameLocked && CurrentPlayer().isCPU == false); }

let players = []; // a 2D array consisting of 2 Player objects
function Player1() { return players[0]; }
function Player2() { return players[1]; }
function CurrentPlayer() { return players[currentPlayerID - 1]; }

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

// names used for the shuffle feature
const NAME_ADJECTIVES = [
    "Inquisitive",
    "Curious",
    "Defective",
    "Esoteric",
    "Crazy",
    "Intolerant",
    "Angsty",
    "Salty",
    "Sneaky",
    "Suspicious",
    "Overstimulated",
    "Cynical",
    "Malding",
    "Magical",
    "Assertive",
    "Mysterious",
    "Auxiliary",
    "Naughty",
    "Persuasive",
    "Stinky",
    "Tasty",
    "Gassy",
    "Sassy",
    "Unhinged",
    "Illiterate",
    "Humongous",
    "Ginormous",
    "Invasive",
    "Unregistered",
    "Existential",
    "Obnoxious",
    "Milquetoast",
    "Unfunny",
    "Squishy",
    "Redundant",
    "Deceptive",
    "Spunky",
    "Moist",
    "Scrumptious",
    "Liquified",
    "Undercover",
    "Untrustworthy",
    "Unethical",
    "Authoritarian",
    "Submissive",
    "Skeptical",
    "Fruity",
    "Deepfake",
    "Awkward",
    "Oblivious",
    "Delectable",
    "Chonky",
    "Nihilistic",
    "Perplexing",
    "Deadbeat",
    "Judgemental",
    "Insufferable",
    "Medium Rare",
    "Deep Fried",
    "Unauthorized",
    "Uncomfortable",
    "Bootleg",
    "Thirsty",
];

const NAME_NOUN = [
    "Pickle",
    "Cucumber",
    "Pineapple",
    "Fox",
    "Ninja",
    "Turtle",
    "Trickster",
    "Edgelord",
    "Lurker",
    "Pumpkin",
    "Cupcake",
    "Beaver",
    "Quokka",
    "Binturong",
    "Porcupine",
    "Salesman",
    "Pizza",
    "Enigma",
    "Tachyon",
    "Techbro",
    "Normie",
    "Goober",
    "Kangaroo",
    "Dingus",
    "Crybaby",
    "Chungus",
    "Dingleberry",
    "Kumquat",
    "Snafu",
    "Bamboozler",
    "Rizzler",
    "Cutie",
    "Pastafarian",
    "Meatball",
    "Snack",
    "Pancake",
    "Pikelet",
    "Lemon",
    "Leprechaun",
    "Kibble",
    "Himbo",
    "Scrunko",
    "Munchkin",
    "Daddy",
    "Bootlicker",
    "Marmalade",
    "Coconut",
    "Hipster",
    "Weaboo",
    "Beefcake",
]

const TOTAL_AVATARS = 16;

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
        playerVictor = null
        gameLocked = true;
    }
    
    async function MarkSpaceWithPlayer (row, column, playerNumber) {
        boardGrid[row][column] = playerNumber;
        HTMLcontroller.MarkSpaceWithPlayer(row, column, playerNumber);
        HTMLcontroller.SetPlayerInputBlocker(true);

        // add a pause here
        await ComputerPlayer.sleep(500);

        if (GameIsOver() == true) {
            LockGame();
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

    function RecolorWinningPanels(winningPanelsCombo) {
        for (let i = 0; i < winningPanelsCombo.length; i++) {
            HTMLcontroller.MarkSpaceAsVictor(winningPanelsCombo[i][0], winningPanelsCombo[i][1]);
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
        HTMLcontroller.SetPlayerInputBlocker(true);
        
        HTMLcontroller.ApplyLockVisual(AllSquaresOccupied && playerVictor != null && playerVictor.id == spaceEmpty);
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

const ComputerPlayer = (() => {
    const PerformMove = (boardGrid) => {
        let thinkingTime = (Math.random() * 2500) + 500;
        
        sleep(thinkingTime).then(() => { CalculateAndExecuteMove(boardGrid); });
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
        let randomlyChosenElement = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
        //let chosenSpaceIndex = candidates.indexOf(Math.max(...candidates));
        gameBoard.ClickOnSpace(randomlyChosenElement, true);
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

    // https://www.sitepoint.com/delay-sleep-pause-wait/
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return {
        PerformMove,
        sleep,
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

        StartGameModal.close();
            ShowSelectionScreen();
    }

    function ShowSelectionScreen() {
        const SelectionScreenModal = document.querySelector(".SelectScreenModal");
        const FightButton = document.getElementById("FightButton");

        SelectionScreenModal.showModal();
    }

    const ShowVictoryScreen = () => {
        const VictoryScreenModal = document.querySelector(".VictoryScreenModal");

        if (playerVictor == null) {
            VictoryScreenModal.querySelector("h2").textContent = `It's a tie!`;
            VictoryScreenModal.querySelector("img").src = ``;
        }
        else {
            VictoryScreenModal.querySelector("h2").textContent = `${playerVictor.name} wins!`;
            VictoryScreenModal.querySelector("img").src = `img/avatar/${playerVictor.avatar}.png`;
            VictoryScreenModal.querySelector(".VictoryScreen").id = playerVictor.id + 1;
        }

        VictoryScreenModal.showModal();
    };



    const RandomizePlayer = (player) => {
        // logic added to prevent ever reusing the same words from the previous name
        let newAdjIndex = Math.floor(Math.random() * NAME_ADJECTIVES.length);
        if (player.name.includes(NAME_ADJECTIVES[newAdjIndex]))
            newAdjIndex = (newAdjIndex + 1) % (NAME_ADJECTIVES.length - 1);
        let newNounIndex = Math.floor(Math.random() * NAME_NOUN.length);
        if (player.name.includes(NAME_NOUN[newNounIndex]))
            newNounIndex = (newNounIndex + 1) % (NAME_NOUN.length - 1);
        player.name = `${NAME_ADJECTIVES[newAdjIndex]} ${NAME_NOUN[newNounIndex]}`
        
        // never shuffle the exact same avatar we already have
        let newAvatar = Math.min(Math.floor(Math.random() * (TOTAL_AVATARS)), TOTAL_AVATARS - 1);
        if (player.avatar == newAvatar)
            newAvatar = (player.avatar + 1) % (TOTAL_AVATARS - 1);
        player.avatar = newAvatar;
        
        // generate a random color
        let newColorAngle = Math.round(Math.random() * 360);
        let newColorSaturation = 1 - (Math.random() * Math.random()); // multiply two random numbers so you end up with ~ 75%
        let newColorLuminosity = 0.5 - (0.5 * (Math.random() * Math.random() * Math.random())); // 3 random numbers, so you end up with ~ 88% brightness and pure black is less likely
        let newColor = hsl2rgb(newColorAngle, newColorSaturation, newColorLuminosity);
        // if the new color is too similar to the previous one, adjust the angle and regenerate it
        if (isSimilar(getRGB(player.color), getRGB(newColor)))
            newColor = hsl2rgb((newColorAngle + 60 + (30 * Math.random())) % 360, newColorSaturation, newColorLuminosity);
        player.color = newColor;
        console.log(newColorSaturation);
        //console.log(getRGB(player.color));
    };

    // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    // input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
    function hsl2rgb(h,s,l) 
    {
        let a=s*Math.min(l,1-l);
        let f= (n,k=(n+h/30)%12) => (l - a*Math.max(Math.min(k-3,9-k,1),-1));
        //return [f(0),f(8),f(4)];
        //return `rgb(${Math.round(f(0) * 255)},${Math.round(f(8) * 255)},${Math.round(f(4) * 255)})`;
        return RGBToHex(Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255));
    }  

    // https://css-tricks.com/converting-color-spaces-in-javascript/
    function RGBToHex(r,g,b) {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);
      
        if (r.length == 1)
          r = "0" + r;
        if (g.length == 1)
          g = "0" + g;
        if (b.length == 1)
          b = "0" + b;
      
        return "#" + r + g + b;
      }

      // https://stackoverflow.com/questions/61775790/how-can-we-find-out-if-two-colors-are-similar-or-not
      function getRGB(color) {
        color = parseInt(color.substring(1), 16);
        red = color >> 16;
        g = (color - (red<<16)) >> 8;
        b = color - (red<<16) - (g<<8);
        return [red, g, b];
      }
      function isSimilar([r1, g1, b1], [r2, g2, b2]) {
        return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2) < 180;
      }

    const SelectScreenRefreshPlayer = (currentFighter, currentFighterNode) => {
        // AVATAR
        let currentAvatar = currentFighterNode.querySelector('img');
        currentAvatar.src = `img/avatar/${currentFighter.avatar}.png`;

        // NAME
        let playerNameInput = currentFighterNode.querySelector('input[type="text"]');
        playerNameInput.value = currentFighter.name;

        // COLOR
        let colorPicker = currentFighterNode.querySelector('input[type="color"]');
        colorPicker.value = currentFighter.color;

        let toggleIsHuman = currentFighterNode.querySelector('[name="isHumanToggle"]');
        currentFighter.isCPU = (!toggleIsHuman.checked); // do this at least once in case it's set checked/unchecked in the HTML

        SetupPlayerHUD();
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
        const SelectionScreenModal = document.querySelector(".SelectScreenModal");
        const FightButton = document.getElementById("FightButton");

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
            let currentFighter = players[i];

            // sync the display with the default player info
            SelectScreenRefreshPlayer(currentFighter, currentFighterNode);

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

                let overlayFlash = currentFighterNode.querySelector(".fighterOverlayFlash");
                overlayFlash.classList.remove("fighterOverlayFlash");
                void overlayFlash.offsetWidth;
                overlayFlash.classList.add("fighterOverlayFlash"); 
            });
        }

        // Preload all images in the game
        let img = new Image();
        for (let i = 0; i < TOTAL_AVATARS; i++) {
            img.src = `img/avatar/${i}.png`;
        }
        img.src = `img/batsu.svg`;
        img.src = `img/maru.svg`;
        img.src = ``;

    };

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

        SetActivePlayer(0);
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