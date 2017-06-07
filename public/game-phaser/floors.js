class FloorManager {
  constructor(game) {
    this.game = game
    this.floors = new Group()
    this.first_floor = true
  }

  nextFloor() {
    let floor, x, y, w, h;

    if (this.first_floor) {
      this.first_floor = false
      x = -50
      y = height - 50
      w = 300
      h = 50

    } else {
      w = random(10, 30) * 10
      h = 50
      x = this.last_floor.position.x + this.last_floor.width * .5
      y = constrain(this.last_floor.position.y + random(-8, 8) * 5, 100, height)
    }
    floor = createSprite(x + w * .5, y, w, h);
    floor.draw = function() {
      // overload the draw function to get image scalling
      image(assets['ground'], 0, 0, w, h);
    };


    floor.width = w
    floor.height = h
    floor.immovable = true
    //floor.debug = true
    floor.friction = 0.9

    this.last_floor = floor
    this.floors.add(floor)
  }

  updateFloors(camera) {
    // Camera is centered at zero, zero on the canvas,
    // so camera.x is width/2
    //
    for (let floor of this.floors) {
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
