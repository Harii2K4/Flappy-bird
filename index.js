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
      "Press Space To Start The Game",
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
  setInterval(generatePipePairs, 1500);
};
function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
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

  for (let pipe of pipesArray) {
    if (pipe.isTop) {
      ctx.drawImage(pipeTopImg, pipe.x, pipe.y, pipe.width, pipe.height);
    } else {
      ctx.drawImage(pipeBottomImg, pipe.x, pipe.y, pipe.width, pipe.height);
    }
  }
}
function reset() {
  Bird.x = 50;
  Bird.y = Math.floor(GAME_HEIGHT / 2);
  Bird.imgIdx = 0;
  console.log(deltaTimeAcc / 1000);
  Bird.frameCount = 0;
  deltaTimeAcc = 0;
  ctx.fillStyle = "red";
  ctx.fillText(
    `Press Space To Reset The Game\n Score:${Game.score}`,
    Math.floor(GAME_WIDTH / 2),
    Math.floor(GAME_HEIGHT / 2),
  );
  Game.score = 0;
  ctx.fillStyle = "black";
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
  if (Bird.y + Bird.height >= GAME_HEIGHT) {
    Game.isRunning = false;
    Bird.frameCount++;
    reset();
    window.cancelAnimationFrame(Game.mainStopId);
    return;
  } else {
    Bird.update(deltaTime);
    updatePipes(deltaTime);
  }

  //render
  render();
};

document.body.addEventListener("keydown", (e) => {
  if (e.key === " ")
    if (!Game.isRunning) {
      Game.isRunning = true;
      main();
    } else {
      isSpacePressed = 1;
    }
});

document.body.addEventListener("keyup", (e) => {
  if (e.key === " ") isSpacePressed = 0;
});
