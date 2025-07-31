// script.js

// Game state variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';  // Human starts as 'X'
let gameOver = false;
let score = { X: 0, O: 0, draw: 0 };

// DOM elements
const cells = Array.from(document.querySelectorAll('.cell'));
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');
const restartBtn = document.getElementById('restart');
const themeBtn = document.getElementById('theme-toggle');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

// Winning combinations (indices)
const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // columns
  [0,4,8],[2,4,6]           // diagonals
];

// Initialize event listeners
function init() {
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleClick(parseInt(cell.dataset.index)));
  });
  restartBtn.addEventListener('click', resetGame);
  themeBtn.addEventListener('click', toggleTheme);
  updateScoreboard();
}
init();

// Handle a human click on cell i
function handleClick(i) {
  if (gameOver || board[i] !== '') return;
  // Human move (X)
  makeMove(i, 'X');
  // Check for win or draw after human move
  if (checkEnd('X')) return;
  // AI move (O)
  const best = minimax(board.slice(), 'O');
  makeMove(best.index, 'O');
  checkEnd('O');
}

// Place move on board and UI
function makeMove(i, player) {
  board[i] = player;
  cells[i].textContent = player;
}

// Check if the last move by 'player' ended the game
function checkEnd(player) {
  const winnerCombo = getWinningCombo();
  if (winnerCombo) {
    // Highlight winning cells
    winnerCombo.forEach(idx => cells[idx].classList.add('win'));
    gameOver = true;
    // Update score and play sound
    if (player === 'X') {
      score.X++;
      winSound.play();
    } else {
      score.O++;
      winSound.play();
    }
    updateScoreboard();
    return true;
  }
  // Check draw
  if (board.every(cell => cell !== '')) {
    gameOver = true;
    score.draw++;
    drawSound.play();
    updateScoreboard();
    return true;
  }
  return false;
}

// Get winning combination of indices if someone has won
function getWinningCombo() {
  for (let combo of winCombos) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
}

// Minimax algorithm: returns { index, score }
function minimax(newBoard, player) {
  // Check for terminal states
  const combo = getWinningComboStatic(newBoard);
  if (combo) {
    // If someone has won, assign scores: +10 for O win, -10 for X win (AI maximizes)
    const winner = newBoard[combo[0]];
    return { score: (winner === 'O') ? +10 : -10 };
  }
  // Check draw
  if (newBoard.every(cell => cell !== '')) {
    return { score: 0 };
  }
  // Collect all possible moves
  let moves = [];
  for (let i = 0; i < 9; i++) {
    if (newBoard[i] === '') {
      let move = {};
      move.index = i;
      newBoard[i] = player;
      // Recurse for next player
      let result = minimax(newBoard, (player === 'O') ? 'X' : 'O');
      move.score = result.score;
      newBoard[i] = '';
      moves.push(move);
    }
  }
  // Choose the best move for AI (player 'O') or minimize for human ('X')
  let bestMove;
  if (player === 'O') {
    // AI (O) is maximizing
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    // Human (X) is minimizing
    let bestScore = +Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }
  return bestMove;
}
// Static helper for minimax to get winner on a board snapshot
function getWinningComboStatic(bd) {
  for (let combo of winCombos) {
    const [a,b,c] = combo;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
      return combo;
    }
  }
  return null;
}

// Update the scoreboard UI
function updateScoreboard() {
  scoreX.textContent = score.X;
  scoreO.textContent = score.O;
  scoreDraw.textContent = score.draw;
}

// Restart the game (clear board, keep score)
function resetGame() {
  board.fill('');
  gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
  });
  currentPlayer = 'X';
}

// Toggle light/dark theme
function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}
