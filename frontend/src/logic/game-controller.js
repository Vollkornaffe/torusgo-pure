import autoBind from 'react-autobind';
import {State} from 'torusgo-logic';

class GameController {
  constructor(options) {
    autoBind(this);

    this.size = options.size;

    this.scoring = false;

    this.initState();
  }

  setScoringMode(mode) {
    this.scoring = mode;
  }

  loadState(state) {
    this.state = state;
  }

  initState() {
    this.state = new State(this.size.x, this.size.y);
  }

  interact(x, y) {
    if (this.scoring) {
      this.state.updateScore();
      this.state.directCapture(x, y);
    } else {
      this.state.makeMove(x, y);
    }
  }

  suggestMove(x, y) {
    if (this.scoring) return true;
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