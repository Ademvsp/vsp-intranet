import firebase from '../utils/firebase';
import {
	SET_MESSAGE,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY,
	SET_NOTIFICACTIONS_TOUCHED,
	SET_NOTIFICACTIONS,
	SNACKBAR,
	DIALOG
} from '../utils/constants';
import Message from '../models/message';
let notificationsListener;

export const getNotifications = () => {
	return async (dispatch, getState) => {
		const authUser = getState().authState.authUser;
		const TWO_MINUTES_SECONDS = 120;
		const ONE_MONTH_MILLISECONDS = 2592000000;
		const ONE_MONTH_AGO_MILLISECONDS =
			new Date().getTime() - ONE_MONTH_MILLISECONDS;
		const ONE_MONTH_AGO_DATE = new Date(ONE_MONTH_AGO_MILLISECONDS);
		const ONE_MONTH_AGO_TIMESTAMP = firebase.firestore.Timestamp.fromDate(
			ONE_MONTH_AGO_DATE
		);
		notificationsListener = firebase
			.firestore()
			.collection('notifications')
			.where('user', '==', authUser.userId)
			.where('read', '==', false)
			.where('createdAt', '>=', ONE_MONTH_AGO_TIMESTAMP)
			.orderBy('createdAt', 'desc')
			.onSnapshot((snapshot) => {
				if (
					//Make sure database is fully updated when udpates are made or deletions of notifications happen
					!snapshot.docs.some((doc) => doc.metadata.hasPendingWrites) &&
					snapshot.docs.every((doc) => doc.data().createdAt)
				) {
					const touched = getState().notificationState.touched;
					const actions = [];
					if (touched) {
						snapshot.docChanges().forEach((change) => {
							//Every times there is an update with new notifications
							const SECONDS_AGO =
								Number.parseInt(new Date().getTime() / 1000) -
								change.doc.data().createdAt.seconds;
							if (
								change.type === 'added' &&
								SECONDS_AGO <= TWO_MINUTES_SECONDS
							) {
								const message = new Message({
									title: change.doc.data().page,
									body: change.doc.data().subject,
									feedback: SNACKBAR,
									options: {
										duration: 5000,
										variant: SNACKBAR_VARIANTS.FILLED,
										severity: SNACKBAR_SEVERITY.INFO
									}
								});
								actions.push({
									type: SET_MESSAGE,
									message
								});
							}
						});
					} else {
						actions.push({ type: SET_NOTIFICACTIONS_TOUCHED }); //First time loading, initial loading of all notifications
					}
					const notifications = snapshot.docs.map((doc) => ({
						notificationId: doc.id,
						...doc.data()
					}));
					dispatch([
						...actions,
						{
							type: SET_NOTIFICACTIONS,
							notifications
						}
					]);
				}
			});
	};
};

export const clearNotification = (notificationId) => {
	return async (dispatch, _getState) => {
		try {
			await firebase
				.firestore()
				.collection('notifications')
				.doc(notificationId)
				.delete();
		} catch (error) {
			const message = new Message({
				title: 'Notifications',
				body: 'Notification failed to clear',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const clearNotifications = () => {
	return async (dispatch, getState) => {
		try {
			const notifications = getState().notificationState.notifications;
			const batch = firebase.firestore().batch();
			for (const notification of notifications) {
				const docRef = firebase
					.firestore()
					.collection('notifications')
					.doc(notification.notificationId);
				batch.delete(docRef);
			}
			await batch.commit();
		} catch (error) {
			const message = new Message({
				title: 'Notifications',
				body: 'Notifications failed to clear',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const unsubscribeNotificationsListener = () => {
	if (notificationsListener) {
		notificationsListener();
	}
};
