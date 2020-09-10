import React, { useEffect } from 'react';
import './App.css';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AppContainer from './components/AppContainer';
import { CircularProgress } from '@material-ui/core';
import * as authController from './controllers/auth';
import * as notificationController from './controllers/notification';
import * as userController from './controllers/user';
import * as locationController from './controllers/location';
import Login from './pages/Login';
import Account from './pages/Account';
import NewsFeed from './pages/NewsFeed';
import Calendar from './pages/Calendar';

const App = (props) => {
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
	//Get locations after logged in
	useEffect(() => {
		if (authState.authUser && !dataState.usersTouched) {
			dispatch(locationController.getLocations());
		}
	}, [authState.authUser, dataState.usersTouched, dispatch]);
	//Get app users with mapped locations after locations are retrieved
	useEffect(() => {
		if (dataState.locations) {
			dispatch(userController.subscribeUsers());
		}
	}, [dataState.locations, dispatch]);
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
					<Route path='/account'>
						<Account />
					</Route>
					<Route path='/newsfeed/page/:page'>
						<NewsFeed />
					</Route>
					<Route path='/newsfeed/post'>
						<NewsFeed />
					</Route>
					<Route path='/calendar'>
						<Calendar />
					</Route>
					<Redirect from='/login' to='/' />
					<Redirect from='/newsfeed' to='/newsfeed/page/1' />
					<Redirect from='/' to='/newsfeed' />
				</Switch>
			);
		}
	}
	return <AppContainer>{children}</AppContainer>;
};

export default App;
