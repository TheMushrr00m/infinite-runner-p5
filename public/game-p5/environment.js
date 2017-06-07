class Environment {
  constuctor(game) {
    this.game = game;
  }

  preload(){
    const image = function(name, filename) {
      if (filename === undefined) {
        filename = name
      }

      this.game.image(name, 'assets/sunny-land/environment/' + filename + '.png')
    }
    // ground
    image('ground_1x1')

    // backgrounds
    image('background', 'back');
    image('middleground', 'middle');
  }

  create() {
    this.createBackgrounds();
  }

  createBackgrounds() {
    this.background = game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.middleground = game.add.tileSprite(0, 80, this.game.width, this.game.height, 'middleground');
    this.background.fixedToCamera = true;
    this.middleground.fixedToCamera = true;
  }
}
