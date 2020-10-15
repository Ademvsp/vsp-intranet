/* eslint-disable react/display-name */
import {
	Container,
	Button,
	Dialog,
	DialogContent,
	Typography
} from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as projectsController from '../../controllers/project';
import Project from '../../models/project';
import MaterialTable from 'material-table';
import projectStatusTypes from '../../utils/project-status-types';
import columnSchema from './column-schema';
import tableColumns from './table-icons';
import AddIcon from '@material-ui/icons/Add';
import { useHistory, useParams } from 'react-router-dom';

const Projects = (props) => {
	const history = useHistory();
	const { push, location } = history;
	const params = useParams();
	const { authUser } = useSelector((state) => state.authState);
	const { users, usersCounter } = useSelector((state) => state.dataState);
	const [projects, setProjects] = useState();
	const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

	console.log(location.pathname);
	useEffect(() => {
		console.log(params);
	}, [params]);

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

	// if (!projects) {
	// 	return <CircularProgress />;
	// }

	const newProjectOpenHandler = () => {
		setShowNewProjectDialog(true);
	};

	const newProjectCloseHandler = () => {
		setShowNewProjectDialog(false);
	};

	const rowClickHandler = (event, rowData) => {
		push(`/projects/${rowData.projectId}`);
	};

	let data = [];
	if (projects) {
		data = projects.map((project) => {
			const status = projectStatusTypes.find(
				(projectStatusType) => projectStatusType.statusId === project.status
			);
			const vendors = project.vendors.join(', ');
			return {
				...project,
				createdAt: project.metadata.createdAt.toDate(),
				vendors: vendors,
				status: status
			};
		});
	}

	return (
		<Fragment>
			<Dialog open={showNewProjectDialog} onClose={newProjectCloseHandler}>
				<DialogContent>
					<Typography>Hello</Typography>
				</DialogContent>
			</Dialog>
			<Container disableGutters maxWidth='lg' style={{ height: 500 }}>
				<MaterialTable
					isLoading={!projects}
					icons={tableColumns}
					title={
						<Button variant='contained' color='primary' fullWidth>
							Add Project
						</Button>
					}
					columns={columnSchema}
					data={data}
					options={{
						paginationType: 'normal',
						minBodyHeight: window.innerHeight / 1.5,
						maxBodyHeight: window.innerHeight / 1.5,
						pageSize: 10,
						pageSizeOptions: [10, 20, 50, 100]
					}}
					actions={[
						{
							icon: AddIcon,
							tooltip: 'Add Project',
							isFreeAction: true,
							onClick: newProjectOpenHandler
						}
					]}
					onRowClick={rowClickHandler}
				/>
			</Container>
		</Fragment>
	);
};

export default Projects;
