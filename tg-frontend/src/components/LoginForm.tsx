import {
  Button,
  InputAdornment,
  TextField, Typography, WithStyles,
  withStyles
} from '@material-ui/core/es/index';
import {AccountCircle, VpnKey} from '@material-ui/icons';
import * as React from 'react';
import RegisterDialog from './RegisterDialog';

const styles = () => ({
  root: {
    minWidth: 550,
  },
  input: {
    margin: 8,
  },
  btn: {
    marginTop: -14,
    marginLeft: 10,
  },
  divider: {
    borderRight: '0.1em solid black',
    padding: 5,
    paddingTop: -14,
  }
});

export interface IDispatchProps {
  handleLogin: (username: string, password: string) => void,
  handleGuest: () => void,
  handleRegister: (username: string, email: string, password: string) => void,
}

export interface IProps extends WithStyles<typeof styles>, IDispatchProps {}

interface IState {
  username: string,
  password: string,
  open: boolean,
}

class LoginForm extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      open: false,
    }
  }

  public render() {
    const {handleLogin, handleRegister, handleGuest, classes} = this.props;

    const {username, password, open} = this.state;

    const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        ...this.state,
        username: event.target.value,
      });
    };

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        ...this.state,
        password: event.target.value,
      });
    };

    const onLoginClick = () => {
      handleLogin(this.state.username, this.state.password);
    };

    const onGuestClick = () => {
      handleGuest();
    };

    const onClose = () => {
      this.setState({open: false});
    };

    const onOpen = () => {
      this.setState({open: true});
    };

    return (
      <div className={classes.root}>
        <TextField
          value={username}
          onChange={onUsernameChange}
          className={classes.input}
          placeholder={'username'}
          margin={'dense'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle/>
              </InputAdornment>
            ),
          }}/>
        <TextField
          value={password}
          onChange={onPasswordChange}
          className={classes.input}
          placeholder={'password'}
          type={'password'}
          margin={'dense'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKey/>
              </InputAdornment>
            ),
          }}/>
        <Button
          onClick={onLoginClick}
          color={'primary'}
          variant={'contained'}
          size={'small'}
          className={classes.btn}>
          Login
        </Button>
        <span className={classes.divider}/>
        <Button
          onClick={onGuestClick}
          color={'primary'}
          variant={'contained'}
          size={'small'}
          className={classes.btn}>
          Guest
        </Button>
        <span className={classes.divider}/>
        <Button
          onClick={onOpen}
          color={'primary'}
          variant={'contained'}
          size={'small'}
          className={classes.btn}>
          Register
        </Button>
        <RegisterDialog
          open={open}
          onClose={onClose}
          onSubmit={handleRegister}/>
      </div>
    );
  }
}

export default withStyles(styles)(LoginForm);