import 'babel-polyfill';

import Environment from './environment';
import Player from './player';
import Level from './level';
//import Level from './TilemapExample';

class GameState {
  constructor(game) {
    this.game = game;
    this.modules = []

    this.enable_player_debug = false;

    this.CAMERA_X_OFFSET = 100
    window.game = this
  }

  addModule(module) {
    this.modules.push(module)
    return module
  }

  init() {
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    //this.scale.setScreenSize(true);


    this.environment = this.addModule(new Environment(this.game));
    this.level = this.addModule(new Level(this.game, 5));
    //this.level = this.addModule(new TilemapExample(this.game, 5));
    this.player = this.addModule(new Player(this.game, this.level));
  }

  // Load images and sounds
  preload() {
    this.modules.forEach(module => { if (module.preload !== undefined) module.preload(); });
    //this.game.stage.disableVisibilityChange = true;
  }

  // Setup the example
  create() {

    // technically not infinite....just really really big
    this.game.world.setBounds(0, 0, 3500, this.game.height);

    // this group is used to track all environment objects (non-collided backgrounds)
    this.environment_group = this.game.add.group(this.game.world, 'environment')

    // this group is used to track all level objets
    this.level_group = this.game.add.group(this.game.world, 'level')

    // this group is used to track all objects not updated by the level
    this.entities = this.game.add.group(this.game.world, 'entities')

    this.environment.create(this.environment_group)
    this.level.create(this.level_group)
    this.player.create(this.entities)

    this.bindKeys();

    // this.level.chunk_levelGround(0, 3, 7);
    // this.level.chunk_levelGround(8, 5, 5);
    // this.level.chunk_levelGround(13, 2, 5);
    // this.level.chunk_pit(19, 4, 2);
    for(;;) {
      let chunk = this.level.nextChunk();
      if (chunk.right_edge > this.level.world_width - 5) {
        break;
      }
    }
    console.log("Done creating game...")
    console.log(this.environment_group, this.level_group, this.entities)
    this.entities.name = 'entities'
    this.entities.add(this.player.sprite)

    this.ui_group = this.game.add.group()
    //this.ui_group.fixedToCamera = true

    this.distanceUI = this.game.add.text(5, 5, 'Distance: 0', this.ui_group)
    this.distanceUI.fixedToCamera = true
    this.total_distance = 0
  }

  // The update() method is called every frame
  update() {
    if (!this.player.sprite.alive) {
      game.state.restart('game')
    }

    this.handleNonPlayerKeys()

    this.level.interact(this.player);
    this.level.updateBlocks(this.player);


    if (!this.player.auto_run) {
      if (this.rightInputIsActive) {
        this.player.right();
      } else {
        this.player.stand();
      }
    }

    if (this.jumpInputIsActive) {
      this.player.jump();
    }

    if (this.shootInputIsActive) {
      this.player.shoot();
    }

    this.player.update();

    //
    // slide the world along, this prevents us from needing an infinitely large
    // world to scroll infinitely
    //
    this.wrapWorld()

    //this.game.camera.follow(this.player.sprite)
    this.game.camera.x = this.player.sprite.body.position.x - this.CAMERA_X_OFFSET

    this.total_distance +=  this.game.math.floorTo(this.player.sprite.body.deltaX())
    // we devide the pixel distance to give something that feels "right"
    this.distanceUI.text = "Distance: " +  this.game.math.floorTo(this.total_distance / 20.0)
  }

  render() {

  }

  wrapWorld() {
    const slide_in_blocks = 40
    const slide_in_pixel = Level.BLOCK_SIZE * slide_in_blocks
    let pbody = this.player.sprite.body

    // We use 300px of buffer so that when we slide everything over the camera doesn't hit the world bounds,
    // the camera's x cannot be less than 0
    if (pbody.position.x > slide_in_pixel +  Level.BLOCK_SIZE * 5) {
      console.log("Wrapped!")
      let px = pbody.position.x
      let delta_x = (slide_in_pixel - pbody.deltaX());
      let pnx = px - delta_x;
      pbody.position.x = pnx

      // we just moved the player and the physics engine is going to notice
      // it and change deltaX which will confuse the distance calculations
      this.total_distance += this.game.math.ceilTo(delta_x)

      //this.entities.setAllChildren('body.position.x', -delta_x, true, false, 1);
      this.level.slideBlocks(slide_in_blocks)
    }
  }

  handleNonPlayerKeys() {
    if (this.input.keyboard.downDuration(Phaser.Keyboard.D, 1)) {
      this.enable_player_debug = !this.enable_player_debug;
      if (!this.enable_player_debug) {
        this.game.debug.reset();
      }
    }

    if (this.input.keyboard.downDuration(Phaser.Keyboard.P, 1)) {
      game.paused = true;
    }
    if (this.input.keyboard.downDuration(Phaser.Keyboard.R, 1)) {
      this.player.auto_run = !this.player.auto_run;
    }
    if (this.input.keyboard.downDuration(Phaser.Keyboard.J, 1)) {
      this.player.auto_jump = !this.player.auto_jump;
    }
  }

  render() {
    if (this.enable_player_debug) {
      this.game.debug.bodyInfo(this.player.sprite, 32, 32);
      this.game.debug.body(this.player.sprite);
    }
  }

  bindKeys() {
    // Capture certain keys to prevent their default actions in the browser.
    // This is only necessary because this is an HTML5 game. Games on other
    // platforms may not need code like this.
    this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR,
        Phaser.Keyboard.SHIFT,
        Phaser.Keyboard.D,
        Phaser.Keyboard.P,
        Phaser.Keyboard.J,
        Phaser.Keyboard.R
    ]);
  }

  get shootInputIsActive() {
    let isActive = false;

    isActive = this.input.keyboard.downDuration(Phaser.Keyboard.SHIFT, 5);

    return isActive;
  }

  // This function should return true when the player activates the "jump" control
  // In this case, either holding the right arrow or tapping or clicking on the left
  // side of the screen.
  get jumpInputIsActive() {
      let isActive = false;

      isActive = this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 5);
      isActive |= this.input.keyboard.downDuration(Phaser.Keyboard.UP, 5);

      return isActive;
  }

  // This function should return true when the player activates the "go left" control
  // In this case, either holding the right arrow or tapping or clicking on the left
  // side of the screen.
  get leftInputIsActive() {
      let isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x < this.game.width/4);

      return isActive;
  }

  // This function should return true when the player activates the "go right" control
  // In this case, either holding the right arrow or tapping or clicking on the right
  // side of the screen.
  get rightInputIsActive() {
      let isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

      return isActive;
  }
}

var game = new Phaser.Game(Level.BLOCK_SIZE * 35, Level.BLOCK_SIZE * 13, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
