import {
  Button, CircularProgress,
  Dialog, DialogActions,
  DialogContent,
  DialogTitle, IconButton, TextField, Typography, withStyles,
  WithStyles
} from '@material-ui/core/es';
import {AccountCircle} from '@material-ui/icons';
import * as React from 'react';
import {IError} from '../types';

const styles = () => ({
  root: {},
});

export interface IProps extends WithStyles<typeof styles> {
  user: TSubscribe<IUser>,
  handleLogout: () => void,
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

    const {classes, user, handleLogout} = this.props;
    const {open} = this.state;

    let content;

    function isError (asd: TSubscribe<IUser>): asd is IError {
      return asd ? (asd as IError).error !== undefined : false;
    }

    if (!user) {
      content = (
        <p>
          User info not available
        </p>
      );
    } else if(user === 'waiting') {
      content = (
        <CircularProgress/>
      );
    } else if(isError(user)) {
      content = (
        <p>
          Error while loading user info: <br />
          {user.message}
        </p>
      );
    } else {
      content = (
        <div>
          <p>id: {user.id}</p>
          <p>name: {user.name}</p>
          <p>rank: {user.rank}</p>
        </div>
      );
    }

    const onClose = () => {
      this.setState({open: false});
    };

    const onOpen = () => {
      this.setState({open: true});
    };

    return (
      <div>
        <Button
          onClick={handleLogout}
          color={'default'}>
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