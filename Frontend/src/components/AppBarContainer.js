import {connect} from 'react-redux';
import AppBar from './AppBar';
import {appBarResize} from '../redux/actions';

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => {
  return {
    handleResize: (width, height) => {
      dispatch(appBarResize(width, height));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
