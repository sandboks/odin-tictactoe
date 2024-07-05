

// keywords to represent who owns a space
const spaceEmpty = 0;
const spacePlayerOne = 1;
const spacePlayerTwo = 2;

/*
var arr = Array.from(Array(3), () => new Array(3)); // creates a 3 x 3 array
arr[0][0] = 'foo';
console.info(arr);
*/

// create a 2d array where each cell contains a 0
// let array = Array(rows).fill().map(() => Array(columns).fill(0));
let gameBoard = Array(3).fill().map(() => Array(3).fill(0));


