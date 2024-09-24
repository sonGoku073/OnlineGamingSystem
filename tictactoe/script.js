const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const restartButton = document.getElementById('restartButton');
const messageElement = document.getElementById('message');
const modeToggle = document.getElementById('modeToggle');
const X_CLASS = 'x';
const O_CLASS = 'o';
let oTurn;
let againstAI = false;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

startGame();

restartButton.addEventListener('click', startGame);
modeToggle.addEventListener('change', () => {
    againstAI = modeToggle.checked;
    startGame();
});

function startGame() {
    oTurn = false;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('win');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    messageElement.textContent = "X's Turn";
    board.style.backgroundColor = "";
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        if (againstAI && oTurn) {
            setTimeout(() => {
                makeBestMove();
            }, 500);
        }
    }
}

function endGame(draw) {
    if (draw) {
        messageElement.textContent = "It's a Draw!";
    } else {
        messageElement.textContent = `${oTurn ? "O's" : "X's"} Wins!`;
        highlightWinningCombination();
    }
    cellElements.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    oTurn = !oTurn;
    messageElement.textContent = `${oTurn ? "O's" : "X's"} Turn`;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    if (oTurn) {
        board.classList.add(O_CLASS);
    } else {
        board.classList.add(X_CLASS);
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

function highlightWinningCombination() {
    WINNING_COMBINATIONS.forEach(combination => {
        if (combination.every(index => cellElements[index].classList.contains(oTurn ? O_CLASS : X_CLASS))) {
            combination.forEach(index => cellElements[index].classList.add('win'));
        }
    });
}

function makeBestMove() {
    const boardState = [...cellElements].map(cell => 
        cell.classList.contains(X_CLASS) ? X_CLASS : (cell.classList.contains(O_CLASS) ? O_CLASS : null)
    );
    const bestMove = minimax(boardState, O_CLASS).index;
    const cell = cellElements[bestMove];
    placeMark(cell, O_CLASS);
    if (checkWin(O_CLASS)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
    }
}

function minimax(board, player) {
    const availSpots = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

    if (checkWinWithBoard(board, X_CLASS)) {
        return { score: -10 };
    } else if (checkWinWithBoard(board, O_CLASS)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        board[availSpots[i]] = player;

        if (player === O_CLASS) {
            const result = minimax(board, X_CLASS);
            move.score = result.score;
        } else {
            const result = minimax(board, O_CLASS);
            move.score = result.score;
        }

        board[availSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === O_CLASS) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = moves[i];
            }
        }
    }

    return bestMove;
}

function checkWinWithBoard(board, player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => board[index] === player);
    });
}
