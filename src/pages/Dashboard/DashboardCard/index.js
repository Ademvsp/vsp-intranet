import {
	Card,
	CardContent,
	CardHeader,
	Grid,
	Typography
} from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { StyledIcon } from './styled-components';

const DashboardCard = (props) => {
	const { push } = useHistory();
	const [raised, setRaised] = useState(false);
	const { page } = props;
	return (
		<Card
			style={{ cursor: 'pointer', height: 200 }}
			raised={raised}
			onMouseEnter={() => setRaised(true)}
			onMouseLeave={() => setRaised(false)}
			onClick={() => push(page.link)}
		>
			<CardHeader
				title={
					<Grid container spacing={1} alignItems='center'>
						<Grid item>
							<StyledIcon>
								<page.icon />
							</StyledIcon>
						</Grid>
						<Grid item>{page.name}</Grid>
					</Grid>
				}
			/>
			<CardContent>
				<Typography>{page.description}</Typography>
			</CardContent>
		</Card>
	);
};

export default DashboardCard;
