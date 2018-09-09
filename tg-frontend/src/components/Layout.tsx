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

import {resizeAppBar, resizeSidebar} from "../redux/actions";

import store from "../redux/store";

const styles = (theme: Theme) => {
  const closedDrawerWidth = theme.spacing.unit * 9;
  const appBarHeight = theme.spacing.unit * 7;
  // not quite sure if it is a good idea to dispatch here.. gives this function side effects
  // also passing 0 here bc. I don't know any better
  store.dispatch(resizeSidebar(closedDrawerWidth, 0));
  store.dispatch(resizeAppBar(0, appBarHeight));
  return createStyles({
    root: {
      flexGrow: 1,
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      height: appBarHeight,
    },
    drawer: {
      position: 'relative',
      whiteSpace: 'nowrap',
      // width: 240,
    },
    closedDrawer: {
      overflowX: 'hidden',
      width: closedDrawerWidth,
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      height: appBarHeight,
    }
  });
};

class Layout extends React.Component<WithStyles<typeof styles>> {
  public state = {
    open: false,
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

  private handleDrawerOpen = () => {
    this.setState({open: true});
  };
  
  private handleDrawerClose = () => {
    this.setState({open: false});
  };

}

export default withStyles(styles)(Layout);