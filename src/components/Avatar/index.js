import React, { Fragment, useState } from 'react';
import { StyledAvatar } from './styled-components';
import { useSelector } from 'react-redux';
import { Popover } from '@material-ui/core';
import ContactCard from './ContactCard';

const Avatar = (props) => {
	const [anchorEl, setAnchorEl] = useState();
	const { authUser } = useSelector((state) => state.authState);
	const { user, contactCard, iconFallback, customFallback } = props;

	const firstNameInitial = user.firstName.substring(0, 1);
	const lastNameInitial = user.lastName.substring(0, 1);

	let fallback = `${firstNameInitial}${lastNameInitial}`;
	if (iconFallback) {
		fallback = null;
	}
	if (customFallback) {
		fallback = customFallback;
	}

	return (
		<Fragment>
			<StyledAvatar
				onClick={(event) =>
					contactCard ? setAnchorEl(event.currentTarget) : null
				}
				src={user.profilePicture}
				darkMode={authUser.settings.darkMode}
				{...props}
			>
				{fallback}
			</StyledAvatar>
			{contactCard ? (
				<Popover
					open={!!anchorEl}
					anchorEl={anchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right'
					}}
					transformOrigin={{
						vertical: 'bottom',
						horizontal: 'left'
					}}
					onClose={() => setAnchorEl(null)}
				>
					<ContactCard user={user} />
				</Popover>
			) : null}
		</Fragment>
	);
};

export default Avatar;
