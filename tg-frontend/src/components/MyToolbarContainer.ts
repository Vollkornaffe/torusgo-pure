import {connect}         from 'react-redux';
import {IState}          from '../types/redux';
import Toolbar, {IProps} from './MyToolbar';

const mapStateToProps = (state: IState): IProps => ({
  loginState: state.loginState,
  connectionStatus: state.connectionStatus,
  user: state.ownUserId ? state.resources.user[state.ownUserId] : undefined,
});


export default connect(mapStateToProps)(Toolbar);
