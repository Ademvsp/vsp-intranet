import React, { useEffect, useState } from 'react';
import './App.css';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AppContainer from './components/AppContainer';
import { CircularProgress } from '@material-ui/core';
import * as authController from './controllers/auth';
import Login from './pages/Login';
import Account from './pages/Account';

const App = withRouter((props) => {
	const [authLoading, setAuthLoading] = useState(true);
	const dispatch = useDispatch();
	const { authUser } = useSelector((state) => state.authState);

	useEffect(() => {
		const verifyAuth = async () => {
			await dispatch(authController.verifyAuth());
			setAuthLoading(false);
		};
		verifyAuth();
	}, [dispatch]);

	let children = <CircularProgress />;

	if (!authLoading) {
		children = (
			<Switch>
				<Route path='/login' component={Login} />
				<Route path='/' component={Login} />
			</Switch>
		);

		if (authUser) {
			children = (
				<Switch>
					<Route path='/account' component={Account} />
					<Route path='/' component={Account} />
					<Redirect from='/login' to='/' />
				</Switch>
			);
		}
	}
	return <AppContainer>{children}</AppContainer>;
});

export default App;
