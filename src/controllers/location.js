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
				return new Location(
					doc.id,
					doc.data().address,
					doc.data().branch,
					doc.data().colors,
					doc.data().map,
					doc.data().phone,
					doc.data().state,
					doc.data().timezone
				);
			});
			dispatch({
				type: SET_LOCATIONS,
				locations
			});
		} catch (error) {
			const message = new Message(
				'Locations',
				'Failed to retrieve locations',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		}
	};
};
