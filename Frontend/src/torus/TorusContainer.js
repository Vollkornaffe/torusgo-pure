import TorusView from './Torus';
import {
  addPass, addRegularMove, addDefaultGame,
} from '../redux/actions';
import {connect} from 'react-redux';
import {convertState} from 'torusgo-logic';

const mapStateToProps = (state) => {
  const width = state.ui.window.width - state.ui.sideBar.width;
  const height = state.ui.window.height - state.ui.appBar.height;
  const x = 0;
  const y = state.ui.appBar.height;

  if (!state.ui.activeGameId) return {width, height, x, y};

  const game = state.games.byId[state.ui.activeGameId];

  return {
    gameId: game.id,
    boardState: convertState(game.details.currentState).board,
    boardSize: {x: game.meta.x, y: game.meta.y},
    width,
    height,
    x,
    y,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleInteraction: (id, {x, y}) => {
      dispatch(addRegularMove(id, x, y));
    },
    handlePass: (id) => {
      dispatch(addPass(id));
    },
    handleNewGame: () => {
      dispatch(addDefaultGame());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TorusView);
