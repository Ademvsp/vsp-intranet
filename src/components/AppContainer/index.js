import React, { useState, createContext } from 'react';
import Navbar from '../Navbar/index';
import SideDrawer from '../SideDrawer/index';
import { StyledContainer } from './styled-components';

export const SideDrawerContext = createContext();

const AppContainer = (props) => {
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<SideDrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
			<Navbar />
			<SideDrawer />
			<StyledContainer disableGutters={true} maxWidth={false}>
				{props.children}
			</StyledContainer>
		</SideDrawerContext.Provider>
	);
};

export default AppContainer;
