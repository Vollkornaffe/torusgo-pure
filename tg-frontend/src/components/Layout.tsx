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

const styles = (theme: Theme) => {
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
      height: theme.layout.appBarHeight,
    },
    drawer: {
      position: 'fixed',
    },
    drawerPaper: {
      whiteSpace: 'nowrap',
    },
    closedDrawerPaper: {
      overflowX: 'hidden',
      width: theme.layout.sideBarWidth,
    },
    content: {
      position: 'fixed',
      marginTop: theme.layout.appBarHeight,
      marginLeft: theme.layout.sideBarWidth,
      width: 'calc(100vw - ' + theme.layout.sideBarWidth + 'px)',
      height: 'calc(100vh - ' + theme.layout.appBarHeight + 'px)',
      flexGrow: 1,
      zIndex: -1,
      backgroundColor: theme.palette.background.default,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: theme.layout.appBarHeight,
      ...theme.mixins.toolbar,
    },
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
        <AppBar position={'fixed'} className={classes.appBar}>
          <MyToolbar />
        </AppBar>
        <Drawer variant={'permanent'} open={this.state.open}
                className={classes.drawer}
                onMouseEnter={this.handleDrawerOpen}
                onMouseLeave={this.handleDrawerClose} classes={{
          paper: classNames(classes.drawerPaper, !this.state.open && classes.closedDrawerPaper)
        }}>
          <div className={classes.toolbar} />
          <MySidebar />
        </Drawer>
        <div className={classes.content}>
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