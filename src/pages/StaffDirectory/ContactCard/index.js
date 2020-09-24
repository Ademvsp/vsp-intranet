import React from 'react';
import { CardContent, Grid, Typography } from '@material-ui/core';
import { StyledPaper } from './styled-components';
import { StyledLink } from '../styled-components';
import Avatar from '../../../components/Avatar';

const ContactCard = (props) => {
	const { user } = props;
	const fullName = `${user.firstName} ${user.lastName}`;
	return (
		<StyledPaper variant='outlined'>
			<CardContent>
				<Grid container direction='row' spacing={2} wrap='nowrap'>
					<Grid item>
						<Avatar
							user={user}
							size={3}
							iconFallback={true}
							variant='rounded'
						/>
					</Grid>
					<Grid item container direction='column'>
						<Grid item>
							<Typography component='h5' variant='h5'>
								{fullName}
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant='subtitle1' color='textSecondary'>
								{user.title}
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant='body2'>
								<StyledLink href={`mailto:${user.email}`}>
									{user.email}
								</StyledLink>
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant='body2'>
								Phone:{' '}
								<StyledLink href={`tel:${user.phone}`}>{user.phone}</StyledLink>
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant='body2'>
								Extension:{' '}
								<StyledLink href={`tel:${user.extension}`}>
									{user.extension}
								</StyledLink>
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</CardContent>
		</StyledPaper>
	);
};

export default ContactCard;
