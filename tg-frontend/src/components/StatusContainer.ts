import {connect} from 'react-redux';
import {IState} from '../types';
import Status, {IProps} from './Status';

const mapStateToProps = (state: IState): Partial<IProps> => ({
  connectionState: state.connectionStatus,
  loginState: state.loginState,
});

const mapDispatchToProps = (): Partial<IProps> => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Status);
