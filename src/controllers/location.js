import firebase from '../utils/firebase';
import { DIALOG } from '../utils/constants';
import { SET_MESSAGE, SET_LOCATIONS } from '../utils/actions';
import Message from '../models/message';
import Location from '../models/location';

export const getLocations = () => {
	return async (dispatch, _getState) => {
		try {
			const collection = await firebase
				.firestore()
				.collection('locationsNew')
				.orderBy('state', 'asc')
				.get();
			const locations = collection.docs.map((doc) => {
				return new Location({
					locationId: doc.id,
					address: doc.data().address,
					branch: doc.data().branch,
					colors: doc.data().colors,
					map: doc.data().map,
					phone: doc.data().phone,
					state: doc.data().state,
					timezone: doc.data().timezone
				});
			});
			dispatch({
				type: SET_LOCATIONS,
				locations
			});
		} catch (error) {
			const message = new Message({
				title: 'Locations',
				body: 'Failed to retrieve locations',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};
