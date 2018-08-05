import {connect} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {asyncLoginAsGuest, asyncLoginWithCredentials, asyncRegister} from '../redux/actions';
import {IState} from '../types';
import {default as LoginForm, IDispatchProps} from './LoginForm';

const mapDispatchToProps = (dispatch: ThunkDispatch<IState, void, Action>) => ({
  handleLogin: (username: string, password: string) => {
    dispatch(asyncLoginWithCredentials(username, password));
  },
  handleRegister: (username: string, email: string, password: string) => {
    dispatch(asyncRegister(username, email, password));
  },
  handleGuest: () => {
    dispatch(asyncLoginAsGuest());
  }
});

export default connect<{}, IDispatchProps>(null, mapDispatchToProps)(LoginForm);
