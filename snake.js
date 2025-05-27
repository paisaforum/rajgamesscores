let score = 0;
let totalScore = 0;
let isGameRunning = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas?.getContext('2d');
const box = 20;
const rows = canvas ? canvas.height / box : 20;
const cols = canvas ? canvas.width / box : 20;

let snake = [];
let food = {};
let direction = 'RIGHT';
let interval = null;
let gameSpeed = 150;

// UI Elements
const liveScore = document.getElementById('liveScore');
const countdownText = document.getElementById('countdown');
const startBtn = document.getElementById('startGame');
const controls = document.getElementById('controls');
const popup = document.getElementById('popup');
const playerNameSpan = document.getElementById('playerName');
const scoreSpan = document.getElementById('scoreDisplay');
const milestoneFill = document.getElementById('milestoneFill');
const redeemBtn = document.getElementById('redeem');
const playAgainBtn = document.getElementById('playAgain');

// Error check
if (!canvas || !ctx || !liveScore || !countdownText || !startBtn || !controls || !popup || !playerNameSpan || !scoreSpan || !milestoneFill || !redeemBtn || !playAgainBtn) {
  console.error('❌ Missing DOM elements.');
}

// Load totalScore
function loadTotalScore() {
  const savedScore = localStorage.getItem('totalScore');
  totalScore = savedScore ? parseInt(savedScore, 10) : 0;
  liveScore.textContent = `Score: ${totalScore}`;
}

// Save totalScore
function saveTotalScore() {
  localStorage.setItem('totalScore', totalScore.toString());
}

// Spawn food
function spawnFood() {
  food = {
    x: Math.floor(Math.random() * cols) * box,
    y: Math.floor(Math.random() * rows) * box
  };
}

// Draw snake and food
function drawSnake() {
  ctx.fillStyle = '#00ff00';
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, box, box);
  });
}

function drawFood() {
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(food.x, food.y, box, box);
}

// Game loop
function draw() {
  if (!isGameRunning || snake.length === 0 || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();

  const head = { ...snake[0] };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  const hitWall = head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height;
  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) return endGame();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1000;
    totalScore += 1000;
    liveScore.textContent = `Score: ${totalScore}`;
    saveTotalScore();

    if (score % 500 === 0) {
      gameSpeed = Math.max(50, gameSpeed - 10);
      clearInterval(interval);
      interval = setInterval(draw, gameSpeed);
    }

    spawnFood();
  } else {
    snake.pop();
  }
}

// Game over
function endGame() {
  clearInterval(interval);
  isGameRunning = false;
  controls.classList.add('hidden');
  popup.classList.remove('hidden');

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const name = telegramUser?.username || 'anonymous';
  playerNameSpan.textContent = name;
  scoreSpan.textContent = totalScore;

  const percent = Math.min(totalScore / 10000, 1) * 100;
  milestoneFill.style.width = `${percent}%`;

  redeemBtn.disabled = totalScore < 5000;
  redeemBtn.onclick = () => {
    if (window.handleRedeem) {
      window.handleRedeem(name, totalScore); // Server will hash it
    } else {
      console.warn('⚠️ Redeem handler not available');
    }
  };
}

// Start new game
function resetGame() {
  score = 0;
  gameSpeed = 150;
  snake = [{ x: 5 * box, y: 5 * box }];
  direction = 'RIGHT';
  spawnFood();
  popup.classList.add('hidden');
  liveScore.textContent = `Score: ${totalScore}`;
  isGameRunning = true;
  interval = setInterval(draw, gameSpeed);
}

// Countdown before start
function startCountdown() {
  let count = 3;
  countdownText.classList.remove('hidden');
  countdownText.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownText.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdownText.textContent = "GO!";
      setTimeout(() => {
        countdownText.classList.add('hidden');
        controls.classList.remove('hidden');
        resetGame();
      }, 800);
    }
  }, 1000);
}

// Start button
startBtn.onclick = () => {
  startBtn.classList.add('hidden');
  startCountdown();
};

// Play Again
playAgainBtn.onclick = () => {
  popup.classList.add('hidden');
  startCountdown();
};

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

// D-pad
document.querySelectorAll('.ctrl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = btn.getAttribute('data-dir');
    if (dir === 'LEFT' && direction !== 'RIGHT') direction = 'LEFT';
    if (dir === 'RIGHT' && direction !== 'LEFT') direction = 'RIGHT';
    if (dir === 'UP' && direction !== 'DOWN') direction = 'UP';
    if (dir === 'DOWN' && direction !== 'UP') direction = 'DOWN';
  });
});

// Load score and init
loadTotalScore();
popup.classList.add('hidden');

// Score reset handler for redeem.js
window.resetTotalScore = () => {
  totalScore = 0;
  localStorage.setItem('totalScore', '0');
  liveScore.textContent = 'Score: 0';
  milestoneFill.style.width = '0%';
};

// Popup X close
const popupCloseBtn = document.getElementById('popupClose');
if (popupCloseBtn) {
  popupCloseBtn.onclick = () => {
    popup.classList.add('hidden');
    controls.classList.add('hidden');
    countdownText.classList.add('hidden');
    startBtn.classList.remove('hidden');
  };
}
