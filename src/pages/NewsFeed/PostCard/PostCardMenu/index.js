import React, { useState, Fragment } from 'react';
import { Menu, MenuItem, IconButton } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import * as messageController from '../../../../controllers/message';
import * as postController from '../../../../controllers/post';
import Message from '../../../../models/message';
import {
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../../../../utils/constants';

const PostCardMenu = (props) => {
	const dispatch = useDispatch();
	const { authUser } = useSelector((state) => state.authState);
	const [anchorEl, setAnchorEl] = useState(null);
	const { post } = props;

	const copyClickHandler = () => {
		const message = new Message({
			title: 'News Feed',
			body: 'Link copied to clipboard',
			feedback: SNACKBAR,
			options: {
				duration: 2000,
				variant: SNACKBAR_VARIANTS.FILLED,
				severity: SNACKBAR_SEVERITY.INFO
			}
		});
		dispatch(messageController.setMessage(message));
		setAnchorEl(null);
	};

	const subscribeHandler = () => {
		setAnchorEl(null);
		dispatch(postController.toggleSubscribePost(post));
	};

	let subscribeText = 'Subsrcibe';
	if (post.subscribers.includes(authUser.userId)) {
		subscribeText = 'Unsubsribe';
	}

	return (
		<Fragment>
			<IconButton
				onClick={(event) => {
					setAnchorEl(event.currentTarget);
				}}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				keepMounted={true}
				open={!!anchorEl}
				onClose={() => setAnchorEl(null)}
			>
				<MenuItem>Share</MenuItem>
				<CopyToClipboard
					text={`${process.env.REACT_APP_BASE_URL}/newsfeed/${post.postId}`}
					onCopy={copyClickHandler}
				>
					<MenuItem>Copy direct link</MenuItem>
				</CopyToClipboard>
				<MenuItem onClick={subscribeHandler}>
					{`${subscribeText} to notifications`}
				</MenuItem>
			</Menu>
		</Fragment>
	);
};

export default PostCardMenu;
