import { DIALOG } from '../../utils/constants';
import { SET_MESSAGE, SET_LOCATIONS } from '../../utils/actions';
import Message from '../../models/message';
import Location from '../../models/location';

export const getLocations = () => {
	return async (dispatch, _getState) => {
		try {
			const locations = await Location.getAll();
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
