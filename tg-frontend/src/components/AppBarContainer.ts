import {connect} from 'react-redux';
import {IState} from '../types/redux';
import AppBar, {IProps} from './AppBar';

const mapStateToProps = (state: IState): IProps => ({
  loginState: state.loginState,
  connectionStatus: state.connectionStatus,
  user: state.ownUserId ? state.resources.user[state.ownUserId] : undefined,
});


export default connect(mapStateToProps)(AppBar);
