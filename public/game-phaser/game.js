// This example uses the Phaser 2.2.2 framework

// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

import Environment from 'game/environment'

class GameState {
  constructor(game) {
    this.game = game;

    this.modules = []
    this.environment = this.addModule(new Environment())
    this.player = this.addModule(new Player())
  }

  addModule(module) {
    this.modules.push(module)
    return module
  }

  // Load images and sounds
  preload() {
    this.modules.forEach(module => module.preload())
  }

  // Setup the example
  create() {
      this.modules.forEach(module => module.create())

      this.bindKeys()

      // // Define movement constants
      // this.MAX_SPEED = 500; // pixels/second
      //
      // // Create a player sprite
      // this.player = this.game.add.sprite(this.game.width/2, this.game.height - 64, 'environment', 'ground1');
      //
      // // Enable physics on the player
      // this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
      //
      // // Make player collide with world boundaries so he doesn't leave the stage
      // this.player.body.collideWorldBounds = true;

      // Create some ground for the player to walk on
      this.ground = this.game.add.group();
      for(var x = 0; x < this.game.width; x += 16) {
          // Add the ground blocks, enable physics on each, make them immovable
          var groundBlock = this.game.add.sprite(x, 50, 'simple-ground');
          groundBlock.debug = true
          console.log(groundBlock)
          this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
          groundBlock.body.immovable = true;
          groundBlock.body.allowGravity = false;
          this.ground.add(groundBlock);
      }
  }



  // The update() method is called every frame
  update() {
      // Collide the player with the ground
      this.game.physics.arcade.collide(this.player, this.ground);

      if (this.leftInputIsActive) {
          // If the LEFT key is down, set the player velocity to move left
          this.player.body.velocity.x = -this.MAX_SPEED;
      } else if (this.rightInputIsActive) {
          // If the RIGHT key is down, set the player velocity to move right
          this.player.body.velocity.x = this.MAX_SPEED;
      } else {
          // Stop the player from moving horizontally
          this.player.body.velocity.x = 0;
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
        Phaser.Keyboard.DOWN
    ]);
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
