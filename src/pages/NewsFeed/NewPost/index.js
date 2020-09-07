import React from 'react';
import { StyledCard } from '../styled-components';
import { CardContent } from '@material-ui/core';
import { StyledAvatar } from '../../../utils/styled-components';
import { useSelector } from 'react-redux';

const NewPost = (props) => {
	const { authUser } = useSelector((state) => state.authState);

	return (
		<StyledCard>
			<CardContent>
				<div className='MuiListItemAvatar-root'>
					<StyledAvatar />
				</div>
			</CardContent>
		</StyledCard>
	);
};

export default NewPost;
