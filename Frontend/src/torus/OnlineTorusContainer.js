import TorusView from './Torus';
import {
  addPass, addRegularMove, addDefaultGame,
} from '../redux/actions';
import {connect} from 'react-redux';
import {convertState} from 'torusgo-logic';

const mapStateToProps = (state) => {
  if (!state.ui.activeGameId) return {};

  const game = state.games.byId[state.ui.activeGameId];

  return {
    gameId: game.id,
    boardState: convertState(game.details.currentState).board,
    boardSize: {x: game.meta.x, y: game.meta.y},
  };
};

const mapDispatchToProps = (dispatch) => ({
  handleInteraction: (id, {x, y}) => dispatch(addRegularMove(id, x, y)),
  handlePass: (id) => dispatch(addPass(id)),
  handleNewGame: () => dispatch(addDefaultGame()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TorusView);
