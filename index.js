const GAME_WIDTH = 1534;
const GAME_HEIGHT = 830;

let Game = {
  isRunning: false,
  score: 0,
  mainStopId: null,
};
let Bird = {
  height: 50,
  width: 50,
  img: "flappybird0.png",
  x: 50,
  y: Math.floor(GAME_HEIGHT / 2),
};
let ctx;
let bg_img;
let bird_img;

window.onload = function () {
  const canvas = document.querySelector("canvas");
  canvas.height = GAME_HEIGHT;
  canvas.width = GAME_WIDTH;
  ctx = canvas.getContext("2d");

  bg_img = new Image();
  bg_img.src = "flappy_bg.jpg";
  bg_img.onload = function () {
    ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  };

  bird_img = new Image();
  bird_img.src = Bird.img;
  bird_img.onload = function () {
    ctx.fillRect(Bird.x, Bird.y, Bird.width, Bird.height);
    ctx.drawImage(bird_img, Bird.x, Bird.y, Bird.width, Bird.height);
  };
};
function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillRect(Bird.x, Bird.y, Bird.width, Bird.height);
  ctx.drawImage(bird_img, Bird.x, Bird.y, Bird.width, Bird.height);
}
function reset() {
  Bird.x = 50;
  Bird.y = Math.floor(GAME_HEIGHT / 2);
}
window.main = function () {
  Game.mainStopId = window.requestAnimationFrame(main);

  //update
  if (Bird.x + Bird.width >= GAME_WIDTH) {
    Game.isRunning = false;
    reset();
    window.cancelAnimationFrame(Game.mainStopId);
    return;
  } else {
    Bird.x += 2;
  }

  //render
  render();
};

document.body.addEventListener("keypress", (e) => {
  if (e.key === " " && !Game.isRunning) {
    Game.isRunning = true;
    main();
  }
});
