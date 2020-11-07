import React, { useContext } from 'react';
import {
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Tooltip,
  withTheme
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import NavbarAvatar from './NavbarAvatar';
import NotificationsPopover from './NotificationsPopover';
import { SideDrawerContext } from '../AppContainer';
import DarkModeIcon from './DarkModeIcon';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from './HomeIcon';

const Navbar = withTheme((props) => {
  const { setDrawerOpen } = useContext(SideDrawerContext);
  const { authUser } = useSelector((state) => state.authState);
  const menuButtonSize = `${props.theme.spacing(6)}px`;

  return (
    <AppBar position='sticky'>
      <Toolbar style={{ minHeight: `${props.theme.spacing(10.5)}px` }}>
        {authUser && (
          <Grid
            container
            justify='space-between'
            alignItems='center'
            wrap='nowrap'
          >
            <Grid item>
              <Tooltip title='Menu'>
                <IconButton
                  edge='start'
                  color='inherit'
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon style={{ fontSize: menuButtonSize }} />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid
              item
              container
              justify='flex-end'
              alignItems='center'
              spacing={2}
              wrap='nowrap'
            >
              <Grid item container justify='flex-end' wrap='nowrap'>
                <Grid item>
                  <HomeIcon />
                </Grid>
                <Grid item>
                  <DarkModeIcon />
                </Grid>
                <Grid item>
                  <NotificationsPopover />
                </Grid>
              </Grid>
              <Grid item>
                <NavbarAvatar authUser={authUser} />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;
