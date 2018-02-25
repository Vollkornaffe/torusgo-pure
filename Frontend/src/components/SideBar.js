import {
  Button, Divider, Drawer, ExpansionPanel, ExpansionPanelDetails,
  ExpansionPanelSummary, Grid, withStyles,
} from 'material-ui';
import React from 'react';
import ReactDOM from 'react-dom';
import GameInfoTable from './GameInfoTable';

const styles = (theme) => ({
  fullHeight: {
    height: '100%',
  },
  paper: {
    /* top: 64,
    height: 'calc(100% - 64px)', */
    padding: 20,
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

/**
 * @param {props} props
 * @return {XML}
 * @constructor
 */
function MyGameItem(props) {
  const {game, black, white, classes, handleOpen} = props;

  const whiteToMove = game.getState().getMovingColor() - 1;

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary className={whiteToMove ? classes.white: classes.black}>
        {black.name} vs {white.name}: Move {game.getState().getMoveNumber()}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <GameInfoTable
          handleOpen={handleOpen}
          players={{black: black.name, white: white.name}}
          clientColor={'Black'}
          times={{black: game.black.time, white: game.white.time}}
          inTurn={whiteToMove ? 'White' : 'Black'}
          captures={{
            black: game.getState().getBlackPrisoners(),
            white: game.getState().getWhitePrisoners(),
          }}
          score={{black: 0, white: 0}}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

/**
 * @param {props} props
 * @return {XML}
 * @constructor
 */
function MyBoxButton(props) {
  return (
    <Button
      fullWidth
      color={'primary'}
      variant={'raised'}>
      {props.children}
    </Button>
  );
}

/**
 * @class SideBar
 */
class SideBar extends React.Component {
  /**
   */
  componentDidMount() {
    this.props.rootRef(ReactDOM.findDOMNode(this).children[0]);
  }
  /**
   * @return {XML}
   */
  render() {
    const {users, games, classes, handleSwitch} = this.props;

    const handler = (index) => () => handleSwitch(index);

    return (
      <Drawer
        classes={{paper: classes.paper}}
        variant={'permanent'}
        anchor={'right'}>
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
            <MyBoxButton>
              Find Opponent
            </MyBoxButton>
          </Grid>
          <Grid item>
            <MyBoxButton>
              Offline Game
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
                      handleOpen={handler(i)}
                      black={users.filter((u) => u.id === game.black.id)[0]}
                      white={users.filter((u) => u.id === game.white.id)[0]}
                      game={game}/>
                  </Grid>
                ))
              }
            </Grid>
          </Grid>
        </Grid>
      </Drawer>
    );
  }
}

export default withStyles(styles)(SideBar);
