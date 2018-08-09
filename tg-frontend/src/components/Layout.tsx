import {
  AppBar,
  createStyles,
  Drawer,
  Theme,
  withStyles,
  WithStyles
} from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import autoBind from 'react-autobind';
import MySidebar from './MySidebar';
import MyToolbar from './MyToolbarContainer';

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    position: 'relative',
    whiteSpace: 'nowrap',
    // width: 240,
  },
  closedDrawer: {
    overflowX: 'hidden',
    width: theme.spacing.unit * 9,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  }
});

class Layout extends React.Component<WithStyles<typeof styles>> {
  public state = {
    open: false,
  };
  private handleDrawerOpen = () => {
    this.setState({open: true});
  };
  private handleDrawerClose = () => {
    this.setState({open: false});
  };

  constructor(props: WithStyles<typeof styles>) {
    super(props);
    autoBind(this);
  }

  public render() {
    const {classes, children} = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classes.appBar}>
          <MyToolbar />
        </AppBar>
        <Drawer variant={'permanent'} open={this.state.open} classes={{
          paper: classNames(classes.drawer, !this.state.open && classes.closedDrawer)
        }}>
          <div className={classes.toolbar} />
          <div onMouseEnter={this.handleDrawerOpen}
               onMouseLeave={this.handleDrawerClose}>
            <MySidebar />
          </div>
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          {children}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Layout);