import {
  AppBar, Button, InputAdornment, TextField, Toolbar, Typography, withStyles
} from '@material-ui/core';

import {AccountCircle, VpnKey} from '@material-ui/icons';
import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';

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
});


const loginStyles = () => ({
  root: {
    minWidth: 550,
  },
  input: {
    margin: 8,
  },
  btn: {
    marginTop: -14,
  },
});

const LoginForm = withStyles(loginStyles)(({classes}) => (
  <div className={classes.root}>
    <TextField
      className={classes.input}
      placeholder={'username'}
      margin={'dense'}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AccountCircle/>
          </InputAdornment>
        ),
      }}/>
    <TextField
      className={classes.input}
      placeholder={'password'}
      type={'password'}
      margin={'dense'}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <VpnKey/>
          </InputAdornment>
        ),
      }}/>
    <Button color={'primary'}
            variant={'contained'}
            size={'small'}
            className={classes.btn}>
      Login
    </Button>
  </div>
));

export interface IAppBarProps {
  handleResize: (width: number, height: number) => void,
}

export default withStyles(styles)<IAppBarProps>(({classes, handleResize}) => {
  const onResize = (width: number, height: number) => {
    handleResize(width + 2 * APP_BAR_PADDING, height + 2 * APP_BAR_PADDING);
  };

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
        <LoginForm/>
      </Toolbar>
    </AppBar>
  );
});
