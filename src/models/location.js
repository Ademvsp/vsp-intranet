import firebase from '../utils/firebase';

export default class Location {
	constructor({
		locationId,
		address,
		branch,
		colors,
		map,
		phone,
		state,
		timezone
	}) {
		this.locationId = locationId;
		this.address = address;
		this.branch = branch;
		this.colors = colors;
		this.map = map;
		this.phone = phone;
		this.state = state;
		this.timezone = timezone;
	}

	static async getAll() {
		const collection = await firebase
			.firestore()
			.collection('locationsNew')
			.orderBy('state', 'asc')
			.get();
		const locations = collection.docs.map((doc) => {
			return new Location({ ...doc.data(), locationId: doc.id });
		});
		return locations;
	}
}
