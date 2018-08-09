import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  withStyles,
  WithStyles
} from '@material-ui/core/es';
import {AccountCircle} from '@material-ui/icons';
import * as React from 'react';
import {asyncLogout} from '../redux/async-actions';
import {EResourceStatus, IUserWrapper} from '../types/resource';
import {IUser} from '../types/user';

const styles = () => ({
  root: {},
});

export interface IProps extends WithStyles<typeof styles> {
  user?: IUserWrapper,
}

export interface IState {
  open: boolean,
}

class AccountDialog extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      open: false,
    }
  }

  public render() {

    const {classes, user} = this.props;
    const {open} = this.state;

    let content;

    if (!user) {
      content = (
        <p>
          User info not available
        </p>
      );
    } else if (user.status === EResourceStatus.Loading) {
      content = (
        <CircularProgress/>
      );
    } else if (user.status === EResourceStatus.Unavailable) {
      content = (
        <p>
          Error while loading user info: <br />
          {user.error}
        </p>
      );
    } else {
      const value = user.value as IUser;

      content = (
        <div>
          <p>id: {value.id}</p>
          <p>name: {value.name}</p>
          <p>rank: {value.rank}</p>
        </div>
      );
    }

    const onClose = () => this.setState({open: false});

    const onOpen = () => this.setState({open: true});

    const onLogoutClick = () => asyncLogout();

    return (
      <div>
        <Button onClick={onLogoutClick} color={'inherit'}>
          Logout
        </Button>
        <IconButton
          onClick={onOpen}
          color="inherit">
          <AccountCircle />
        </IconButton>
        <Dialog
          className={classes.root}
          open={open}
          onClose={onClose}>
          <DialogTitle>Your Account Information</DialogTitle>
          <DialogContent>
            {content}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(AccountDialog);