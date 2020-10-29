import React, { useEffect } from 'react';
import './App.css';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AppContainer from './components/AppContainer';
import { CircularProgress } from '@material-ui/core';
import * as authUserActions from './store/actions/auth-user';
import * as notificationActions from './store/actions/notification';
import * as userActions from './store/actions/user';
import * as locationActions from './store/actions/location';
import Login from './pages/Login';
import Account from './pages/Account';
import NewsFeed from './pages/NewsFeed';
import Calendar from './pages/Calendar';
import StaffDirectory from './pages/StaffDirectory';
import Projects from './pages/Projects';
import {
	READ,
	READ_PAGE,
	READ_POST,
	READ_PRODUCT_REQUEST,
	READ_LEAVE_REQUEST,
	UPDATE,
	READ_EXPENSE_CLAIM
} from './utils/actions';
import Dashboard from './pages/Dashboard';
import ProductRequests from './pages/ProductRequests';
import LeaveRequests from './pages/LeaveRequests';
import ExpenseClaims from './pages/ExpenseClaims';

const App = (props) => {
	const dispatch = useDispatch();
	const authState = useSelector((state) => state.authState);
	const notificationState = useSelector((state) => state.notificationState);
	const dataState = useSelector((state) => state.dataState);
	//Check authentication token from firebase
	useEffect(() => {
		const verifyAuth = async () => {
			await dispatch(authUserActions.verifyAuth());
		};
		verifyAuth();
	}, [dispatch]);
	//Get notification after logged in
	useEffect(() => {
		if (authState.authUser && !notificationState.touched) {
			dispatch(notificationActions.subscribeNotificationsListener());
		}
	}, [authState.authUser, notificationState.touched, dispatch]);
	//Get locations after logged in
	useEffect(() => {
		if (authState.authUser && !dataState.usersTouched) {
			dispatch(locationActions.getLocations());
		}
	}, [authState.authUser, dataState.usersTouched, dispatch]);
	//Get app users with mapped locations after locations are retrieved
	useEffect(() => {
		if (dataState.locations) {
			dispatch(userActions.subscribeUserListener());
		}
	}, [dataState.locations, dispatch]);
	//Unsubscribe to any active listeners upon unmounting app
	useEffect(() => {
		return () => {
			authUserActions.unsubscribeAuthUserListener();
			notificationActions.unsubscribeNotificationsListener();
			userActions.unsubscribeUsersListener();
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
					<Route path='/dashboard'>
						<Dashboard />
					</Route>
					<Route path='/account'>
						<Account />
					</Route>
					<Route path={'/newsfeed/page/:page'}>
						<NewsFeed action={READ_PAGE} />
					</Route>
					<Route path={'/newsfeed/:postId'}>
						<NewsFeed action={READ_POST} />
					</Route>
					<Redirect from='/newsfeed' to='/newsfeed/page/1' />
					<Route path='/calendar/:eventId'>
						<Calendar action={UPDATE} />
					</Route>
					<Route path='/calendar'>
						<Calendar action={READ} />
					</Route>
					<Route path='/directory'>
						<StaffDirectory />
					</Route>
					<Route path='/projects/:projectId'>
						<Projects action={UPDATE} />
					</Route>
					<Route path='/projects'>
						<Projects action={READ} />
					</Route>
					<Route path={'/product-requests/page/:page'}>
						<ProductRequests action={READ_PAGE} />
					</Route>
					<Route path={'/product-requests/:productRequestId'}>
						<ProductRequests action={READ_PRODUCT_REQUEST} />
					</Route>
					<Route path={'/leave-requests/page/:page'}>
						<LeaveRequests action={READ_PAGE} />
					</Route>
					<Route path={'/leave-requests/:leaveRequestId'}>
						<LeaveRequests action={READ_LEAVE_REQUEST} />
					</Route>
					<Route path={'/expense-claims/page/:page'}>
						<ExpenseClaims action={READ_PAGE} />
					</Route>
					<Route path={'/expense-claims/:expenseClaimId'}>
						<ExpenseClaims action={READ_EXPENSE_CLAIM} />
					</Route>
					<Redirect from='/product-requests' to='/product-requests/page/1' />
					<Redirect from='/leave-requests' to='/leave-requests/page/1' />
					<Redirect from='/expense-claims' to='/expense-claims/page/1' />
					<Redirect from='/login' to='/' />
					<Redirect from='/' to='/dashboard' />
				</Switch>
			);
		}
	}
	return <AppContainer>{children}</AppContainer>;
};

export default App;
