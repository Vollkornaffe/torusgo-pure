import autoBind from 'react-autobind';
import State from './game-logic';

class GameController {
  constructor(options) {
    autoBind(this);

    this.size = options.size;

    this.initState();
  }

  loadState(state) {
    this.state = state;
  }

  initState() {
    this.state = new State(this.size.x, this.size.y);
  }

  makeMove(x, y) {
    this.state.makeMove(x, y);
  }

  suggestMove(x, y) {
    return this.state.testLegal(x, y);
  }

  getState() {
    return this.state;
  }

  getBoard() {
    return this.state.getFieldArray();
  }
}


export default GameController;