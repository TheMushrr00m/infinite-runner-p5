export default class Level {
  constructor(game, block_buffer) {
    this.game = game
  }

  preload() {
    // load an ATLAS that we will use as tiles
    this.game.load.atlasJSONHash('terrain', 'assets/terrain.png', 'assets/terrain.json');
  }

  create() {
    console.log(this.game.cache.getImage('terrain'))
    this.world_width = this.game.width / Level.BLOCK_SIZE
    this.world_height = this.game.height / Level.BLOCK_SIZE
    this.blocks = this.game.add.group()
    this.blocks.name = 'blocks'

    //  Creates a blank tilemap
    const map = this.map = game.add.tilemap();

    //  Add the atlas to the map to use for images
    let tileset = map.addTilesetImage('terrain');
    console.log('tileset:', tileset)


    //  Creates a new blank layer and sets the map dimensions.
    //  In this case the map is 40x30 tiles in size and the tiles are 32x32 pixels in size.
    let layer = map.create('level1', 40, 30, 32, 32);
    console.log("layer: ", layer);

    let tileTypeIdx = map.getImageIndex('terrain/ground_middle_1x1');
    console.log("idx: ", tileTypeIdx);

    //  Resize the world so that its the same of the world
    //layer1.resizeWorld();
    // Leave the world size alone since we want to scroll a little bit and do
    // some special sliding and wrapping manually

    //map.putTile(tileTypeIdx, 5, 5, layer);
    map.fill(1, 0, 5, 7, 1, layer);
  }

  nextChunk() {
    return {type:'level_ground', blocks: [], left_edge: 0, right_edge: 500, start_floor:7, stop_floor: 7 }
  }

  update() {

  }

  interact() {

  }

  updateBlocks() {

  }
}
Level.BLOCK_SIZE = 32;
