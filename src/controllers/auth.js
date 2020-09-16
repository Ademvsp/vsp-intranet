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
import * as pictureUtils from '../utils/picture-utils';
import * as fileUtils from '../utils/file-utils';
let authUserListener;

export const verifyAuth = () => {
	return async (dispatch, getState) => {
		AuthUser.getAuth().onAuthStateChanged(async (firebaseAuthUser) => {
			if (firebaseAuthUser) {
				const loggedInAuthUser = await AuthUser.get(firebaseAuthUser.uid);
				if (loggedInAuthUser.settings.forceLogout) {
					dispatch(logout());
				} else {
					const settings = {
						...loggedInAuthUser.settings,
						forceLogout: false
					};
					const metadata = {
						...loggedInAuthUser.metadata,
						loggedInAt: AuthUser.getServerTimestamp()
					};
					loggedInAuthUser.settings = settings;
					loggedInAuthUser.metadata = metadata;
					await loggedInAuthUser.save();
					authUserListener = AuthUser.getAuthListener(
						firebaseAuthUser.uid
					).onSnapshot(async (snapshot) => {
						const authUser = new AuthUser(
							snapshot.id,
							snapshot.data().email,
							snapshot.data().firstName,
							snapshot.data().lastName,
							snapshot.data().location,
							snapshot.data().manager,
							snapshot.data().metadata,
							snapshot.data().profilePicture,
							snapshot.data().settings
						);
						if (authUser.settings.forceLogout) {
							dispatch(logout());
						} else {
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
				}
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
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		unsubscribeAuthUserListener();
		unsubscribeNotificationsListener();
		unsubscribeUsersListener();
		await authUser.logout();
		dispatch({ type: LOGOUT });
	};
};

export const logoutAll = () => {
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		await authUser.logoutAll();
		dispatch({ type: LOGOUT });
	};
};

export const getPhoneNumber = (email) => {
	return async (dispatch, _getState) => {
		try {
			return AuthUser.getPhoneNumber(email);
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
			return AuthUser.signInWithPhoneNumber(phoneNumber, appVerifier);
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
			await AuthUser.confirmVerificationCode(
				confirmationResult,
				verificationCode
			);
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
			await AuthUser.signInWithEmailAndPassword(email, password);
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

export const updateSettings = (settings) => {
	return async (dispatch, getState) => {
		try {
			const { authUser } = getState().authState;
			const newAuthUser = new AuthUser(
				authUser.userId,
				authUser.email,
				authUser.firstName,
				authUser.lastName,
				authUser.location,
				authUser.manager,
				authUser.metadata,
				authUser.profilePicture,
				settings
			);
			await newAuthUser.save();
		} catch (error) {
			const message = new Message(
				'Update Settings',
				'Settings failed to update',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const uploadPicture = (file) => {
	return async (dispatch, getState) => {
		try {
			const { authUser } = getState().authState;
			const profilePicture = await pictureUtils.upload(
				`users/${authUser.userId}/profilePicture`,
				file,
				200
			);
			const newAuthUser = new AuthUser(
				authUser.userId,
				authUser.email,
				authUser.firstName,
				authUser.lastName,
				authUser.location,
				authUser.manager,
				authUser.metadata,
				profilePicture,
				authUser.settings
			);
			await newAuthUser.save();
		} catch (error) {
			const message = new Message(
				'Profile Picture',
				'Profile picture failed to upload',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const removePicture = () => {
	return async (dispatch, getState) => {
		try {
			const authUser = getState().authState.authUser;
			await fileUtils.removeAll(`users/${authUser.userId}/profilePicture`);
			const newAuthUser = new AuthUser(
				authUser.userId,
				authUser.email,
				authUser.firstName,
				authUser.lastName,
				authUser.location,
				authUser.manager,
				authUser.metadata,
				null,
				authUser.settings
			);
			await newAuthUser.save();
		} catch (error) {
			const message = new Message(
				'Profile Picture',
				'Profile picture failed to remove',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};
