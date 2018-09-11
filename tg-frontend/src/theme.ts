import {createMuiTheme} from '@material-ui/core/styles';
import './types/theme';

const UNIT = 8;

// modify the default theme
// see https://material-ui.com/customization/themes/
//
// current theme:
//
const theme = createMuiTheme({

  // default overrides
  palette: {
    primary: {
      main: '#263238',
    },
    secondary: {
      main: '#ff6d00',
    },
  },
  spacing: {
    unit: UNIT,
  },

  // custom parameters
  layout: {
    appBarHeight: 8 * UNIT,
    sideBarWidth: 9 * UNIT,
  }
});

export default theme;