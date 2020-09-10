import React from 'react';
import { StyledCard } from './styled-components';
import { CardContent } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Avatar from './AccountAvatar';
import Settings from './Settings';
import Logout from './Logout';
import PageContainer from '../../components/PageContainer';

const Account = (props) => {
	const { authUser } = useSelector((state) => state.authState);

	return (
		<PageContainer width={20}>
			<StyledCard>
				<CardContent>
					<Avatar authUser={authUser} />
					<Settings authUser={authUser} />
					<Logout />
				</CardContent>
			</StyledCard>
		</PageContainer>
	);
};

export default Account;
