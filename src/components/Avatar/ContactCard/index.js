import React from 'react';
import { CardContent, Typography } from '@material-ui/core';
import {
	StyledInnerContainer,
	StyledCard,
	StyledLink
} from './styled-components';
import Avatar from '..';

const ContactCard = (props) => {
	const { user } = props;
	const fullName = `${user.firstName} ${user.lastName}`;
	return (
		<StyledCard>
			<StyledInnerContainer>
				<CardContent>
					<Avatar user={user} size={2} iconFallback={true} variant='rounded' />
				</CardContent>
			</StyledInnerContainer>
			<StyledInnerContainer>
				<CardContent>
					<Typography component='h5' variant='h5'>
						{fullName}
					</Typography>
					<Typography variant='subtitle1' color='textSecondary'>
						{user.title}
					</Typography>
					<Typography variant='body2'>
						<StyledLink href={`mailto:${user.email}`}>{user.email}</StyledLink>
					</Typography>
					<Typography variant='body2'>
						Phone:{' '}
						<StyledLink href={`tel:${user.phone}`}>{user.phone}</StyledLink>
					</Typography>
					<Typography variant='body2'>
						Extension:{' '}
						<StyledLink href={`tel:${user.extension}`}>
							{user.extension}
						</StyledLink>
					</Typography>
				</CardContent>
			</StyledInnerContainer>
		</StyledCard>
	);
};

export default ContactCard;
