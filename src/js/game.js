import 'babel-polyfill';

import Environment from './environment';
import Player from './player';
import Level from './level';

class GameState {
  constructor(game) {
    this.game = game;
    this.modules = []

    this.enable_player_debug = false;

    this.CAMERA_X_OFFSET = 100
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
    this.level = this.addModule(new Level(this.game, -5));
    this.player = this.addModule(new Player(this.game, this.level));
  }

  // Load images and sounds
  preload() {
    this.modules.forEach(module => { if (module.preload !== undefined) module.preload(); });
  }

  // Setup the example
  create() {
    // technically not infinite....just really really big
    this.game.world.setBounds(0, 0, 3500, this.game.height);

    this.modules.forEach(module => { if (module.create !== undefined) module.create(); });
    this.bindKeys();

    for(;;) {
      let chunk = this.level.nextChunk();
      if (chunk.left_edge > this.level.world_width - 5) {
        return;
      }
    }
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
        this.player.right()
      }
      // else if (this.leftInputIsActive) {
      //   this.player.left();
      // }
      else {
        this.player.stand();
      }
    }

//    if (!this.player.auto_jump) {
      if (this.jumpInputIsActive) {
        this.player.jump();
      }
    //}

    this.player.update();

    //
    // slide the world along, this prevents us from needing an infinitely large
    // world to scroll infinitely
    //
    this.wrapWorld()

    //this.game.camera.follow(this.player.sprite)
    this.game.camera.x = this.player.sprite.body.position.x - this.CAMERA_X_OFFSET
  }

  wrapWorld() {
    const slide_in_blocks = 40
    const slide_in_pixel = Level.BLOCK_SIZE * slide_in_blocks
    let pbody = this.player.sprite.body

    // We use 300px of buffer so that when we slide everything over the camera doesn't hit the world bounds,
    // the camera's x cannot be less than 0
    if (pbody.position.x > slide_in_pixel + 300) {
      let px = pbody.position.x
      let pnx = px - (slide_in_pixel - pbody.deltaX());
      pbody.position.x = pnx
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
        Phaser.Keyboard.D
    ]);
  }

  // This function should return true when the player activates the "jump" control
  // In this case, either holding the right arrow or tapping or clicking on the left
  // side of the screen.
  get jumpInputIsActive() {
      var isActive = false;

      isActive = this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 5);
      isActive |= this.input.keyboard.downDuration(Phaser.Keyboard.UP, 5);

      return isActive;
  }

  // This function should return true when the player activates the "go left" control
  // In this case, either holding the right arrow or tapping or clicking on the left
  // side of the screen.
  get leftInputIsActive() {
      var isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x < this.game.width/4);

      return isActive;
  }

  // This function should return true when the player activates the "go right" control
  // In this case, either holding the right arrow or tapping or clicking on the right
  // side of the screen.
  get rightInputIsActive() {
      var isActive = false;

      isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
      isActive |= (this.game.input.activePointer.isDown &&
          this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

      return isActive;
  }
}

var game = new Phaser.Game(848, 450, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
