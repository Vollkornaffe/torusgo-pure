import {connect} from 'react-redux';
import {IState} from '../types';
import View from './View';

const mapStateToProps = (state: IState) => {
  const width = state.dimensions.window.width - state.dimensions.sideBar.width;
  const height = state.dimensions.window.height - state.dimensions.appBar.height;
  const x = 0;
  const y = state.dimensions.appBar.height;

  return {
    width,
    height,
    x,
    y,
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(View);