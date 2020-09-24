import {
	CircularProgress,
	Container,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as projectsController from '../../controllers/project';
import Project from '../../models/project';
const columns = [
	{
		id: 'name',
		label: 'Name'
	},
	{
		id: 'customer',
		label: 'Customer'
	},
	{
		id: 'vendors',
		label: 'Vendors'
	},
	{
		id: 'status',
		label: 'Status'
	},
	{
		id: 'value',
		label: 'Estimated Value'
	}
];
const rowsPerPageOptions = [5, 10, 25, 100];

const Projects = (props) => {
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
	const { authUser } = useSelector((state) => state.authState);
	const { users, usersCounter } = useSelector((state) => state.dataState);
	const [projects, setProjects] = useState();

	useEffect(() => {
		let projectsListener;
		if (usersCounter && users) {
			if (users.length === usersCounter.count) {
				projectsListener = projectsController
					.getListener(authUser.userId)
					.onSnapshot((snapshot) => {
						const newProjects = snapshot.docs.map((doc) => {
							const owners = doc
								.data()
								.owners.map((owner) =>
									users.find((user) => user.userId === owner)
								);
							return new Project({
								...doc.data(),
								projectId: doc.id,
								owners: owners
							});
						});
						setProjects(newProjects);
					});
			}
		}
		return () => {
			if (projectsListener) {
				projectsListener();
			}
		};
	}, [authUser.userId, users, usersCounter]);

	console.log('projects', projects);
	if (!projects) {
		return <CircularProgress />;
	}

	const start = page * rowsPerPage;
	const end = start + rowsPerPage;
	const rows = projects.slice(start, end);

	return (
		<Container disableGutters maxWidth='lg'>
			<Paper elevation={6}>
				<TableContainer>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								{columns.map((column) => (
									<TableCell key={column.id}>{column.label}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((project) => (
								<TableRow
									key={project.projectId}
									hover
									style={{ cursor: 'pointer' }}
								>
									<TableCell>{project.name}</TableCell>
									<TableCell>{project.customer}</TableCell>
									<TableCell>{project.vendors.join(', ')}</TableCell>
									<TableCell>{project.status}</TableCell>
									<TableCell align='right'>{project.value}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={rowsPerPageOptions}
					component='div'
					count={projects.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onChangePage={(event, newPage) => setPage(newPage)}
					onChangeRowsPerPage={(event) => {
						setRowsPerPage(+event.target.value);
						setPage(0);
					}}
				/>
			</Paper>
		</Container>
	);
};

export default Projects;
