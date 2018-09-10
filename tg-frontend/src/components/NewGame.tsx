import {Button, Grid, Paper} from '@material-ui/core';
import * as React from 'react';

class NewGame extends React.Component {
  public render() {
    return <div>
      <Grid container={true} justify={'center'}>
        <Grid item={true}>
          <Paper>
            <h3>
              Local Game </h3>
            <p>
              Play a game on your local machine </p>
            <Button variant={'raised'} color={'primary'}>
              Play
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>;
  }
}

export default NewGame;