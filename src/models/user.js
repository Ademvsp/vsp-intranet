export default class User {
	constructor({
		userId,
		active,
		admin,
		authPhone,
		email,
		firstName,
		lastName,
		location,
		logout,
		manager,
		phone,
		profilePicture,
		settings,
		title,
		workFromHome
	}) {
		this.userId = userId;
		this.active = active;
		this.admin = admin;
		this.authPhone = authPhone;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.logout = logout;
		this.manager = manager;
		this.phone = phone;
		this.profilePicture = profilePicture;
		this.settings = settings;
		this.title = title;
		this.workFromHome = workFromHome;
	}
}
