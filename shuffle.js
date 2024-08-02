const TOTAL_AVATARS = 16;

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
    "Divorced",
    "Ticklish",
    "Filthy",
    "Cromulent",
    "Fraudulent",
    "Whiny",
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

const shuffleController = (() => {
    const maxStored = 10; // how many of the previous results we store and prevent from reappearing
    let prevNouns = [];
    let prevAdjs = [];

    const GetRandomAdj = (playerName = "") => {
        return GetRandomFromList(playerName, NAME_ADJECTIVES, prevAdjs);
    }

    const GetRandomNoun = (playerName = "") => {
        return GetRandomFromList(playerName, NAME_NOUN, prevNouns);
    }

    // a generic function that can be used for either nouns or adjs
    // take in "playerName" to ensure we don't give the same results
    // "constList" represents the unchanging list we reference
    // "prevList" is the list with our previous entries we don't want to repeat
    const GetRandomFromList = (playerName = "", constList, prevList) => {
        // clone the const array
        let filteredList = [...constList];
        // remove all prev words from our clone
        for (let i = 0; i < prevList.length; i++) {
            let word = prevList[i];
            let index = filteredList.indexOf(word);
            if (index > -1)
                filteredList.splice(index, 1); // 2nd parameter means remove only 1 item
        }
        // remove the player's current word, if it isn't already gone
        if (playerName.trim().length > 0); // ensure we're not trying to match the empty string
        for (let i = 0; i < filteredList.length; i++) {
            let word = filteredList[i];
            if (playerName.includes((word))) { // we can check for the space after to try to ensure a perfect match
                filteredList.splice(i, 1);
            }
        }
        // just in case for whatever reason our filteredList is now empty...
        if (filteredList.length == 0)
            return "ERROR";
        // get a random Adj
        let randomlyChosenWord = filteredList[Math.floor(Math.random() * filteredList.length)];
        // update the stored prevAdjs
        prevList.push(randomlyChosenWord); // appends to the end of the array
        if (prevList.length > maxStored)
            prevList.shift(); // gets rid of the first element
        //console.log(prevList);
        // return the randomly chosen word
        return randomlyChosenWord;
    }

    const colorAngleChangeBy = 120;

    // generate a random color
    const getRandomColorRGB = (playerCurrentColor = 'ffffff') => {
        let newColorAngle = Math.round(Math.random() * 360);
        let newColorSaturation = 1 - (Math.random() * Math.random()); // multiply two random numbers so you end up with ~ 75%
        let newColorLuminosity = 0.5 - (0.5 * (Math.random() * Math.random() * Math.random())); // 3 random numbers, so you end up with ~ 88% brightness and pure black is less likely
        let newColor = hsl2rgb(newColorAngle, newColorSaturation, newColorLuminosity);

        // if the new color is too similar to the previous one, adjust the angle and regenerate it
        // while this generally works great for preventing duplicate colors, it's not perfect
        // adjusting the angle doesn't account for extremely low saturation or brightness
        // so if you roll two very dark or grey colors in a row, this won't prevent that
        if (isSimilar(getRGB(playerCurrentColor), getRGB(newColor))) {
            // console.log(`TOO SIMILAR! ${getRGB(playerCurrentColor)} / ${getRGB(newColor)} [${colorDiff(getRGB(playerCurrentColor), getRGB(newColor))}]`);
            let prevColor = newColor;
            let colorDiffPrev = colorDiff(getRGB(playerCurrentColor), getRGB(newColor));
            newColorAngle = (newColorAngle + colorAngleChangeBy + (colorAngleChangeBy * Math.random() / 2)) % 360;
            newColor = hsl2rgb(newColorAngle, newColorSaturation, newColorLuminosity);
            
            // console.log(`NEW COLOR: ${getRGB(newColor)}  [${colorDiff(getRGB(playerCurrentColor), getRGB(newColor))}]`);
            let colorDiffNew = colorDiff(getRGB(playerCurrentColor), getRGB(newColor));

            if (colorDiffPrev > colorDiffNew) {
                // in the extremely unlikely event that the 2nd color is worse than the 1st, we use the 1st one instead
                //console.log("lol nvm, THE OLD ONE WAS BETTER JUST USE THAT");
                newColor = prevColor;
            }
        }
            
        return newColor;
    }

    // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    // input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
    const hsl2rgb = (h,s,l) => {
        let a=s*Math.min(l,1-l);
        let f= (n,k=(n+h/30)%12) => (l - a*Math.max(Math.min(k-3,9-k,1),-1));
        //return [f(0),f(8),f(4)];
        //return `rgb(${Math.round(f(0) * 255)},${Math.round(f(8) * 255)},${Math.round(f(4) * 255)})`;
        return RGBToHex(Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255));
    }  

    // https://css-tricks.com/converting-color-spaces-in-javascript/
    const RGBToHex = (r,g,b) => {
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
    const getRGB = (color) => {
        color = parseInt(color.substring(1), 16);
        red = color >> 16;
        g = (color - (red<<16)) >> 8;
        b = color - (red<<16) - (g<<8);
        return [red, g, b];
    }
    const colorDiff = ([r1, g1, b1], [r2, g2, b2]) => {
        return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2);
    }
    const isSimilar = ([r1, g1, b1], [r2, g2, b2]) => {
        return colorDiff([r1, g1, b1], [r2, g2, b2]) < 180;
    }




    return {
        GetRandomAdj,
        GetRandomNoun,
        getRandomColorRGB,
    }

})();



