import React from 'react';
import {Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions} from 'material-ui';

export default class SignupFormDialog extends React.Component {
  state = {
    open: false,
    username: "",
    password: "",
    email: "",
  };

  handleClickOpen = () => {
    this.setState({
      open: true,
      username: "",
      password: "",
      email: "",
    });
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
  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  handleSubmit = (signupFunction) => {
    return () => {
      signupFunction(this.state.username, this.state.password, this.state.email);
      this.handleClose();
    }
  };

  render() {
    const {signupFunction} = this.props;
    return (
      <div>
        <Button onClick={this.handleClickOpen}>Signup</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='signup-form-dialog-title'
        >
          <DialogTitle id='signup-form-dialog-title'>Signup</DialogTitle>
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
            <TextField
              onChange={this.handleEmailChange}
              margin='dense'
              id='email'
              label='email'
              type='text'
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSubmit(signupFunction)}>
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
