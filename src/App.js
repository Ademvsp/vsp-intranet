import React, { useEffect } from 'react';
import './App.css';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AppContainer from './components/AppContainer';
import { CircularProgress } from '@material-ui/core';
import * as authController from './controllers/auth';
import * as notificationController from './controllers/notification';
import * as userController from './controllers/user';
import Login from './pages/Login';
import Account from './pages/Account';
import NewsFeed from './pages/NewsFeed';

const App = withRouter((props) => {
	const dispatch = useDispatch();
	const authState = useSelector((state) => state.authState);
	const notificationState = useSelector((state) => state.notificationState);
	const dataState = useSelector((state) => state.dataState);
	//Check authentication token from firebase
	useEffect(() => {
		const verifyAuth = async () => {
			await dispatch(authController.verifyAuth());
		};
		verifyAuth();
	}, [dispatch]);
	//Get notification after logged in
	useEffect(() => {
		if (authState.authUser && !notificationState.touched) {
			dispatch(notificationController.getNotifications());
		}
	}, [authState.authUser, notificationState.touched, dispatch]);
	//Get app users after logged in
	useEffect(() => {
		if (authState.authUser && !dataState.usersTouched) {
			dispatch(userController.getUsers());
		}
	}, [authState.authUser, dataState.usersTouched, dispatch]);
	//Unsubscribe to any active listeners upon unmounting app
	useEffect(() => {
		return () => {
			authController.unsubscribeAuthUserListener();
			notificationController.unsubscribeNotificationsListener();
			userController.unsubscribeUsersListener();
		};
	}, []);

	let children = <CircularProgress />;

	if (authState.touched) {
		if (!authState.authUser) {
			children = (
				<Switch>
					<Route path='/login' component={Login} />
					<Route path='/' component={Login} />
				</Switch>
			);
		}
		if (authState.authUser && dataState.users) {
			children = (
				<Switch>
					<Route path='/account' component={Account} />
					<Route path='/newsfeed/:page' component={NewsFeed} />
					<Redirect from='/login' to='/' />
					<Redirect from='/newsfeed' to='/newsfeed/1' />
					<Redirect from='/' to='/newsfeed' />
				</Switch>
			);
		}
	}
	return <AppContainer>{children}</AppContainer>;
});

export default App;
