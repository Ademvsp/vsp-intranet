import firebase from '../utils/firebase';
import {
	SET_AUTH_USER,
	LOGOUT,
	SET_MESSAGE,
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY,
	SET_AUTH_TOUCHED
} from '../utils/constants';
import User from '../models/user';
import Message from '../models/message';
import { unsubscribeNotificationsListener } from './notification';
let userListener;

export const verifyAuth = () => {
	return async (dispatch, getState) => {
		return await new Promise((resolve) => {
			firebase.auth().onAuthStateChanged(async (firebaseAuthUser) => {
				if (firebaseAuthUser) {
					await firebase
						.firestore()
						.collection('users')
						.doc(firebaseAuthUser.uid)
						.update({ logout: false });
					userListener = firebase
						.firestore()
						.collection('users')
						.doc(firebaseAuthUser.uid)
						.onSnapshot((snapshot) => {
							if (snapshot.data().logout) {
								dispatch(logout());
							} else {
								const authUser = new User({
									userId: snapshot.id,
									...snapshot.data()
								});
								const actions = [
									{
										type: SET_AUTH_USER,
										authUser
									}
								];
								if (!getState().authState.touched) {
									const message = new Message({
										title: 'Login Success',
										body: `Welcome back ${authUser.firstName}`,
										feedback: SNACKBAR,
										options: {
											duration: 3000,
											variant: SNACKBAR_VARIANTS.FILLED,
											severity: SNACKBAR_SEVERITY.INFO
										}
									});
									actions.push(
										{
											type: SET_AUTH_TOUCHED
										},
										{
											type: SET_MESSAGE,
											message
										}
									);
								}
								dispatch(actions);
								resolve();
							}
						});
				} else {
					resolve();
				}
			});
		});
	};
};

export const unsubscribeUserListener = () => {
	if (userListener) {
		userListener();
	}
};

export const logout = () => {
	return async (dispatch, _getState) => {
		unsubscribeUserListener();
		unsubscribeNotificationsListener();
		await firebase.auth().signOut();
		dispatch({ type: LOGOUT });
	};
};

export const logoutAll = () => {
	return async (dispatch, _getState) => {
		const functionRef = firebase
			.functions()
			.httpsCallable('revokeRefreshTokens');
		await functionRef();
		dispatch(logout());
	};
};

export const getPhoneNumber = (email) => {
	return async (dispatch, _getState) => {
		try {
			const functionRef = firebase
				.functions()
				.httpsCallable('getPhoneNumberNew');
			const result = await functionRef({ email });
			return result.data;
		} catch (error) {
			const message = new Message({
				title: 'Invalid Credentials',
				body: 'Email address is invalid',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};

export const signInWithPhoneNumber = (phoneNumber, appVerifier) => {
	return async (dispatch, _getState) => {
		try {
			const result = await firebase
				.auth()
				.signInWithPhoneNumber(phoneNumber, appVerifier);
			return result;
		} catch (error) {
			const message = new Message({
				title: 'Invalid Credentials',
				body: 'Email address is invalid',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};

export const confirmVerificationCode = (
	confirmationResult,
	verificationCode
) => {
	return async (dispatch, _getState) => {
		try {
			await confirmationResult.confirm(verificationCode);
			return true;
		} catch (error) {
			const message = new Message({
				title: 'Invalid Credentials',
				body: 'Verification code is invalid',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};

export const loginWithPassword = (email, password) => {
	return async (dispatch, _getState) => {
		try {
			await firebase.auth().signInWithEmailAndPassword(email, password);
			return true;
		} catch (error) {
			const message = new Message({
				title: 'Invalid Credentials',
				body: 'Incorrect email or password',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};
