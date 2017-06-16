export default class Level {
//  static BLOCK_SIZE = 32;

  constructor(game, block_buffer) {
    this.game = game
    this.first_floor = true;
    this.chunks = []
    this.block_buffer = block_buffer;
    //this.last_chunk = {type: 'none'}
    this.chunks.push({type: 'none', stop_floor: 0})
  }

  preload(){
    this.game.load.atlasJSONHash('terrain', 'assets/terrain.png', 'assets/terrain.json');
  }

  create(level_group) {
    this.world_width = this.game.width / Level.BLOCK_SIZE
    this.world_height = this.game.height / Level.BLOCK_SIZE
    this.blocks = this.game.add.group(level_group, 'blocks')
  }

  interact(player) {
    // Collide the player with the ground
    this.game.physics.arcade.collide(player.sprite, this.blocks);
    this.game.physics.arcade.collide(player.bullets, this.blocks, (bullet, blocks) => bullet.kill());
  }

  nextChunk() {
    let chunk, x, y, w, h;

    if (this.first_floor) {
      this.first_floor = false;
      this.chunks = [{type: 'none', stop_floor: 3}]
      return this.chunk_levelGround(0, 3, 5);
    }


    x = this.last_chunk.right_edge + 1
    let next_type = this.game.rnd.frac()
    if (next_type < .7) {
      chunk = this.chunk_levelGround(x);
    } else {
      chunk = this.chunk_pit(x);
    }

    return chunk
  }

  get last_chunk() {
    return this.chunks[this.chunks.length - 1]
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
    const chunk_blocks = []
    const last_y = this.last_chunk.stop_floor

    if (y === undefined) {
      y = this.game.math.clamp(last_y + this.game.rnd.integerInRange(-3, 3), 0, this.world_height - 4);
    }
    if (w === undefined) {
      w = this.game.rnd.integerInRange(3, 6)
    }
    console.log('level', x, y, w)


    const this_is_lower = last_y > y
    const this_is_higher = last_y < y
    const delta_y = this.game.math.difference(last_y, y)
    if (this_is_higher) {
      this.verticle_line(chunk_blocks, last_y, y, x,
        'stone_left_to_underground_1x1', 'underground_left_edge_1x1', 'ground_cliff_left_1x1')
      this.horizontal_line(chunk_blocks, x + 1, x + w, y, 'ground_middle_1x1')
      this.fill(chunk_blocks, x + 1, 0, x + w, y - 1, 'underground_1x1')
      this.fill(chunk_blocks, x, 0, x, last_y - 1, 'underground_1x1')
    } else if (this_is_lower) {
      this.verticle_line(chunk_blocks, last_y, y, x,
        'stone_right_to_underground_1x1', 'underground_right_edge_1x1', 'ground_cliff_right_1x1')
      this.horizontal_line(chunk_blocks, x + 1, x + w, y, 'ground_middle_1x1')
      this.fill(chunk_blocks, x, 0, x + w, y - 1, 'underground_1x1')
    } else { // level with the other block
      this.horizontal_line(chunk_blocks, x, x + w, y, 'ground_middle_1x1')
      this.fill(chunk_blocks, x, 0, x + w, y - 1, 'underground_1x1')
    }

    let chunk = {type:'level_ground', blocks: chunk_blocks, left_edge: x, right_edge: x + w, start_floor: y, stop_floor: y }
    this.chunks.push(chunk)
    return chunk
  }

  chunk_pit(x, y, w) {
    const chunk_blocks = []
    const last_y = this.last_chunk.stop_floor

    if (y === undefined) {
      y = this.game.math.clamp(last_y + this.game.rnd.integerInRange(-6, 2), 1, this.world_height - 4);
    }
    if (w === undefined) {
      w = this.game.rnd.integerInRange(4, 7)
    }
    console.log('pit', x, y, w)

    // left edge
    this.verticle_line(chunk_blocks, 0, last_y, x,
      'underground_right_edge_1x1', 'underground_right_edge_1x1', 'ground_cliff_right_1x1')

    // pit
    // -- its just empty

    // right edge
    this.verticle_line(chunk_blocks, 0, y, x + w - 1,
      'underground_left_edge_1x1', 'underground_left_edge_1x1', 'ground_cliff_left_1x1')
    this.verticle_line(chunk_blocks, 0, y, x + w,
      'underground_1x1', 'underground_1x1', 'ground_middle_1x1')


    let chunk = {type:'level_ground', blocks: chunk_blocks, left_edge: x, right_edge: x + w, start_floor: y, stop_floor: y }
    this.chunks.push(chunk)
    return chunk
  }

  horizontal_line(blocks, start_x, end_x, y, start_type, middle_type, end_type) {
    if (middle_type === undefined) {
      middle_type = end_type = start_type
    }
    let type = null;
    for (let x = start_x; x <= end_x; x++) {
      if (x == end_x) {
        type = end_type
      } else if (x == start_x) {
        type = start_type
      } else {
        type = middle_type
      }
      blocks.push(this.newBlock(x, y, type));
    }
  }

  verticle_line(blocks, start_y, end_y, x, start_type, middle_type, end_type) {
    if (middle_type === undefined) {
      middle_type = end_type = start_type
    }
    let type = null;
    if (end_y < start_y) {
      let tmp = start_y
      start_y = end_y
      end_y = tmp
    }
    for (let y = start_y; y <= end_y; y++) {
      if (y == end_y) {
        type = end_type
      } else if (y == start_y) {
        type = start_type
      } else {
        type = middle_type
      }
      blocks.push(this.newBlock(x, y, type));
    }
  }

  fill(blocks, start_x, start_y, end_x, end_y, type) {
    // const end_x = start_x + w
    // const end_y = start_y + h
    for (let x = start_x; x <= end_x; x++) {
      for (let y = start_y; y <= end_y; y++) {
        blocks.push(this.newBlock(x, y, type));
      }
    }
  }

  newBlock(x, y, type) {
    // // Get the first dead missile from the missileGroup
    let block = this.blocks.getFirstDead();

    x = x * Level.BLOCK_SIZE
    y = this.game.height - (y * Level.BLOCK_SIZE)

    // If there aren't any available, create a new one
    if (block === null) {
        block = this.game.add.sprite(x, y, 'terrain');
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

  toBlockCoords(x, y) {
    return [this.game.math.ceilTo(x / Level.BLOCK_SIZE), this.world_height - this.game.math.ceilTo(y / Level.BLOCK_SIZE)]
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
//
