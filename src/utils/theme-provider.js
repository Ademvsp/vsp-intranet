import React from 'react';
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  withTheme
} from '@material-ui/core/styles';
import colors from './colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useSelector } from 'react-redux';
import { LIGHT, DARK } from './constants';

const ThemeProvider = withTheme((props) => {
  const { authUser } = useSelector((state) => state.authState);
  let type = LIGHT;
  if (authUser?.settings?.darkMode) {
    type = DARK;
  }
  const theme = createMuiTheme({
    palette: {
      type: type,
      primary: colors.primary,
      secondary: colors.secondary
    },
    overrides: {
      MuiPaper: {
        rounded: {
          borderRadius: `${props.theme.spacing(1)}px`
        }
      },
      MuiButton: {
        root: {
          borderRadius: `${props.theme.spacing(4)}px`
        }
      },
      MuiButtonBase: {
        root: {
          borderRadius: `${props.theme.spacing(4)}px`
        }
      },
      MuiDialogContent: {
        root: {
          overflowY: 'hidden'
        }
      }
    }
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline>{props.children}</CssBaseline>
    </MuiThemeProvider>
  );
});

export default ThemeProvider;
