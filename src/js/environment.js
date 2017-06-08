export default class Environment {
  constructor(game) {
    this.game = game;
  }

  preload(){
    const game = this.game
    const image = function(name, filename) {
      if (filename === undefined) {
        filename = name
      }

      game.load.image(name, 'assets/sunny-land/environment/' + filename + '.png')
    }
      
    // backgrounds
    image('background', 'back');
    image('middleground', 'middle');
  }

  create() {
    this.createBackgrounds();
  }

  createBackgrounds() {
    const game = this.game

    this.background = game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.middleground = game.add.tileSprite(0, 80, this.game.width, this.game.height, 'middleground');
    this.background.fixedToCamera = true;
    this.middleground.fixedToCamera = true;
  }
}
