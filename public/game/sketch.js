

/**
 * Man game engine object that holds the current state and anything else
 * that needs to be tracked.
 */
var game = {
  state: GameState.GAME_START,
  runner: null,
  gravity: 1.5,
  loop: true
};


class FloorGenerator {
  constructor() {
    this.first_floor = true
  }

  nextFloor() {
    let floor = null
    if (this.first_floor) {
      this.first_floor = false
      floor = createSprite(150, 250, 300, 50)
    } else {
      let w = random(10, 30) * 10
      let h = 50
      let x = this.last_floor.position.x + this.last_floor.width * .5
      let y = this.last_floor.position.y + random(-5, 5) * 5
      floor = createSprite(x + w * .5, y, w, h);
    }

    floor.immovable = true
    floor.debug = true
    floor.friction = 0.9

    return this.last_floor = floor
  }
}

/**
 * P5 Setup
 */
function setup() {
  createCanvas(800, 400);

  // the viewport is used for clipping the floors
  viewport = createSprite(width*.5, height*.5, width*.75, height*.5)
  viewport.shapeColor = color(255, 255, 255, 100)

  // the player character
  game.runner = createSprite(10, 80, 20, 50);
  game.runner.shapeColor = color(255, 5, 255, 255);
  game.runner.maxSpeed = 15;
  game.runner.debug = true
  game.runner.JUMP_FORCE = 15
  game.runner.RUN_SPEED = .5

  //game.runner.friction = 1;

  game.floorGenerator = new FloorGenerator()
  game.floors = new Group()
  for (let i = 0; i < 10; i++) {
      game.floors.add(game.floorGenerator.nextFloor())
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

  // Camera is centered at zero, zero on the canvas,
  // so camera.x is width/2
  //
  for (let floor of game.floors) {
    // left edge of the viewport
    let camera_left = camera.position.x - (width * 0.5);
    // right edge of the floor
    let floor_right = floor.position.x + (floor.width * 0.5)

    if (floor_right < camera_left ) {
      floor.remove()
      game.floors.add(game.floorGenerator.nextFloor())
      console.log("Removed", {px: game.runner.position.x, camera_left: camera_left, floor_right: floor_right}, floor)
    }
  }

  game.runner.on_floor = game.runner.collide(game.floors, (runner, floor) => runner.floor = floor)

  if (!game.runner.on_floor) {
    game.runner.addSpeed(game.gravity, 90);
  } else {
    // apply friction
    if (game.runner.velocity.x > 0) {
      game.runner.velocity.mult(game.runner.floor.friction);
    } else {
      game.runner.setVelocity(0, 0);
    }
  }

  // keep the camera and view point together with the player
  camera.position.x = game.runner.position.x + (width * .5) - 50
  viewport.position.x = camera.position.x

  drawSprites();

  // draw debug info last
  strokeWeight(2)
  stroke(255)
  line(game.runner.position.x, game.runner.position.y, game.runner.position.x+game.runner.velocity.x, game.runner.position.y + game.runner.velocity.y)
  if (game.runner.on_floor) {
    strokeWeight(0)
    fill(0, 255, 0)
    rect(game.runner.position.x - 5, game.runner.position.y + game.runner.height * .5, 10, 5 )
  }

}

function handleKeys() {
  if (keyIsDown(RIGHT_ARROW)) {
    // add run speed towards the right
    game.runner.addSpeed(game.runner.RUN_SPEED, 0);
  }

  if (keyWentDown(' ')) {
    game.runner.addSpeed(game.runner.JUMP_FORCE, -90)
  }

  if (keyWentDown('t')) {
    console.log("toggle")
    if (game.loop) {
      game.loop = false
    } else {
      game.loop = true
    }
  }
}
