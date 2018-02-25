import autoBind from 'react-autobind';
import update from 'immutability-helper';
import merge from '../utils/merge';

/**
 * @param {number} length
 * @return {string}
 */
function makeid(length = 5) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

/**
 * @class User
 */
class User {
  /**
   * @constructor
   * @param {object} options options
   */
  constructor(options = {}) {
    autoBind(this);

    let defaults = {
      id: makeid(),
      name: 'anonymous',
      rank: '20 kyu',
    };

    merge(this, defaults, options);
  }

  /**
   * Immutable setter for param name
   * @param {string} name
   * @return {User}
   */
  changeName(name) {
    return update(this, {name: {$set: name}});
  }
}

export default User;
