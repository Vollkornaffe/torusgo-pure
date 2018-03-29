import React from 'react';
import {Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions} from 'material-ui';

export default class LoginFormDialog extends React.Component {
  state = {
    open: false,
    username: "",
    password: ""
  };

  handleClickOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value });
  };
  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = (loginFunction) => {
    return () => {
      loginFunction(this.state.username, this.state.password);
      this.handleClose();
    }
  };

  render() {
    const {loginFunction} = this.props;
    return (
      <div>
        <Button onClick={this.handleClickOpen}>Login</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='login-form-dialog-title'
        >
          <DialogTitle id='login-form-dialog-title'>Login</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              onChange={this.handleUsernameChange}
              margin='dense'
              id='username'
              label='username'
              type='text'
              fullWidth
            />
            <TextField
              onChange={this.handlePasswordChange}
              margin='dense'
              id='password'
              label='password'
              type='text'
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSubmit(loginFunction)}>
              Submit
            </Button>
            <Button onClick={this.handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
