import {connect} from 'react-redux';
import SideBar from './SideBar';
import {addDefaultGame, sideBarResize, viewGame} from '../redux/actions';

const mapStateToProps = (state) => {
  const {games, users, ui} = state;
  return {
    games: games.allIds.map((id) => games.byId[id]),
    users: users.allIds.map((id) => users.byId[id]),
    appBarHeight: ui.appBar.height,
    visible: ui.loginState !== 'undefined',
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSwitch: (id) => {
      dispatch(viewGame(id));
    },
    handleResize: (width, height) => {
      dispatch(sideBarResize(width, height));
    },
    handleNewGame: () => {
      dispatch(addDefaultGame());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
