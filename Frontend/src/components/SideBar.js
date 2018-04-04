import {
  Button, Divider, Drawer, ExpansionPanel, ExpansionPanelDetails,
  ExpansionPanelSummary, Grid, withStyles,
} from 'material-ui';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import GameInfoTable from './GameInfoTable';
import {convertState} from 'torusgo-logic';

const SIDE_BAR_PADDING = 20;

const styles = (theme) => ({
  fullHeight: {
    height: '100%',
  },
  paper: {
    padding: SIDE_BAR_PADDING,
  },
  black: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  white: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  root: {
  },
});

const MyGameItem = ({game, black, white, classes, handleView}) => {
  const state = convertState(game.details.currentState);
  const whiteToMove = state.curCol - 1; // so hacky, cmon this isn't C
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        className={whiteToMove ? classes.white : classes.black}>
        {black.name} vs {white.name}: Move {state.moveNum}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <GameInfoTable
          handleView={handleView}
          players={{black: black.name, white: white.name}}
          clientColor={'Black'}
          times={{black: 0, white: 0}}
          inTurn={whiteToMove ? 'White' : 'Black'}
          captures={{
            black: state.bPrison,
            white: state.wPrison,
          }}
          score={{black: 0, white: 0}}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const MyBoxButton = ({children, ...other}) => {
  return (
    <Button
      fullWidth
      color={'primary'}
      variant={'raised'}
      {...other}>
      {children}
    </Button>
  );
};

const SideBar = (props) => {
  const {
    users, games, handleSwitch, handleResize, handleNewGame, classes,
  } = props;

  const onResize = (width, height) => {
    handleResize(width + 2 * SIDE_BAR_PADDING, height + 2 * SIDE_BAR_PADDING);
  };

  return (
    <Drawer
      classes={{paper: classes.paper}}
      variant={'permanent'}
      anchor={'right'}>
      <ReactResizeDetector handleWidth onResize={onResize}/>
      <Grid
        container
        wrap={'nowrap'}
        className={classes.fullHeight}
        direction={'column'}
        spacing={16}
        justify={'flex-start'}
        alignContent={'center'}
        alignItems={'stretch'}>
        <Grid item>
          <MyBoxButton onClick={handleNewGame}>
            Start a new Game
          </MyBoxButton>
        </Grid>
        <Divider/>
        <Grid item>
          <Grid
            container
            direction={'column'}
            justify={'flex-start'}>
            {
              games.map((game, i) => (
                <Grid item key={i}>
                  <MyGameItem
                    classes={classes}
                    handleView={() => handleSwitch(game.id)}
                    black={users.filter((u) => u.id === game.meta.blackId)[0]}
                    white={users.filter((u) => u.id === game.meta.whiteId)[0]}
                    game={game}/>
                </Grid>
              ))
            }
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default withStyles(styles)(SideBar);
