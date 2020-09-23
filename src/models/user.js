import firebase from '../utils/firebase';

export default class User {
	constructor({
		userId,
		active,
		email,
		extension,
		firstName,
		lastName,
		location,
		manager,
		phone,
		profilePicture,
		settings,
		title
	}) {
		this.userId = userId;
		this.active = active;
		this.email = email;
		this.extension = extension;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.manager = manager;
		this.phone = phone;
		this.profilePicture = profilePicture;
		this.settings = settings;
		this.title = title;
	}

	static getListener() {
		return firebase
			.firestore()
			.collection('usersNew')
			.orderBy('firstName', 'asc');
	}
}
