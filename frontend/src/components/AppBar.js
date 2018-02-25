import {AppBar, Typography, withStyles} from 'material-ui';
import React from 'react';
import ReactDOM from 'react-dom';
const styles = (theme) => ({
  root: {
    padding: 16,
  },
});

/**
 * @class MyAppBar
 */
class MyAppBar extends React.Component {
  componentDidMount() {
    this.props.rootRef(ReactDOM.findDOMNode(this));
  }

  /**
   * @return {XML}
   */
  render() {
    const {classes} = this.props;
    return (
      <AppBar
        className={classes.root}
        color={'default'}
        position={'fixed'} >
        <Typography variant={'display1'}>
          <strong>TorusGo</strong>&nbsp;
          <small style={{fontSize: 16}}>Why not GO around?</small>
        </Typography>
      </AppBar>
    );
  }
}

export default withStyles(styles)(MyAppBar);
