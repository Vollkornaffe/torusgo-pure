import Welcome from './Welcome';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  const width = state.ui.window.width - state.ui.sideBar.width;
  const height = state.ui.window.height - state.ui.appBar.height;
  const x = 0;
  const y = state.ui.appBar.height;

  return {
    width,
    height,
    x,
    y,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSubmit: (name) => {
      dispatch()
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
