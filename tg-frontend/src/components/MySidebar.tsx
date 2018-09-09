import {
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  withStyles,
  WithStyles
} from '@material-ui/core';
import {BugReport, Dashboard, PlayArrow, Settings} from '@material-ui/icons';
import * as React from 'react';
import {Link} from 'react-router-dom';

const styles = () => createStyles({
  root: {},
});

const MySidebar: React.SFC<WithStyles<typeof styles>> = ({classes}) => (
  <div className={classes.root}>
    <List>
      <Link to={'/canvas'}>
        <ListItem button={true}>
          <ListItemIcon>
            <PlayArrow />
          </ListItemIcon>
          <ListItemText primary={'Play!'} />
        </ListItem>
      </Link>
      <Link to={'/debug'}>
        <ListItem button={true}>
          <ListItemIcon>
            <BugReport />
          </ListItemIcon>
          <ListItemText primary={'Debug Info'} />
        </ListItem>
      </Link>
      <Link to={'/all'}>
        <ListItem button={true}>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary={'All Games'} />
        </ListItem>
      </Link>
      <Link to={'/preferences'}>
        <ListItem button={true}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary={'Preferences'} />
        </ListItem>
      </Link>
      <Divider />
    </List>
  </div>
);

export default withStyles(styles)(MySidebar);
