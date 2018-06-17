import TorusView from './Torus';
import {
  addPass, addRegularMove, addDefaultGame,
} from '../redux/actions';
import {connect} from 'react-redux';
import {convertState} from 'torusgo-logic';

/**
 * @param {Game} games
 * @return {Object}
 */
const mapStateToProps = ({games}) => ({
  boardState: convertState(games).board,
  boardSize: {
    x: games.local.meta.x,
    y: games.local.meta.y,
  },
});

/**
 * @param {Game} game
 */
function mam(game) {
  game.meta.observers.forEach();
}

const mapDispatchToProps = (dispatch) => ({
  handleInteraction: (id, {x, y}) => dispatch(addRegularMove(id, x, y)),
  handlePass: (id) => dispatch(addPass(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TorusView);
