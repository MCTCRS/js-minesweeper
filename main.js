

document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });


let GridList;
let GridX;
let GridY;
let Mines;
let Scale;
let GameOver = false;
let FlagCount = 0;
let Timer = 0;
let TimerId;
let cellsOpened;
let allCells;
const digit_asset = new Image();
digit_asset.src = "sprites/digits.png";

digit_asset.onload = function() {
    renderDigitCanvas(0, "timer_canvas");
    renderDigitCanvas(40, "mine_canvas");
};

function buttonClicked() {
    console.log("Button was clicked!");

    GridX = parseInt(document.getElementById("input_width").value);
    GridY = parseInt(document.getElementById("input_height").value);

    Mines = parseInt(document.getElementById("input_mines").value);

    allCells = GridX * GridY;

    Scale = 40;

    createGrid(GridX, GridY);

    createGridList(GridX, GridY);

    placeMines(Mines);

    FlagCount = 0;    
    FlagLeft = Mines;

    updateFlagCountDisplay();
    
    renderDigitCanvas(0, "timer_canvas");
    Timer = 0;
    clearInterval(TimerId);
    TimerId = setInterval(timerLoop, 1000);

    cellsOpened = 0;
    
    setFace("sprites/face/normal_unpress.png");

    //console.log(document.getElementById("input_width").value);

    //console.log(typeof gridSizeX);
}



/*
let GridX = 10;
let GridY = 10;
let Mines = 4;
createGridList(GridX, GridY); 
placeMines(Mines);
*/






function createGrid(x, y) {
    
    //type check
    if (typeof x !== 'number' || typeof y !== 'number') {
        console.error("Grid dimensions must be numbers.");
        return;
    }

    //num check
    if (x <= 0 || y <= 0) {
        console.error("Grid dimensions must be greater than zero.");
        return;
    }

    //integer check
    if ((x + y) % 1 !=0) {
        console.error("Grid dimensions must be integers.");
        return;
    }

    let broad = document.getElementById("broad");

    broad.innerHTML = ""; // Clear previous grid if exists

    broad.style.gridTemplateColumns = `repeat(${x}, ${Scale}px)`;

    for (let for_y = 0; for_y < y; for_y++) {
        for (let for_x = 0; for_x < x; for_x++) {
            //console
            //console.log(`Creating cell at (${for_x}, ${for_y})`);
            //add elements
            const img = document.createElement("img");

            img.id = `cell_${for_x}_${for_y}`;
            img.src = "sprites/unopened.png";
            img.alt = "Test_SPR";
            img.width = Scale;
            img.style = "image-rendering: pixelated;";
            img.addEventListener('mousedown', function(event) {
                cell_mousedown(event, for_x, for_y);
            });

            broad.appendChild(img);
        }
    }
}
 // Global variable to hold the grid list

function createGridList(x, y) {

    GridList = Array.from({ length: y }, () => Array.from({ length: x }, () => [0, false, false]));

    //console.log("Grid List created:", GridList);

}

function cell_mousedown(event, x, y) {
    if (event.button === 0) {
        // Left click - open cell

        //is cell of opem
        if (GridList[y][x][1]) {
            // If the cell is already opened, do nothing
            openNeighboringCells(x, y);
            return;
        }

        //is cell flagged
        if (GridList[y][x][2]) {
            console.warn("Cell is flagged, cannot open at", x, y);
            return;
        };

        displayCell(x, y);

        if (GridList[y][x][0] === -1) {
            console.error("Mine opened at", x, y);
            
        }

        
        
    } else if (event.button === 2) {
        // Right click - toggle flag

        //check if not open
        if (!GridList[y][x][1]) {
            // If the cell is already opened, do nothing
            toggleCellFlag(x, y);
            return;
        }
    }
}



function GameOverEvent() {

    //stop timer
    clearInterval(TimerId);
    

    //set to game over
    GameOver = true;

    //remove all event listeners
    killEventListeners();

    //
    const bound_x = GridList[0].length;
    const bound_y = GridList.length;

    for (let for_x = 0; for_x < bound_x; for_x++) {
        for (let for_y = 0; for_y < bound_y; for_y++) {
            
            // mine count, isopen, isflagged

            //get cell state
            const cell_state = GridList[for_y][for_x];

            //if false flagged index 2
            if (!cell_state[2] && cell_state[0] === -1 && !cell_state[1]) {
                document.getElementById(`cell_${for_x}_${for_y}`).src = "sprites/mine_unopened.png";
                continue;
            }
            
            if (cell_state[2] && cell_state[0] !== -1) {
                document.getElementById(`cell_${for_x}_${for_y}`).src = "sprites/mine_falseflag.png";
                continue;
            }

        }
    }

    setFace("sprites/face/lost_unpress.png");

    shakeScreen();

    
}

function killEventListeners() {
    //remove all event listeners
    let broad = document.getElementById("broad");
    let board_new = broad.cloneNode(true);
    broad.parentNode.replaceChild(board_new, broad);
}

function openNeighboringCells(x, y) {

    const bound_x = GridList[0].length;
    const bound_y = GridList.length;

    let neighboringFlags = 0;
    for (let for_x = -1; for_x <= 1; for_x++) {
        for (let for_y = -1; for_y <= 1; for_y++) {
           if (for_x === 0 && for_y === 0) continue; // Skip the current cell

            const new_x = x + for_x;
            const new_y = y + for_y;

            // Check bounds
            if (new_x >= 0 && new_x < bound_x && new_y >= 0 && new_y < bound_y) {
                // Count flagged cells
                if (GridList[new_y][new_x][2]) {
                    neighboringFlags++;
                }
            }
        }
    }

    if (neighboringFlags !== GridList[y][x][0]) return;

    for (let for_x = -1; for_x <= 1; for_x++) {
        for (let for_y = -1; for_y <= 1; for_y++) {
           if (for_x === 0 && for_y === 0) continue; // Skip the current cell

            const new_x = x + for_x;
            const new_y = y + for_y;

            // Check bounds
            if (new_x >= 0 && new_x < bound_x && new_y >= 0 && new_y < bound_y) {
                // Count flagged cells
                if (!GridList[new_y][new_x][1] && !GridList[new_y][new_x][2]) {
                    displayCell(new_x, new_y);
                }
            }
        }
    }


}


function placeMines(Mines) {
    
    //get x size
    let size_x = GridList[0].length;

    //get y size
    let size_y = GridList.length;

    //mines check
    if ((size_x * size_y) < Mines) {
        console.error("Not enough space for the number of mines.");
        return;
    }

    //get all possible position
    let possible_positions = [];

    for (let for_x = 0; for_x < size_x; for_x++) {
        for (let for_y = 0; for_y < size_y; for_y++) {
            possible_positions.push([for_x, for_y]);
        }
    }

    //random a mine pos
    for (let for_mines = 0; for_mines < Mines; for_mines++) {
        const pos = possible_positions.splice(getRndInteger(0, possible_positions.length - 1),1)[0];
        placeMineInGridList(pos[0], pos[1]);
    }


}


function placeMineInGridList(x, y) {

    //set to mine
    GridList[y][x][0] = -1;
     // mark as mine

    let size_x = GridList[0].length;
    let size_y = GridList.length;

    //update surrounding cells
    for (let for_x = -1; for_x <= 1; for_x++) {
        for (let for_y = -1; for_y <= 1; for_y++) {

            //get pos
            let update_x = x + for_x;
            let update_y = y + for_y;

            //check if in bounds
            if (update_x >= 0 && update_x < size_x && update_y >= 0 && update_y < size_y) {
                //not a mine check

                if (GridList[update_y][update_x][0] >= 0) {
                    GridList[update_y][update_x][0] += 1;
                }
            }

        }
    }


}

function displayCell(x, y) {

    cellsOpened++;

    if (cellsOpened + Mines === allCells) {
        killEventListeners();
        clearInterval(TimerId);
        GameOver = true;
        setFace("sprites/face/won_unpress.png");
    }

    //console.log(FlagCount);

    let cell = document.getElementById(`cell_${x}_${y}`);
    let number = GridList[y][x][0];

    //if is a mine
    

    GridList[y][x][1] = true;

    cell.src = `sprites/open_cells/${number}.png`;

    if (number === -1) {
        console.warn("bomb opened");
        GameOverEvent();
        return;
    }

    if (number === 0) {
        const bound_x = GridList[0].length;
        const bound_y = GridList.length;
        // If the cell is empty, recursively open surrounding cells
        for (let for_x = -1; for_x <= 1; for_x++) {
            for (let for_y = -1; for_y <= 1; for_y++) {
                // Skip the current cell
                if (for_x === 0 && for_y === 0) continue;

                const new_x = x + for_x;
                const new_y = y + for_y;

                // Check bounds
                if (new_x >= 0 && new_x < bound_x && new_y >= 0 && new_y < bound_y) {
                    // Only open if not already opened
                    if (!GridList[new_y][new_x][1] && !GridList[new_y][new_x][2]) {
                        displayCell(new_x, new_y);
                    }
                }
            }
        }
    }

}

function toggleCellFlag(x, y) {
    
    const isFlagged = GridList[y][x][2];

    if (!isFlagged) {
        //if not flagged, flag it
        GridList[y][x][2] = true; // mark as flagged
        document.getElementById(`cell_${x}_${y}`).src = "sprites/flagged.png";
        //add to counter
        FlagCount++;
        updateFlagCountDisplay();
    } else {
        //if flagged, unflag it
        GridList[y][x][2] = false;
        document.getElementById(`cell_${x}_${y}`).src = "sprites/unopened.png";
        //remove from counter
        FlagCount--;
        updateFlagCountDisplay();
    }



}


function renderDigitCanvas(arg, arg2) {

    let in_num = arg;
    //create num array
    const num_array = [];

    let is_negative = false;

    if (in_num < 0) {
        in_num *= -1;
        
        is_negative = true;
    }

    //make array_list
    while (true) {
        
        //get last digit
        num_array.push(in_num % 10);

        //remove last digit
        in_num = Math.floor(in_num / 10);

        //if no more digits, break
        if (in_num === 0) break;

    }

    //push '-' sprite
    if (is_negative) {
        num_array.push(10);
    }

    for (i = Math.max(3 - num_array.length, 0); i > 0; i--) {
        num_array.push(11);
    }

    num_array.reverse();

    //console.log(num_array)
    

    const canva = document.getElementById(arg2);
    const width = canva.width;
    const height = canva.height;

    const num_width = width/3;

    //get ctx
    const ctx = canva.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    //clear canva
    ctx.clearRect(0, 0, width, height);

    let test_index = 0;
    for (let i = 0; i < 3; i++) {

        test_index = num_array[i];

        ctx.drawImage(digit_asset, test_index * 13, 0, 13, 23, num_width * i, 0, num_width, height);
    }


}

function setFace(face) {
    document.getElementById("face_main").src = face;
}

function timerLoop() {
    Timer++;
    renderDigitCanvas(Timer, "timer_canvas");
    if (Timer === 999) {
        clearInterval(TimerId);
        return;
    }
}

function shakeScreen() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
  }, 300); // match animation duration
}




function updateFlagCountDisplay() {
    renderDigitCanvas(Mines - FlagCount, "mine_canvas");
}


function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}