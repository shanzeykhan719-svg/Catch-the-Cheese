const jerry = document.getElementById("jerry");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const speedDisplay = document.getElementById("speed-display");
const gameOverText = document.getElementById("game-over");
const restartBtn = document.getElementById("restart");

let jerryX;
let score;
let gameOver;
let speed;
let isDropping = false; // true while an item is falling — NO new item spawns until false

/* 🎮 Keyboard Controls */
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.key === "ArrowLeft" && jerryX > 0) jerryX -= 25;
  if (e.key === "ArrowRight" && jerryX < 340) jerryX += 25;
  jerry.style.left = jerryX + "px";
});

/* 📱 Touch Controls */
game.addEventListener("touchmove", (e) => {
  if (gameOver) return;
  const touchX = e.touches[0].clientX - game.offsetLeft;
  jerryX = touchX - 30;
  if (jerryX < 0) jerryX = 0;
  if (jerryX > 340) jerryX = 340;
  jerry.style.left = jerryX + "px";
});

/* 📊 Speed label */
function getSpeedLabel(spd) {
  if (spd <= 2.5) return "Normal";
  if (spd <= 3.5) return "Fast";
  if (spd <= 5) return "Very Fast";
  return "Ultra Fast 🔥";
}

/* 💥 Collision Detection */
function isColliding(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.top > bRect.bottom ||
    aRect.bottom < bRect.top ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

/* ✅ Called when item is resolved — waits, then spawns next */
function onItemResolved() {
  isDropping = false;
  if (gameOver) return;
  const delay = Math.max(300, 800 - score * 15);
  setTimeout(spawnItem, delay);
}

/* 🧀 Spawn exactly ONE item and drop it */
function spawnItem() {
  if (gameOver || isDropping) return; // double-guard

  isDropping = true; // lock — no more items until this resolves

  const item = document.createElement("div");

  if (Math.random() < 0.75) {
    item.classList.add("cheese");
    item.textContent = "🧀";
  } else {
    item.classList.add("bomb");
    item.textContent = "💣";
  }

  item.style.position = "absolute";
  item.style.width = "40px";
  item.style.height = "40px";
  item.style.fontSize = "32px";
  item.style.lineHeight = "40px";
  item.style.textAlign = "center";
  item.style.left = Math.floor(Math.random() * 360) + "px";
  item.style.top = "0px";

  game.appendChild(item);

  function fall() {
    if (gameOver) {
      item.remove();
      return;
    }

    let top = parseInt(item.style.top);
    top += speed;
    item.style.top = top + "px";

    /* Hit the bottom */
    if (top > 460) {
      item.remove();
      if (item.classList.contains("cheese")) {
        endGame("Game Over ❌ — Missed the Cheese!");
      } else {
        onItemResolved(); // bomb missed = fine, next item
      }
      return;
    }

    /* Collision with Jerry */
    if (isColliding(jerry, item)) {
      item.remove();
      if (item.classList.contains("cheese")) {
        score++;
        scoreDisplay.textContent = "Score: " + score;
        speed = 2 + score * 0.3;
        if (speed > 8) speed = 8;
        speedDisplay.textContent = "Speed: " + getSpeedLabel(speed);
        onItemResolved();
      } else {
        endGame("Game Over 💣 — Caught a Bomb!");
      }
      return;
    }

    requestAnimationFrame(fall);
  }

  requestAnimationFrame(fall);
}

/* 🛑 End Game */
function endGame(message) {
  gameOver = true;
  isDropping = false;
  gameOverText.textContent = message;
  restartBtn.style.display = "inline-block";
  // Remove any leftover items
  game.querySelectorAll(".cheese, .bomb").forEach(item => item.remove());
}

/* 🚀 Start Game */
function startGame() {
  jerryX = 180;
  score = 0;
  speed = 2;
  gameOver = false;
  isDropping = false;

  scoreDisplay.textContent = "Score: 0";
  speedDisplay.textContent = "Speed: Normal";
  gameOverText.textContent = "";
  restartBtn.style.display = "none";
  jerry.style.left = jerryX + "px";

  game.querySelectorAll(".cheese, .bomb").forEach(item => item.remove());

  spawnItem();
}

restartBtn.addEventListener("click", startGame);
startGame();