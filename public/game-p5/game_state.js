/**
 * Enum of the current game state
 */
class GameState {
  static get GAME_START() {
    return 'game-start';
  }
  static get PAUSED() {
    return 'paused';
  }
  static get GAME_OVER() {
    return 'game-over';
  }
  static get PLAYING() {
    return 'playing';
  }
}
