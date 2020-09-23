import React from 'react';
import Card from '../../components/Card';
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
			<Card>
				<CardContent>
					<Avatar authUser={authUser} />
					<Settings authUser={authUser} />
					<Logout />
				</CardContent>
			</Card>
		</PageContainer>
	);
};

export default Account;
