import {
	Collapse,
	ListItem,
	ListItemIcon,
	ListItemText
} from '@material-ui/core';
import React, { Fragment, useContext } from 'react';
import {
	ExpandLess as ExpandLessIcon,
	ExpandMore as ExpandMoreIcon
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { withTheme } from '@material-ui/core/styles';
import { SideDrawerContext } from '../../../AppContainer';
import { useDispatch, useSelector } from 'react-redux';
import * as authController from '../../../../controllers/auth';

const SideDrawerItem = withTheme((props) => {
	const { Icon, text, link, subItems, subItem } = props;
	const dispatch = useDispatch();
	const { authUser } = useSelector((state) => state.authState);
	const history = useHistory();
	const { setDrawerOpen } = useContext(SideDrawerContext);
	const expand = !!authUser.settings.expandSideDrawerItems[
		text.split(' ').join('').toLowerCase()
	];
	const ExpandIcon = expand ? ExpandLessIcon : ExpandMoreIcon;

	const listItemClickHandler = () => {
		if (subItems) {
			const settings = {
				...authUser.settings
			};
			settings.expandSideDrawerItems[
				text.split(' ').join('').toLowerCase()
			] = !expand;
			dispatch(authController.updateSettings(settings));
		} else {
			history.push(link);
			setDrawerOpen(false);
		}
	};

	return (
		<Fragment>
			<ListItem
				button={true}
				onClick={listItemClickHandler}
				style={{
					paddingLeft: subItem ? props.theme.spacing(4) : ''
				}}
			>
				<ListItemIcon>
					<Icon />
				</ListItemIcon>
				<ListItemText primary={text} />
				{subItems && <ExpandIcon />}
			</ListItem>
			{subItems && (
				<Collapse in={expand} timeout='auto' unmountOnExit>
					{subItems.map((subItem) => subItem)}
				</Collapse>
			)}
		</Fragment>
	);
});

export default SideDrawerItem;
