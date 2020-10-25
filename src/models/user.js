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
		phone,
		profilePicture,
		title,
		workFromHome
	}) {
		this.userId = userId;
		this.active = active;
		this.email = email;
		this.extension = extension;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.phone = phone;
		this.profilePicture = profilePicture;
		this.title = title;
		this.workFromHome = workFromHome;
	}

	getFullName() {
		return `${this.firstName} ${this.lastName}`;
	}

	static getListener() {
		return firebase
			.firestore()
			.collection('users-new')
			.orderBy('firstName', 'asc');
	}
}
