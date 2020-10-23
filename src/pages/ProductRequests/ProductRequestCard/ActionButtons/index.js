import { Button, Chip, Grid, withTheme } from '@material-ui/core';
import React, { Fragment } from 'react';
import {
	APPROVED,
	REJECTED,
	REQUESTED
} from '../../../../data/product-request-status-types';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import Avatar from '../../../../components/Avatar';
import { useSelector } from 'react-redux';

const ActionButtons = withTheme((props) => {
	const { users } = useSelector((state) => state.dataState);
	const { isAdmin, productRequest } = props;
	let children = null;

	const action = [...productRequest.actions].pop();
	const actionType = action.actionType;
	const actionUser = users.find((user) => user.userId === action.actionedBy);

	if (actionType === REQUESTED) {
		if (isAdmin) {
			children = (
				<Fragment>
					<Grid item>
						<Button
							variant='contained'
							color='default'
							startIcon={<ThumbDownAltIcon />}
						>
							Reject
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='secondary'
							startIcon={<ThumbUpAltIcon />}
						>
							Approve
						</Button>
					</Grid>
				</Fragment>
			);
		} else {
			children = (
				<Grid item>
					<Chip
						color='secondary'
						variant='outlined'
						avatar={<Avatar user={actionUser} contactCard clickable />}
						label={REQUESTED}
						deleteIcon={<ThumbsUpDownIcon />}
						onDelete={() => {}}
					/>
				</Grid>
			);
		}
	} else if (actionType === REJECTED) {
		children = (
			<Grid item>
				<Chip
					color='secondary'
					variant='outlined'
					avatar={<Avatar user={actionUser} contactCard clickable />}
					label={REJECTED}
					deleteIcon={<ThumbDownAltIcon />}
					onDelete={() => {}}
				/>
			</Grid>
		);
	} else if (actionType === APPROVED) {
		children = (
			<Grid item>
				<Chip
					color='secondary'
					variant='outlined'
					avatar={<Avatar user={actionUser} contactCard clickable />}
					label={APPROVED}
					deleteIcon={<ThumbUpAltIcon />}
					onDelete={() => {}}
				/>
			</Grid>
		);
	}

	return children;
});

export default ActionButtons;
