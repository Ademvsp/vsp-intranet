import React, { useContext } from 'react';
import SideDrawerItems from './SideDrawerItems';
import { Drawer } from '@material-ui/core';
import { SideDrawerContext } from '../AppContainer';

const SideDawer = (props) => {
	const { drawerOpen, setDrawerOpen } = useContext(SideDrawerContext);
	return (
		<Drawer
			anchor={'left'}
			open={drawerOpen}
			onClose={() => setDrawerOpen(false)}
		>
			<SideDrawerItems />
		</Drawer>
	);
};

export default SideDawer;
