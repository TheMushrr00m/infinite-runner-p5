

/**
 * Man game engine object that holds the current state and anything else
 * that needs to be tracked.
 */
var game = {
  state: GameState.GAME_START,
  runner: null,
  gravity: 2.5,
  loop: true
};

var assets = {}

//it's advisable (but not necessary) to load the images in the preload function
//of your sketch otherwise they may appear with a little delay
function preload() {
  //create an animation from a sequence of numbered images
  assets['sky'] = loadImage("assets/sky_small_gradient.jpeg");
  assets['ground'] = loadImage("assets/ground.png");
}


/**
 * P5 Setup
 */
function setup() {
  createCanvas(800, 400);

  // the player character
  game.runner = new Runner(game)


  //game.runner.friction = 1;

  game.floor_manager = new FloorManager(game)
  for (let i = 0; i < 10; i++) {
      game.floor_manager.nextFloor()
  }

  //camera.velocity = createVector()
  console.log(camera)
}

/**
 * P5 Update loop
 */
function draw() {
  background(0);

  handleKeys();

  if (!game.loop) {
    return
  }

  game.floor_manager.updateFloors(camera)
  game.runner.update();

  // keep the camera and view point together with the player
  camera.position.x = game.runner.position.x + (width * .5) - 50

  image(assets['sky'], game.runner.position.x - 60, 0, width+10, height)

  drawSprites();




}

function handleKeys() {
  if (keyIsDown(RIGHT_ARROW)) {
    game.runner.run()
  }

  if (keyWentDown(' ')) {
    game.runner.jump()
  }

  if (keyWentDown('t')) {
    game.runner.auto_run = game.runner.auto_jump = (!game.runner.auto_run)
  }
}
