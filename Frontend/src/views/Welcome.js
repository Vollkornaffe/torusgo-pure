import React from 'react';
import {
  Button,
  Grid, IconButton, Paper, TextField, Typography,
  withStyles,
} from '@material-ui/core';

const styles = (theme) => ({
  root: {},
  textField: {},
  gridContainer: {
    width: '100%',
    height: '100%',
  },
  gridItem: {
    padding: 8,
  },
  paper: {
    padding: 16,
  },
});

const Welcome = ({classes, x, y, width, height}) => (
  <div className={classes.root} style={{
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
  }}>
    <Grid container justify={'center'}>
      <Grid item className={classes.gridItem}>
        <Paper elevation={4} className={classes.paper}>
          <Button>
            Try it Offline
          </Button>
        </Paper>
      </Grid>
    </Grid>
  </div>
);

export default withStyles(styles)(Welcome);
