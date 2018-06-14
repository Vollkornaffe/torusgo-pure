import {connect, Dispatch} from 'react-redux';
import {IState} from '../types';
import ConnectionStatus, {IProps} from './ConnectionStatus';

const mapStateToProps = (state: IState): Partial<IProps> => ({
  connectionState: state.connectionState,
  loginState: state.loginState,
});

const mapDispatchToProps = (dispatch: Dispatch): Partial<IProps> => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionStatus);
