import {createStyles, Theme} from '@material-ui/core';
import {
  Button,
  InputAdornment,
  TextField,
  WithStyles,
  withStyles,
}                            from '@material-ui/core/es/index';
import {
  AccountCircle,
  VpnKey,
}                            from '@material-ui/icons';
import * as React            from 'react';
import {
  asyncLoginAsGuest,
  asyncLoginWithCredentials,
}                            from '../redux/async-actions';
import RegisterDialog        from './RegisterDialog';

const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: 550,
  },
  input: {
    margin: 8,
  },
  inputElem: {
    color: theme.palette.primary.contrastText,
  },
  btn: {
    marginTop: -14,
    marginLeft: 10,
  },
  divider: {
    borderRight: '0.1em solid black',
    padding: 5,
    paddingTop: -14,
  },
});

interface IState {
  username: string,
  password: string,
  open: boolean,
}

class LoginForm extends React.Component<WithStyles<typeof styles>, IState> {
  constructor(props: WithStyles<typeof styles>) {
    super(props);
    this.state = {
      username: '',
      password: '',
      open: false,
    }
  }

  public render() {
    const {classes} = this.props;

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

    const onLoginClick = () => asyncLoginWithCredentials(this.state.username, this.state.password);

    const onGuestClick = () => asyncLoginAsGuest();

    const onClose = () => {
      this.setState({open: false});
    };

    const onOpen = () => {
      this.setState({open: true});
    };

    return (
      <div className={classes.root}>
        <TextField value={username} onChange={onUsernameChange}
                   className={classes.input} placeholder={'username'}
                   margin={'dense'} InputProps={{
          className: classes.inputElem,
          startAdornment: (
            <InputAdornment position={'start'}>
              <AccountCircle />
            </InputAdornment>
          ),
        }} />
        <TextField value={password} onChange={onPasswordChange}
                   className={classes.input} placeholder={'password'}
                   type={'password'} margin={'dense'} InputProps={{
          className: classes.inputElem,
          startAdornment: (
            <InputAdornment position={'start'}>
              <VpnKey />
            </InputAdornment>
          ),
        }} />
        <Button onClick={onLoginClick} color={'default'} variant={'contained'}
                size={'small'} className={classes.btn}>
          Login
        </Button>
        <span className={classes.divider} />
        <Button onClick={onGuestClick} color={'default'} variant={'contained'}
                size={'small'} className={classes.btn}>
          Guest
        </Button>
        <span className={classes.divider} />
        <Button onClick={onOpen} color={'default'} variant={'contained'}
                size={'small'} className={classes.btn}>
          Register
        </Button>
        <RegisterDialog open={open} onClose={onClose} />
      </div>
    );
  }
}

export default withStyles(styles)(LoginForm);