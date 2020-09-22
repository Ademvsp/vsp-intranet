import firebase from '../utils/firebase';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;

export default class AuthUser {
	constructor({
		userId,
		email,
		firstName,
		lastName,
		location,
		manager,
		metadata,
		profilePicture,
		settings
	}) {
		this.userId = userId;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.manager = manager;
		this.metadata = metadata;
		this.profilePicture = profilePicture;
		this.settings = settings;
	}

	async save() {
		const metadata = {
			...this.metadata,
			updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
			updatedBy: firebase.auth().currentUser.uid
		};
		await firebase.firestore().collection('usersNew').doc(this.userId).update({
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			location: this.location,
			manager: this.manager,
			metadata: metadata,
			profilePicture: this.profilePicture,
			settings: this.settings
		});
	}

	async logout() {
		await firebase.auth().signOut();
	}

	async logoutAll() {
		const functionRef = firebase
			.functions()
			.httpsCallable('revokeRefreshTokens');
		await functionRef();
		await this.logout();
	}

	static async get(userId) {
		const doc = await firebase
			.firestore()
			.collection('usersNew')
			.doc(userId)
			.get();
		if (!doc.exists) {
			return null;
		}
		const metadata = {
			...doc.data().metadata,
			createdAt: doc.data().metadata.createdAt.toDate(),
			updatedAt: doc.data().metadata.updatedAt.toDate(),
			loggedInAt: doc.data().metadata.loggedInAt
				? doc.data().metadata.loggedInAt.toDate()
				: null
		};

		return new AuthUser({
			...doc.data(),
			userId: doc.id,
			metadata: metadata
		});
	}

	static getServerTimestamp() {
		return firebase.firestore.FieldValue.serverTimestamp();
	}

	static getAuth() {
		return firebase.auth();
	}

	static getAuthListener(userId) {
		return firebase.firestore().collection('usersNew').doc(userId);
	}

	static async getPhoneNumber(email) {
		const functionRef = firebase
			.app()
			.functions(region)
			.httpsCallable('getPhoneNumberNew');
		const result = await functionRef({ email });
		return result.data;
	}

	static async signInWithPhoneNumber(phoneNumber, appVerifier) {
		const result = await firebase
			.auth()
			.signInWithPhoneNumber(phoneNumber, appVerifier);
		return result;
	}

	static async confirmVerificationCode(confirmationResult, verificationCode) {
		confirmationResult.confirm(verificationCode);
	}

	static async signInWithEmailAndPassword(email, password) {
		await firebase.auth().signInWithEmailAndPassword(email, password);
	}
}
