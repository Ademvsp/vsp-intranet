import { Container, Grid } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import DashboardCard from './DashboardCard';
import SettingsIcon from '@material-ui/icons/Settings';
import dbPages from './pages';

const Dashboard = (props) => {
  const { authUser } = useSelector((state) => state.authState);
  const pages = [...dbPages];
  if (authUser.admin) {
    pages.push({
      name: 'Admin Panel',
      description: 'Make administrative changes to the Intranet.',
      icon: SettingsIcon,
      link: '/admin'
    });
  }
  return (
    <Container maxWidth='lg' disableGutters>
      <Grid container direction='row' spacing={2}>
        {pages.map((page) => (
          <Grid item key={page.name} xs={12} sm={6} md={4}>
            <DashboardCard page={page} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
