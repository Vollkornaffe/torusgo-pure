import {connect, Dispatch} from 'react-redux';
import {appBarResize} from '../redux/actions';
import AppBar, {IAppBarProps} from './AppBar';

const mapStateToProps = () => ({});

const mapDispatchToProps = <T>(dispatch: Dispatch): Partial<IAppBarProps> => ({
  handleResize: (width, height) => {
    dispatch(appBarResize(width, height));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
