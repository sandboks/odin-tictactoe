// class containing all the logic for the computer player AI
// also used for artifical pauses in the game

const ComputerPlayer = (() => {
    const PerformMove = (boardGrid) => {
        let thinkingTime = (Math.random() * 2500) + 500;
        
        sleep(thinkingTime).then(() => { CalculateAndExecuteMove(boardGrid); });
    }

    const CalculateAndExecuteMove = (boardGrid) => {
        let candidates = CalculateMove(boardGrid);

        bestCandidates = getAllIndexes(candidates, Math.max(...candidates));
        let randomlyChosenElement = shuffleController.GetRandomElementFromArray(bestCandidates);
        gameBoard.ClickOnSpace(randomlyChosenElement, true);
    }

    // return a list of candidates
    const CalculateMove = (boardGrid) => {
        // go through each space and give it a "weight" based on a heuristic
        // want to rank options by some simple logic, in decreasing score:
        // if that space will win the game, give it full marks (and terminate there tbh)
        // if that space will block the other player from winning, we need to pick that, so store this but don't terminate early because there still might be a winner
        // for whatever's left, score it based on how many remaining winning combinations it's included in, and add it to a list
        // if that space is occupied, ignore it
        // once we've gone through this process:
        // do we have a "blocker"? If so, return that
        // else, return the candidate with the highest score

        const HEURISTIC_WINNER = 2;
        const HEURISTIC_BLOCKER = 1;
        const HEURISTIC_VALID = 0;
        const HEURISTIC_INVALID = -9;

        let AI_intelligence = 0.8; // this determines how smart the AI is, [0-1]

        let candidates = Array(9).fill(HEURISTIC_INVALID); // start by marking each space with HEURISTIC_INVALID

        // STEP 1 + 2: check for immediate winning moves, and blockers
        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            let combo = WINNING_COMBINATIONS[i];
            let ownerCount = Array(3).fill(0); // array of length 3, representing empty, player1, player2 panels owned
            let spacesExamined = [boardGrid[combo[0][0]][combo[0][1]], boardGrid[combo[1][0]][combo[1][1]], boardGrid[combo[2][0]][combo[2][1]]];
            ownerCount[spacesExamined[0]]++;
            ownerCount[spacesExamined[1]]++;
            ownerCount[spacesExamined[2]]++;

            // IMMEDIATE WINNING MOVES
            // basically check for all the winning combos, where we own 2/3 spaces and the remaining space is empty
            if (ownerCount[spaceEmpty] == 1 && ownerCount[currentPlayerID] == 2) {
                // we have a winner, now return the empty space
                for (let j = 0; j < spacesExamined.length; j++) {
                    if (spacesExamined[j] == spaceEmpty) {
                        let spaceToPick2D = combo[j];
                        let spaceToPick1D = (spaceToPick2D[0] * 3) + spaceToPick2D[1];
                        candidates[spaceToPick1D] = HEURISTIC_WINNER;

                        // return immediately, because we always want to pick this space, and don't need to check anything else
                        return candidates;
                    }
                }
            } else if (ownerCount[CurrentPlayerOpponent().id + 1] == 2 && ownerCount[spaceEmpty] == 1) {
                // BLOCKERS
                // we need to pick the empty space here to prevent our opponent from winning

                for (let j = 0; j < spacesExamined.length; j++) {
                    if (spacesExamined[j] == spaceEmpty) {
                        let spaceToPick2D = combo[j];
                        let spaceToPick1D = (spaceToPick2D[0] * 3) + spaceToPick2D[1];
                        candidates[spaceToPick1D] = HEURISTIC_BLOCKER;

                        // don't return immediately because we're not finished yet, there might be a winner elsewhere
                    }
                }
            }
        }

        // examine each space and for now, return any space that's valid
        // IDEALLY we'd actually prioritize each space based on how many winning combos it's still valid in
        // buuuuut this AI is pretty dumb, so it's okay to just mark them as equal
        for (let i = 0; i < candidates.length; i++) {
            // skip any of the ones we've already identified as blockers
            if (candidates[i] >= HEURISTIC_BLOCKER)
                continue;
            
            // convert index to 2D array coordinates
            let y = Math.floor(i / 3);
            let x = i % 3
            let currentSpace = boardGrid[y][x];
            if (currentSpace != spaceEmpty) {
                continue; // skip this one
            }
            candidates[i] = HEURISTIC_VALID; // mark this space as valid
            // we're not going to check anything else for now lol
        }
        //console.log(candidates);
        return candidates;
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