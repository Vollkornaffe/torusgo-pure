import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  withStyles,
  WithStyles,
}                      from '@material-ui/core/es';
import * as React      from 'react';
import {asyncRegister} from '../redux/async-actions';

const styles = () => ({
  root: {},
  btn: {
    marginTop: -14,
  },
});

interface IProps extends WithStyles<typeof styles> {
  onClose: () => void,
  open: boolean,
}

interface IState {
  username: string,
  password: string,
  email: string,
}

class RegisterDialog extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
    }
  }

  public render() {

    const {onClose, classes, open} = this.props;

    const {username, email, password} = this.state;

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

    const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        ...this.state,
        email: event.target.value,
      });
    };

    const onSubmitClick = () => {
      asyncRegister(username, email, password);
    };

    return (
      <div>
        <Dialog className={classes.root} open={open} onClose={onClose}>
          <DialogTitle>Register for an Account</DialogTitle>
          <DialogContent>
            <TextField value={username} autoFocus={true}
                       onChange={onUsernameChange} margin='dense'
                       label='username' type='text' fullWidth={true} />
            <TextField value={email} onChange={onEmailChange} margin='dense'
                       label='email' type='email' fullWidth={true} />
            <TextField value={password} onChange={onPasswordChange}
                       margin='dense' label='password' type='password'
                       fullWidth={true} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onSubmitClick}>
              Register
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(RegisterDialog);