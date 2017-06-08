export default class Level {
  constructor(game) {
    this.game = game
    this.first_floor = true;
    this.BLOCK_SIZE = 32;
    this.chunks = []
  }

  preload(){
    const game = this.game
    const image = function(name, filename) {
      if (filename === undefined) {
        filename = name
      }

      game.load.image(name, 'assets/sunny-land/environment/' + filename + '.png')
    }
    // ground
    image('ground_middle_1x1');
    image('underground_1x1');
  }

  create() {
    this.world_width = this.game.width / this.BLOCK_SIZE
    this.world_height = this.game.height / this.BLOCK_SIZE
    this.blocks = this.game.add.group()
    this.blocks.name = 'blocks'

  }

  interact(player) {
    // Collide the player with the ground
    this.game.physics.arcade.collide(player.sprite, this.blocks, () => player.is_grounded = true);
  }

  nextChunk() {
    let chunk, x, y, w, h;

    if (this.first_floor) {
      this.first_floor = false;
      x = -1;
      y = 3;
      w = 7;
      chunk = this.chunk_levelGround(x, y, w);
    } else {
      w = this.game.rnd.integerInRange(2, 5)
      x = this.last_chunk.right_edge
      //y = constrain(this.last_chunk.floor_y + random(-3, 3), , height)
      y = this.game.math.clamp(this.last_chunk.stop_floor + this.game.rnd.integerInRange(-3, 3), 0, this.world_height);
      chunk = this.chunk_levelGround(x, y, w);
    }

    this.chunks.push(chunk)
    return this.last_chunk = chunk
  }

  /*
   * A chunk is a section of the world which is playable. It handles creating all the
   * the blocks necessary to layout the chunk and returns a data-structure specifying
   * the some basic information of the chunk:
   * {
   *  left_edge: the left edge of the chunk in blocks,
   *  right_edge: the right edge of the chunk in blocks,
   *  width: the width of the chunk,
   *  start_floor: the y of the top-right-most walkable surface
   *  stop_floor: the y of the top-left-most walkable surface
   * }
   * All the different chunk types:
   */
  chunk_levelGround(x, y, w) {
    let chunk_blocks = []
    for (let i = x; i < x + w; i++) {
      chunk_blocks.push(this.newBlock(i, y));
    }

    return {blocks: chunk_blocks, left_edge: x, right_edge: x + w, start_floor: y, stop_floor: y }
  }

  newBlock(x, y) {
    // // Get the first dead missile from the missileGroup
    let block = this.blocks.getFirstDead();

    x = x * this.BLOCK_SIZE
    y = this.game.height - (y * this.BLOCK_SIZE)

    // If there aren't any available, create a new one
    if (block === null) {
        block = this.game.add.sprite(x, y, 'ground_middle_1x1');
        block.anchor.set(0, 1);
        block.scale.set(2);
        this.game.physics.enable(block, Phaser.Physics.ARCADE);
        block.body.immovable = true;
        block.body.allowGravity = false;
        block.smoothed = false;
        this.blocks.add(block);
    } else {
      block.reset(x, y)
    }

    return block;
  }

  updateBlocks(camera) {
    return
    // Camera is centered at zero, zero on the canvas,
    // so camera.x is width / 2
    for (let floor of this.blocks) {
      // left edge of the viewport
      let camera_left = camera.position.x - (width * 0.5);
      // right edge of the floor
      let floor_right = floor.position.x + (floor.width * 0.5)

      if (floor_right < camera_left ) {
        floor.remove()
        this.nextFloor()
      }
    }
  }
}
