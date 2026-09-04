//CONSTANTS
const GAME_WIDTH = 1534;
const GAME_HEIGHT = 830;
const HORZ_VEL = 2;
const GRAVITY = 225;
const BIRD_VERT_VEL = 450;
const BIRD_ROTATION = (30 * Math.PI) / 180;
const GAP = 150;
const PIPE_WIDTH = 100;
const TOTAL_PIPE_HEIGHT = GAME_HEIGHT - GAP;

//GAME OBJECTS
let Game = {
  isRunning: false,
  score: 0,
  mainStopId: null,

  reset() {
    this.isRunning = false;
    this.score = 0;
    this.mainStopId = null;
  },
};

let Bird = {
  height: 50,
  width: 50,
  frameCount: 0,
  imgIdx: 0,
  images: [],
  x: 50,
  y: Math.floor(GAME_HEIGHT / 2),
  angle: 0,

  update(timeDelta) {
    this.frameCount++;
    if (this.frameCount % 8 === 0) {
      this.imgIdx = (this.imgIdx + 1) % 4;
    }
    this.y += (GRAVITY - isSpacePressed * BIRD_VERT_VEL) * (timeDelta / 1000);
    this.y = Math.max(0, this.y);

    this.angle +=
      -isSpacePressed * BIRD_ROTATION * 0.25 +
      (1 - isSpacePressed) * BIRD_ROTATION * 0.25;
    this.angle = Math.max(-BIRD_ROTATION, Math.min(BIRD_ROTATION, this.angle));
  },
  reset() {
    this.x = 50;
    this.y = Math.floor(GAME_HEIGHT / 2);
    this.imgIdx = 0;
    this.frameCount = 0;
  },

  getImg() {
    return this.images[this.imgIdx];
  },
};

//GLOBAL VARS
let ctx;
let bg_img;
let pipeTopImg;
let pipeBottomImg;
let isSpacePressed = 0;
let deltaTimeAcc = 0;
let prevResTime = 0;
let intervalId;
let pipesArray = [];

//FUNCTIONS
function Pipe(y, height, isTop) {
  return {
    x: GAME_WIDTH,
    y: y,
    passed: false,
    width: PIPE_WIDTH,
    height: height,
    isTop: isTop,
  };
}
function updatePipes(timeDelta) {
  for (let pipe of pipesArray) {
    if (Bird.x > pipe.x + pipe.width) {
      pipe.passed = true;
      Game.score += 0.5;
      continue;
    }
    pipe.x -= 300 * (timeDelta / 1000);
  }
  pipesArray = pipesArray.filter((pipe) => !pipe.passed);
}
function generatePipePairs() {
  let pipeTopH = Math.max(
    TOTAL_PIPE_HEIGHT * 0.25,
    Math.floor(Math.random() * TOTAL_PIPE_HEIGHT * 0.6),
  );
  pipesArray.push(new Pipe(0, pipeTopH, true));
  let pipBotH = TOTAL_PIPE_HEIGHT - pipeTopH;
  pipesArray.push(new Pipe(pipeTopH + GAP, pipBotH, false));
}

window.onload = function () {
  const canvas = document.querySelector("canvas");
  canvas.height = GAME_HEIGHT;
  canvas.width = GAME_WIDTH;
  ctx = canvas.getContext("2d");

  bg_img = new Image();
  bg_img.src = "./assets/flappy_bg.jpg";

  bg_img.onload = function () {
    ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText(
      "Press Enter To Start The Game",
      Math.floor(GAME_WIDTH / 2),
      Math.floor(GAME_HEIGHT / 2),
    );
    ctx.fillStyle = "black";
  };

  pipeTopImg = new Image();
  pipeTopImg.src = "./assets/toppipe.png";

  pipeBottomImg = new Image();
  pipeBottomImg.src = "./assets/bottompipe.png";

  let bird_img;
  for (let i = 0; i < 4; i++) {
    bird_img = new Image();
    bird_img.src = `./assets/flappybird${i}.png`;
    bird_img.onload = function () {};
    Bird.images[i] = bird_img;
  }
};
function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  for (let pipe of pipesArray) {
    if (pipe.isTop) {
      ctx.drawImage(pipeTopImg, pipe.x, pipe.y, pipe.width, pipe.height);
    } else {
      ctx.drawImage(pipeBottomImg, pipe.x, pipe.y, pipe.width, pipe.height);
    }
  }
  ctx.save();
  ctx.fillStyle = "whitesmoke";
  ctx.font = "30px Arial";
  ctx.textAlign = "start";
  ctx.fillText(`Score : ${Game.score}`, 30, 30);
  ctx.translate(Bird.x + Bird.width / 2, Bird.y + Bird.height / 2);
  ctx.rotate(Bird.angle);
  ctx.drawImage(
    Bird.getImg(),
    -Bird.width / 2,
    -Bird.height / 2,
    Bird.width,
    Bird.height,
  );
  ctx.restore();
  ctx.strokeRect(Bird.x, Bird.y, Bird.width, Bird.height);
}
function checkCollision(pipe) {
  const leftEdge = Bird.x <= pipe.x + pipe.width;
  const rightEdge = Bird.x + Bird.width >= pipe.x;
  const topEdge = Bird.y <= pipe.y + pipe.height;
  const bottomEdge = Bird.y + Bird.height >= pipe.y;

  return leftEdge && rightEdge && topEdge && bottomEdge;
}
function reset() {
  deltaTimeAcc = 0;
  prevResTime = 0;
  pipesArray = [];

  ctx.fillStyle = "red";
  ctx.fillText(
    `Press Enter To Reset The Game\n Score:${Game.score}`,
    Math.floor(GAME_WIDTH / 2),
    Math.floor(GAME_HEIGHT / 2),
  );
  ctx.fillStyle = "black";

  Bird.reset();
  Game.reset();
  clearInterval(intervalId);
  intervalId = undefined;
}
window.main = function (resTime) {
  Game.mainStopId = window.requestAnimationFrame(main);
  //First call from the first space to start game
  if (resTime === undefined) {
    return;
  }
  if (Bird.frameCount === 0) {
    Bird.frameCount++;
    prevResTime = resTime;
    return;
  }
  let deltaTime = resTime - prevResTime;
  prevResTime = resTime;
  deltaTimeAcc += deltaTime;

  //update
  Bird.update(deltaTime);
  updatePipes(deltaTime);
  if (Bird.y + Bird.height >= GAME_HEIGHT) {
    window.cancelAnimationFrame(Game.mainStopId);
    reset();
    return;
  }
  for (let pipe of pipesArray) {
    if (checkCollision(pipe)) {
      Game.isRunning = False;
      return;
    }
  }

  //render
  render();
};

document.body.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    isSpacePressed = Game.isRunning ? 1 : isSpacePressed;
  } else if (e.key === "Enter") {
    if (!Game.isRunning) {
      intervalId = setInterval(generatePipePairs, 1500);
      Game.isRunning = true;
      main();
    }
  }
});

document.body.addEventListener("keyup", (e) => {
  if (e.key === " ") isSpacePressed = 0;
});
