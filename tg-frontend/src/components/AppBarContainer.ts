import {connect, Dispatch} from 'react-redux';
import {resizeAppBar} from '../redux/actions';
import AppBar, {IAppBarProps} from './AppBar';

const mapStateToProps = () => ({});

const mapDispatchToProps = <T>(dispatch: Dispatch): Partial<IAppBarProps> => ({
  handleResize: (width, height) => {
    dispatch(resizeAppBar(width, height));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
