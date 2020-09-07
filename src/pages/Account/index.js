import React from 'react';
import { StyledCard } from './styled-components';
import { CardContent } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Avatar from './AccountAvatar';
import Settings from './Settings';
import Logout from './Logout';

const Account = (props) => {
	const { authUser } = useSelector((state) => state.authState);

	return (
		<StyledCard>
			<CardContent>
				<Avatar authUser={authUser} />
				<Settings authUser={authUser} />
				<Logout />
			</CardContent>
		</StyledCard>
	);
};

export default Account;
