import React, { Fragment } from 'react';
import { ListItemText, Typography } from '@material-ui/core';
import moment from 'moment';
import { StyledListItem } from './styled-components';
import { withRouter } from 'react-router-dom';

const NotificationItem = withRouter((props) => {
	const { page, subject, link, createdAt } = props.notification;
	return (
		<StyledListItem
			onClick={() => {
				if (link) {
					props.history.push(link);
				}
				props.closePopover();
			}}
			firstElement={props.firstElement}
		>
			<ListItemText
				primary={page}
				secondary={
					<Fragment>
						<Typography component='span' variant='body2' color='textPrimary'>
							{subject}
						</Typography>
						<br />
						{moment(createdAt.toDate()).format('llll')}
					</Fragment>
				}
			/>
		</StyledListItem>
	);
});

export default NotificationItem;
