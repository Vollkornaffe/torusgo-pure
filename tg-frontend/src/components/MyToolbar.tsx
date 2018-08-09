import {
  CircularProgress,
  Toolbar,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core/es';
import * as React from 'react';
import {EConnectionStatus, ELoginState} from '../types/network';
import {IUserWrapper} from '../types/resource';
import AccountDialog from './AccountDialog';
import LoginForm from './LoginForm';

const styles = () => ({
  flex: {
    flex: 1,
  },
});

export interface IProps {
  connectionStatus: EConnectionStatus,
  loginState: ELoginState,
  user?: IUserWrapper,
}

const MyToolbar: React.SFC<IProps & WithStyles<typeof styles>> = ({connectionStatus, loginState, user, classes}) => {

  let rightSideComponent: JSX.Element;

  if (connectionStatus === EConnectionStatus.Disconnected) {
    rightSideComponent = <p>disconnected</p>;
  } else if (connectionStatus === EConnectionStatus.Connecting) {
    rightSideComponent = <CircularProgress color={'secondary'} />;
  } else if (loginState === ELoginState.Undefined) {
    rightSideComponent = <LoginForm/>;
  } else {
    rightSideComponent = <AccountDialog user={user} />;
  }

  return (
    <Toolbar>
      <Typography color={'inherit'} variant={'title'} className={classes.flex}>
        TorusGo
      </Typography>
      {rightSideComponent}
    </Toolbar>
  );
};

export default withStyles(styles)(MyToolbar);