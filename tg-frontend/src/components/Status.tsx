import {withStyles} from '@material-ui/core';
import * as React from 'react';
import {EConnectionStatus, ELoginState} from '../types';

export interface IProps {
  loginState: ELoginState,
  connectionState: EConnectionStatus,
  classes: any,
}

const style = () => ({
  root: {
    width: '100%',
    padding: 20,
  },
});

class Status extends React.Component<IProps, {}> {

  public render() {
    const {classes, connectionState, loginState} = this.props;

    return (
      <div className={classes && classes.root}>
        <p>Connection status: <code>{connectionState}</code></p>
        <p>Login status: <code>{loginState}</code></p>

        <i>socket.io implemented, but not bound to UI yet</i>
      </div>
    );
  }
}

export default withStyles(style)(Status);