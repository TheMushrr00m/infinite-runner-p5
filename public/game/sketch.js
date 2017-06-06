

/**
 * Man game engine object that holds the current state and anything else
 * that needs to be tracked.
 */
var game = {
  state: GameState.GAME_START,
};


/**
 * P5 Setup
 */
function setup() {
  createCanvas(800, 400);

}

/**
 * P5 Update loop
 */
function draw() {
  background(0);

  handleKeys();

  drawSprites();
}

function handleKeys() {

}
