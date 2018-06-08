import React from 'react';
import {
  Button,
  Grid, IconButton, Paper, TextField, Typography,
  withStyles,
} from '@material-ui/core';

const styles = (theme) => ({
  root: {},
  textField: {},
  card: {
    padding: 16,
  },
});

const Welcome = ({classes, x, y, width, height}) => {
  const style = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
    height: height,
  };

  return (
    <Grid container
          className={classes.root}
          style={style}
          direction={'column'}
          justify={'center'}
          alignItems={'center'}>
      <Grid item>
        <Paper elevation={4}
               className={classes.card}>
          <Typography variant="display1"
                      color={'blue'}>
            Welcome!
          </Typography>
          <TextField fullWidth
                     id="name"
                     label="name (optional)"
                     className={classes.textField}
                     margin="normal"
          />
          <Button fullWidth
                  variant={'contained'}
                  color={'primary'}>
            start playing
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(Welcome);
