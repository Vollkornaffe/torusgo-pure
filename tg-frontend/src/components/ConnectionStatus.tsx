import {withStyles} from '@material-ui/core';
import * as React from 'react';
import {EConnectionState, ELoginState} from '../types';

export interface IProps {
  loginState: ELoginState,
  connectionState: EConnectionState,
}

const style = () => ({
  root: {
    width: '100%',
    padding: 20,
  },
});

export default withStyles(style)<IProps>(({classes, connectionState, loginState}) => (
  <div className={classes.root}>
    <p>Connection status: <code>{connectionState}</code></p>
    <p>Login status: <code>{loginState}</code></p>
    <i>socket.io not actually implemented yet</i>
  </div>
));