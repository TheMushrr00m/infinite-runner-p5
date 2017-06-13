export default class Environment {
  constructor(game) {
    this.game = game;
  }

  preload(){
    this.game.load.image('background', 'assets/background.png');
    this.game.load.image('middleground', 'assets/middleground.png');
  }

  create(environment_group) {
    this.createBackgrounds(environment_group);
  }

  createBackgrounds(environment_group) {
    const game = this.game

    this.background = game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    environment_group.add(this.background)
    this.middleground = game.add.tileSprite(0, 80, this.game.width, this.game.height, 'middleground');
    environment_group.add(this.middleground)
    
    this.background.fixedToCamera = true;
    this.middleground.fixedToCamera = true;
  }
}
