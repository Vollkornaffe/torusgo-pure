import {WithStyles, withStyles}         from '@material-ui/core';
import * as React                       from 'react';
import {EConnectionStatus, ELoginState} from '../types/network';

const style = () => ({
  root: {},
});

export interface IProps {
  loginState: ELoginState,
  connectionState: EConnectionStatus,
}

const Status: React.SFC<IProps & WithStyles<typeof style>> = ({classes, connectionState, loginState}) => (
  <div className={classes && classes.root}>
    <p>Connection status: <code>{connectionState}</code></p>
    <p>Login status: <code>{loginState}</code></p>
  </div>
);

export default withStyles(style)(Status);