import autoBind from 'react-autobind';
import update from 'immutability-helper';
import merge from '../utils/merge';

/**
 */
class Test {
  constructor() {
    autoBind(this);
    this.a = [
      {
        x: 1,
      },
      {
        x: 2,
      },
      {
        x: 3,
      },
    ];
  }

  getState(index = this.a.length - 1) {
    return this.a[index];
  }

  update() {
    return update(this, {a: {$push: [{x: 8}]}});
  }
}

export default Test;