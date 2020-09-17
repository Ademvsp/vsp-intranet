import {
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY,
	SNACKBAR,
	DIALOG
} from '../utils/constants';
import {
	SET_MESSAGE,
	SET_NOTIFICACTIONS_TOUCHED,
	SET_NOTIFICACTIONS
} from '../utils/actions';
import Message from '../models/message';
import Notification from '../models/notification';
let notificationsListener;

export const subscribeNotificationsListener = () => {
	return async (dispatch, getState) => {
		const authUser = getState().authState.authUser;
		notificationsListener = Notification.getListener(
			authUser.userId
		).onSnapshot((snapshot) => {
			if (!snapshot.docs.some((doc) => doc.metadata.hasPendingWrites)) {
				const touched = getState().notificationState.touched;
				const actions = [];
				if (touched) {
					snapshot.docChanges().forEach((change) => {
						//Every times there is an update with new notifications
						const SECONDS_AGO =
							Number.parseInt(new Date().getTime() / 1000) -
							change.doc.data().metadata.createdAt.seconds;
						const TWO_MINUTES_SECONDS = 120;
						if (change.type === 'added' && SECONDS_AGO <= TWO_MINUTES_SECONDS) {
							const message = new Message(
								change.doc.data().page,
								change.doc.data().title,
								SNACKBAR,
								{
									duration: 5000,
									variant: SNACKBAR_VARIANTS.FILLED,
									severity: SNACKBAR_SEVERITY.INFO
								}
							);
							actions.push({
								type: SET_MESSAGE,
								message
							});
						}
					});
				} else {
					actions.push({ type: SET_NOTIFICACTIONS_TOUCHED }); //First time loading, initial loading of all notifications
				}
				const notifications = snapshot.docs.map((doc) => {
					const metadata = {
						...doc.data().metadata,
						createdAt: doc.data().metadata.createdAt.toDate(),
						updatedAt: doc.data().metadata.updatedAt.toDate()
					};
					return new Notification(
						doc.id,
						doc.data().data,
						doc.data().link,
						metadata,
						doc.data().page,
						doc.data().recipient,
						doc.data().title,
						doc.data().type
					);
				});
				notifications.sort((a, b) =>
					a.metadata.createdAt < b.metadata.createdAt ? 1 : -1
				);
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

export const clearNotification = (notification) => {
	return async (dispatch, _getState) => {
		try {
			await notification.delete();
		} catch (error) {
			const message = new Message(
				'Notifications',
				'Notification failed to clear',
				DIALOG
			);
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
			await Notification.deleteAll(notifications);
		} catch (error) {
			const message = new Message(
				'Notifications',
				'Notifications failed to clear',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};

export const sendNotification = async (data) => {
	await Notification.send(data);
};

export const unsubscribeNotificationsListenerListener = () => {
	if (notificationsListener) {
		notificationsListener();
	}
};
