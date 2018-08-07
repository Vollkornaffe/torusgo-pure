import {
  AppBar,
  CircularProgress,
  Toolbar,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core/es';
import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {resizeAppBar} from '../redux/actions';
import {EConnectionStatus, ELoginState} from '../types/network';
import {IUserWrapper} from '../types/resource';
import AccountDialog from './AccountDialog';
import LoginForm from './LoginForm';

const APP_BAR_PADDING = 0;

const styles = () => ({
  root: {
    flexGrow: 1,
    padding: APP_BAR_PADDING,
    overflow: 'auto',
    zIndex: 1250,
  },
  flex: {
    flex: 1,
  },
  progress: {}
});

export interface IProps {
  connectionStatus: EConnectionStatus,
  loginState: ELoginState,
  user?: IUserWrapper,
}

const MyAppBar: React.SFC<IProps & WithStyles<typeof styles>> = ({connectionStatus, loginState, user, classes}) => {

  const onResize = (width: number, height: number) => {
    resizeAppBar(width + 2 * APP_BAR_PADDING, height + 2 * APP_BAR_PADDING);
  };

  let rightSideComponent: JSX.Element;

  if (connectionStatus === EConnectionStatus.Disconnected) {
    rightSideComponent = <p>disconnected</p>;
  } else if (connectionStatus === EConnectionStatus.Connecting) {
    rightSideComponent = (
      <div>
        <CircularProgress className={classes.progress}/>
        <span>Reconnecting...</span>
      </div>
    );
  } else if (loginState === ELoginState.Undefined) {
    rightSideComponent = <LoginForm/>;
  } else {
    rightSideComponent = (<AccountDialog user={user}/>);
  }

  return (
    <AppBar
      className={classes.root}
      color={'default'}
      position={'fixed'}>
      <ReactResizeDetector
        handleHeight={true}
        onResize={onResize}/>
      <Toolbar>
        <Typography
          color={'inherit'}
          variant={'title'}
          className={classes.flex}>
          TorusGo
        </Typography>
        {rightSideComponent}
      </Toolbar>
    </AppBar>
  );
};

export default withStyles(styles)(MyAppBar);