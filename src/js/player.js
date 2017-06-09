import Level from './level';

export default class Runner {
  constructor(game, level) {
    this.game = game
    //this.sprite.debug = true
    this.GRAVITY = 1800;
    this.JUMP_FORCE = 600
    this.RUN_SPEED = 200;
    this.MAX_RUN_SPEED = 500;

    this.auto_run = true
    this.auto_jump = true

    this.level = level;
  }

  preload() {
    // 8x5
    this.hero_animation = {
      size: {rows: 5, columns: 8},
      animations: {
        idle: {row: 0, cols: [0,1,2,3,4,5,6,7]},
        walk: {row: 1, cols: [0,1,2,3,4,5]},
        walk_shoot: {row: 2, cols: [0,1,2,3,4,5]},
        jump: {row: 3, cols: [0,1,2,1,0]},
        die: {row: 3, cols: [0,1,2,3]},
        crouch: {row: 4, cols: [0,1]}
      }
    }
    this.game.load.spritesheet('hero', 'assets/hero_spritesheet.png', 82, 72, 40);
  }

  create() {
    // Create a player sprite
    this.sprite = this.game.add.sprite(100, this.game.height - (Level.BLOCK_SIZE * 4), 'hero');
    let sprite = this.sprite
    sprite.frame = 0;
    sprite.debug = true;
    sprite.smoothed = false;
    sprite.anchor.set(0.5, 1);

    // Enable physics on the player
    this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
    let body = sprite.body
    body.gravity.y = this.GRAVITY;
    body.allowGravity = true;
    body.setSize(56, 62, 13, 8);

    const columns = this.hero_animation.size.columns;
    for (let anim_name of Object.keys(this.hero_animation.animations)) {
      const anim = this.hero_animation.animations[anim_name];
      sprite.animations.add(anim_name, anim.cols.map(idx => (anim.row * columns) + idx));
    }
  }

  /*
   * These functions control the animation state of the character
   * based upon its physical state
   */
  animate_walk() {
    if (this.is_grounded) {
      this.sprite.animations.play('walk', 10, true);
    }
    if (this.sprite.body.velocity.x < 0) {
      this.sprite.scale.set(-1, 1);
    } else {
      this.sprite.scale.set(1, 1);
    }
  }

  animate_idle() {
    if (this.is_grounded) {
      this.sprite.animations.play('idle', 4, true);
      this.sprite.scale.set(1, 1);
    }
  }

  animate_jump() {
    this.sprite.animations.play('jump', 1, false);
  }

  /*
   * These control the action of the character, and depend on the animation
   * functions to control that.
   */
  left() {
    // If the LEFT key is down, set the player velocity to move left
    this.sprite.body.velocity.x = -this.RUN_SPEED;
    this.animate_walk();
  }

  stand() {
    // Stop the player from moving horizontally
    this.sprite.body.velocity.x = 0;
    this.animate_idle();
  }

  right() {
    this.sprite.body.velocity.x = this.RUN_SPEED;
    this.animate_walk();
  }

  run() {
    // add run speed towards the right
    this.right()
  }

  jump() {
    if (this.is_grounded) {
      this.sprite.body.velocity.y = -this.JUMP_FORCE;
      this.animate_jump()
    }
  }

  update() {
    const game = this.game
    const body = this.sprite.body

    if (this.auto_run) {
      this.run()
    }

    if (this.auto_jump && this.is_grounded) {
      // for (let floor of game.floor_manager.floors) {
      //   if (floor.overlapPoint(runner.position.x + 60, runner.position.y + runner.height * .25)) {
      //     this.jump()
      //   }
      // }
    }

    body.velocity.x = this.game.math.min(body.velocity.x, this.MAX_RUN_SPEED)

    if (body.y > this.game.height) {
      this.sprite.kill();
    }
  }



  draw() {
    noStroke();
    fill(this.shapeColor);
    rect(0, 0, this._internalWidth, this._internalHeight);
  }

  get height() {
    return this.sprite.height
  }

  get width() {
    return this.sprite.width
  }

  get velocity() {
    return this.sprite.velocity
  }

  get position() {
    return this.sprite.position
  }
}
