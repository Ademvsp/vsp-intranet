import { Chip, Popover, Typography, withTheme } from '@material-ui/core';
import React, { Fragment, useState } from 'react';
import { APPROVED, REJECTED, REQUESTED } from '../../utils/constants';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Avatar from '../Avatar';
import { format } from 'date-fns';
import { LONG_DATE_TIME } from '../../utils/date';
import { useSelector } from 'react-redux';

const ActionStatusChip = withTheme((props) => {
	const { users } = useSelector((state) => state.dataState);
	const { action } = props;
	const actionUser = users.find((user) => user.userId === action.actionedBy);
	const [anchorEl, setAnchorEl] = useState(null);

	let ChipIcon;

	switch (action.actionType) {
		case REQUESTED:
			ChipIcon = ErrorOutlineIcon;
			break;
		case REJECTED:
			ChipIcon = ThumbDownAltIcon;
			break;
		case APPROVED:
			ChipIcon = ThumbUpAltIcon;
			break;
		default:
			break;
	}

	return (
		<Fragment>
			<Chip
				color='secondary'
				variant='outlined'
				avatar={<Avatar user={actionUser} contactCard clickable />}
				label={action.actionType}
				deleteIcon={<ChipIcon />}
				onDelete={(event) => setAnchorEl(event.currentTarget)}
			/>

			<Popover
				anchorEl={anchorEl}
				open={!!anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
			>
				<Typography style={{ padding: props.theme.spacing(2) }}>
					@ {format(action.actionedAt, LONG_DATE_TIME)}
				</Typography>
			</Popover>
		</Fragment>
	);
});

export default ActionStatusChip;
