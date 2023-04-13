"use strict";

import { fromEvent, map, filter, interval, take, BehaviorSubject } from "rxjs";

const startBtn = document.getElementById("startBtn");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colors = {
  fieldColor: "#f4f4f4",
  snakeColor: "#050",
  foodColor: "#f00",
};

ctx.fillStyle = colors.fieldColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

let dirX = 1;
let dirY = 0;

const snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
];

let food = {
  x: Math.random() * (canvas.width - 50),
  y: Math.random() * (canvas.height - 50),
};

const gameState$ = new BehaviorSubject({
  snake,
  food,
  dirX,
  dirY,
});

function drawSnake() {
  snake.forEach((s) => {
    ctx.fillStyle = colors.snakeColor;
    ctx.fillRect(s.x * 10, s.y * 10, 10, 10);
  });
}

function drawFood(x, y) {
  ctx.fillStyle = colors.foodColor;
  ctx.fillRect(x, y, 5, 5);
}

const keyPress$ = fromEvent(document, "keydown").pipe(
  map((e) => e.code),
  filter((code) => code.startsWith("Arrow")),
  take(1)
);

function moveSnakeOnInput() {
  keyPress$.subscribe((val) => {
    if (val === "ArrowUp" && dirY !== 1) {
      dirX = 0;
      dirY = -1;
    } else if (val === "ArrowDown" && dirY !== -1) {
      dirX = 0;
      dirY = 1;
    } else if (val === "ArrowLeft" && dirX !== 1) {
      dirX = -1;
      dirY = 0;
    } else if (val === "ArrowRight" && dirX !== -1) {
      dirX = 1;
      dirY = 0;
    } else {
      return;
    }

    gameState$.next({
      ...gameState$.value,
      dirX,
      dirY,
    });
  });
}

function moveSnake() {
  updateSnakePosition();
  moveSnakeOnInput();
}

function updateSnakePosition() {
  const { snake, dirX, dirY } = gameState$.value;

  const head = { x: snake[0].x + dirX, y: snake[0].y + dirY };
  snake.unshift(head);
  snake.pop();

  gameState$.next({
    ...gameState$.value,
    snake,
  });
}

function collisionWithCanvas() {
  if (
    snake[0].x < 0 ||
    snake[0].x >= canvas.width / 10 ||
    snake[0].y < 0 ||
    snake[0].y >= canvas.height / 10
  ) {
    return true;
  }
}

function collisionWithBody() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
}

function checkForCollision(game$) {
  if (collisionWithCanvas() || collisionWithBody()) {
    game$.unsubscribe();
    startBtn.disabled = false;
    setTimeout(() => {
      alert("Game over!");
    }, 0);
  }
}

function increaseSnakeLength() {
  if (
    (snake[0].x === Math.ceil(food.x / 10) &&
      snake[0].y === Math.ceil(food.y / 10)) ||
    (snake[0].x === Math.floor(food.x / 10) &&
      snake[0].y === Math.floor(food.y / 10))
  ) {
    snake.push({
      x: snake[snake.length - 1].x + 1,
      y: snake[snake.length - 1].y + 1,
    });

    food = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    };
    drawFood(food.x, food.y);
  }
}

const startGame$ = fromEvent(startBtn, "click").subscribe(() => init());

function init() {
  resetGame();
  const game$ = interval(100).subscribe(() => {
    drawField();
    moveSnake();
    checkForCollision(game$);
    increaseSnakeLength();
  });

  startBtn.disabled = true;
}

function resetGame() {
  dirX = 1;
  dirY = 0;
  gameState$.next({
    ...gameState$.value,
    dirX,
    dirY,
  });
  snake.length = 0;
  snake.push({ x: 10, y: 10 }, { x: 9, y: 10 });
  food = {
    x: Math.random() * (canvas.width - 50),
    y: Math.random() * (canvas.height - 50),
  };
}

function drawField() {
  ctx.fillStyle = colors.fieldColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood(food.x, food.y);
}
