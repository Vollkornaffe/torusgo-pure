import {AppBar, Typography, withStyles} from '@material-ui/core';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';

const APP_BAR_PADDING = 16;

const styles = (theme) => ({
  root: {
    padding: APP_BAR_PADDING,
  },
});


const MyAppBar = ({classes, handleResize}) => {
  const onResize = (width, height) => {
    handleResize(width + 2 * APP_BAR_PADDING, height + 2 * APP_BAR_PADDING);
  };

  return (
    <AppBar
      className={classes.root}
      color={'default'}
      position={'fixed'}>
      <ReactResizeDetector handleHeight onResize={onResize}/>
      <Typography variant={'display1'}>
        <strong>TorusGo</strong>&nbsp;
        <small style={{fontSize: 16}}>Why not GO around?</small>
      </Typography>
    </AppBar>
  );
};

export default withStyles(styles)(MyAppBar);
