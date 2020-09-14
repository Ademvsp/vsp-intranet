export default class AuthUser {
	constructor(
		userId,
		email,
		firstName,
		lastName,
		location,
		manager,
		profilePicture,
		settings
	) {
		this.userId = userId;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.manager = manager;
		this.profilePicture = profilePicture;
		this.settings = settings;
	}
}
