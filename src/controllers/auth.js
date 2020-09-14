import firebase from '../utils/firebase';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import {
	SET_AUTH_USER,
	LOGOUT,
	SET_MESSAGE,
	SET_AUTH_TOUCHED
} from '../utils/actions';
import AuthUser from '../models/auth-user';
import Message from '../models/message';
import { unsubscribeNotificationsListener } from './notification';
import { unsubscribeUsersListener } from './user';
let authUserListener;

export const verifyAuth = () => {
	return async (dispatch, getState) => {
		firebase.auth().onAuthStateChanged(async (firebaseAuthUser) => {
			if (firebaseAuthUser) {
				await firebase
					.firestore()
					.collection('users')
					.doc(firebaseAuthUser.uid)
					.update({ logout: false });
				authUserListener = firebase
					.firestore()
					.collection('users')
					.doc(firebaseAuthUser.uid)
					.onSnapshot((snapshot) => {
						if (snapshot.data().logout) {
							dispatch(logout());
						} else {
							const authUser = new AuthUser(
								snapshot.id,
								snapshot.data().email,
								snapshot.data().firstName,
								snapshot.data().lastName,
								snapshot.data().location,
								snapshot.data().manager,
								snapshot.data().profilePicture,
								snapshot.data().settings
							);

							const actions = [
								{
									type: SET_AUTH_USER,
									authUser
								}
							];
							if (!getState().authState.touched) {
								const message = new Message(
									'Login Success',
									`Welcome back ${authUser.firstName}`,
									SNACKBAR,
									{
										duration: 3000,
										variant: SNACKBAR_VARIANTS.FILLED,
										severity: SNACKBAR_SEVERITY.INFO
									}
								);
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
						}
					});
			} else {
				dispatch({ type: SET_AUTH_TOUCHED });
			}
		});
	};
};

export const unsubscribeAuthUserListener = () => {
	if (authUserListener) {
		authUserListener();
	}
};

export const logout = () => {
	return async (dispatch, _getState) => {
		unsubscribeAuthUserListener();
		unsubscribeNotificationsListener();
		unsubscribeUsersListener();
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
			const message = new Message(
				'Invalid Credentials',
				'Email address is invalid',
				DIALOG
			);
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
			const message = new Message(
				'Invalid Credentials',
				'Email address is invalid',
				DIALOG
			);
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
			const message = new Message(
				'Invalid Credentials',
				'Verification code is invalid',
				DIALOG
			);
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
			const message = new Message(
				'Invalid Credentials',
				'Incorrect email or password',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};
