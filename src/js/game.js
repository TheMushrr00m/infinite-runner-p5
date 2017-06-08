import 'babel-polyfill';

import Environment from './environment';
import Player from './player';
import Level from './level';

class GameState {
  constructor(game) {
    this.game = game;
    this.modules = []
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


    this.environment = this.addModule(new Environment(game));
    this.player = this.addModule(new Player(game));
    this.level = this.addModule(new Level(game));
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
      console.log(chunk.left_edge , this.level.world_width,chunk.left_edge > this.level.world_width)
      if (chunk.left_edge > this.level.world_width) {
        return;
      }
    }
  }

  // The update() method is called every frame
  update() {
      this.level.interact(this.player);
      this.level.updateBlocks(this.player);


      if (this.leftInputIsActive) {
        this.player.left();
      } else if (this.rightInputIsActive) {
        this.player.right()
        //this.level.blocks.addAll('body.position.x', -10);
      } else {
        this.player.stand();
      }

      if (this.jumpInputIsActive) {
        this.player.jump();
      }

      this.game.camera.follow(this.player.sprite)
      //this.game.camera.x = this.player.sprite.x
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
        Phaser.Keyboard.SPACEBAR
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
