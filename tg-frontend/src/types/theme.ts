import {Theme, ThemeOptions} from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {

  interface Theme {
    layout: {
      appBarHeight: number,
      sideBarWidth: number,
    },
  }

  interface ThemeOptions {
    layout: {
      appBarHeight: number,
      sideBarWidth: number,
    },
  }
}