export default class Level {
//  static BLOCK_SIZE = 32;

  constructor(game, block_buffer) {
    this.game = game
    this.first_floor = true;
    this.chunks = []
    this.block_buffer = block_buffer;
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
    // image('ground_middle_1x1');
    // image('ground_cliff_left_1x1');
    // image('ground_cliff_right_1x1');
    // image('underground_1x1');
    // image('underground_right_edge_1x1');
    // image('underground_left_edge_1x1');

    game.load.atlasJSONHash('environment', 'assets/sunny-land/environment/environment.png', 'assets/sunny-land/environment/environment.json');
  }

  create() {
    this.world_width = this.game.width / Level.BLOCK_SIZE
    this.world_height = this.game.height / Level.BLOCK_SIZE
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
      y = this.game.math.clamp(this.last_chunk.stop_floor + this.game.rnd.integerInRange(-3, 3), 0, this.world_height - 4);
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


    for (let i = x + 1; i < x + w - 1; i++) {
      chunk_blocks.push(this.newBlock(i, y, 'ground_middle_1x1'));
    }
    chunk_blocks.push(this.newBlock(x, y, 'ground_cliff_left_1x1'));
    chunk_blocks.push(this.newBlock(x + w - 1, y, 'ground_cliff_right_1x1'));

    if (false) {
      for (let j = y - 1; j >= 0; j--) {
        chunk_blocks.push(this.newBlock(j, x, 'underground_right_edge_1x1'));
        chunk_blocks.push(this.newBlock(j, x + w - 1, 'underground_left_edge_1x1'));
      }
      for (let i = x + 1; i < x + w - 1; i++) {
        for (let j = y - 1; j >= 0; j--) {
          chunk_blocks.push(this.newBlock(i, j, 'underground_1x1'));
        }
      }
    }

    return {blocks: chunk_blocks, left_edge: x, right_edge: x + w, start_floor: y, stop_floor: y }
  }

  newBlock(x, y, type) {
    // // Get the first dead missile from the missileGroup
    let block = this.blocks.getFirstDead();

    x = x * Level.BLOCK_SIZE
    y = this.game.height - (y * Level.BLOCK_SIZE)

    // If there aren't any available, create a new one
    if (block === null) {
        block = this.game.add.sprite(x, y, 'environment');
        block.frameName = type;
        block.anchor.set(0, 1);
        block.scale.set(2);
        this.game.physics.enable(block, Phaser.Physics.ARCADE);
        block.body.immovable = true;
        block.body.allowGravity = false;
        block.smoothed = false;
        this.blocks.add(block);
    } else {
      block.reset(x, y)
      block.frameName = type;
    }

    return block;
  }

  toBlockCoords(position) {
    return [this.game.math.ceilTo(position.x / Level.BLOCK_SIZE), this.world_height - this.game.math.ceilTo(position.y / Level.BLOCK_SIZE)]
  }

  getBlockAt(x, y) {
    return this.game.physics.arcade.getObjectsAtLocation(x * Level.BLOCK_SIZE, this.game.height - y * Level.BLOCK_SIZE, this.blocks)[0];
  }


  slideBlocks(num_blocks) {
      // slide each block's sprite over
      this.blocks.forEach((sprite) => sprite.body.position.x -= (num_blocks * Level.BLOCK_SIZE - sprite.body.deltaX()), this);
      // update all the chunks too
      this.chunks.forEach((chunk) => {
        chunk.left_edge -= num_blocks;
        chunk.right_edge -= num_blocks;
      })
  }

  updateBlocks() {
    const camera_left = this.game.camera.x

    // we need to negate the upcoming velocity change

    // Camera is centered at zero, zero on the canvas,
    // so camera.x is width / 2
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      const chunk = this.chunks[i]
      if ((chunk.right_edge + 1) * Level.BLOCK_SIZE < camera_left ) {
        console.log("Removed", chunk);
        chunk.blocks.forEach(block => block.kill())
        this.chunks.splice(i, 1);
      }
    }

    // generate enough chunks to keep the requried off screen buffer full
    const min_block_edge = this.game.math.ceilTo((this.game.camera.x + this.game.camera.width) / Level.BLOCK_SIZE) + this.block_buffer
    while ( this.chunks[this.chunks.length - 1].right_edge < min_block_edge) {
      this.nextChunk()
    }
  }
}
Level.BLOCK_SIZE = 32;
