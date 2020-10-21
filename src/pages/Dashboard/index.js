import { Container, Grid } from '@material-ui/core';
import React from 'react';
import DashboardCard from './DashboardCard';
import pages from './pages';

const Dashboard = (props) => {
	return (
		<Container maxWidth='lg'>
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
