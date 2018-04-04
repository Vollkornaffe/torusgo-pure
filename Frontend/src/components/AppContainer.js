import {connect} from 'react-redux';
import App from './App';
import {sideBarResize, viewGame} from '../redux/actions';

const mapStateToProps = (state) => {
  const {games, users} = state;
  return {
    games: games.allIds.map((id) => games.byId[id]),
    users: users.allIds.map((id) => users.byId[id]),
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);