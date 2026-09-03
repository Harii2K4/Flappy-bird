const GAME_WIDTH = 1534;
const GAME_HEIGHT = 830;
const HORZ_VEL = 2;

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

  update() {
    this.frameCount++;
    if (this.frameCount % 8 === 0) {
      this.imgIdx = (this.imgIdx + 1) % 4;
    }
    this.x += HORZ_VEL;
  },

  getImg() {
    return this.images[this.imgIdx];
  },
};
let ctx;
let bg_img;

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
  let bird_img;
  for (let i = 0; i < 4; i++) {
    bird_img = new Image();
    bird_img.src = `flappybird${i}.png`;
    bird_img.onload = function () {};
    Bird.images[i] = bird_img;
  }
};
function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.drawImage(bg_img, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillRect(Bird.x, Bird.y, Bird.width, Bird.height);
  ctx.drawImage(Bird.getImg(), Bird.x, Bird.y, Bird.width, Bird.height);
}
function reset() {
  Bird.x = 50;
  Bird.y = Math.floor(GAME_HEIGHT / 2);
  Bird.imgIdx = 0;
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
    Bird.update();
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
