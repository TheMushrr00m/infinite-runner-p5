class Runner {
  constructor(game) {
    this.game = game
    this.sprite = createSprite(10, 80, 20, 50);
    this.sprite.shapeColor = color(255, 5, 255, 255);
    //this.sprite.debug = true
    this.JUMP_FORCE = 25
    this.RUN_SPEED = 2
    this.MAX_RUN_SPEED = 10

    this.auto_run = true
    this.auto_jump = true

    this.sprite.draw = this.draw
  }

  update() {
    const game = this.game
    const runner = this.sprite
    
    this.on_floor = false
    for (let floor of game.floor_manager.floors) {
      this.on_floor |= floor.overlapPoint(runner.position.x, runner.position.y + runner.height * .5 + runner.velocity.y + 2)
      this.floor = floor
      if (this.on_floor) {
        break
      }
    }

    if (this.auto_run) {
      this.run()
    }


    if (!this.on_floor) {
      runner.addSpeed(game.gravity, 90);
    } else {
      // on the floor means we don't move down and we are smoothly on-top of it
      runner.velocity.y = 0
      runner.position.y = this.floor.position.y - this.floor.height * .5 - runner.height * .5 + 2
      // apply friction
      if (runner.velocity.x > 0) {
        runner.velocity.mult(this.floor.friction);
      } else {
        this.velocity = 0
      }

      // check in front of the player for a wall and auto-jump
      if (this.auto_jump) {
        for (let floor of game.floor_manager.floors) {
          if (floor.overlapPoint(runner.position.x + 60, runner.position.y + runner.height * .25)) {
            this.jump()
          }
        }
      }
    }

    runner.velocity.x = min(runner.velocity.x, this.MAX_RUN_SPEED)

  }

  run() {
    // add run speed towards the right
    this.sprite.addSpeed(game.runner.RUN_SPEED, 0);
  }

  jump() {
    this.sprite.addSpeed(game.runner.JUMP_FORCE, -90)
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
