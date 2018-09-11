import {connect}        from 'react-redux';
import {IState}         from '../types/redux';
import Status, {IProps} from './Status';

const mapStateToProps = (state: IState): IProps => ({
  connectionState: state.connectionStatus,
  loginState: state.loginState,
});

export default connect(mapStateToProps)(Status);
