export default class User {
	constructor({
		userId,
		active,
		email,
		firstName,
		lastName,
		location,
		extension,
		phone,
		profilePicture,
		settings,
		title
	}) {
		this.userId = userId;
		this.active = active;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.phone = phone;
		this.extension = extension;
		this.profilePicture = profilePicture;
		this.settings = settings;
		this.title = title;
	}
}
