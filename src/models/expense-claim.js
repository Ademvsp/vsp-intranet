import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class ExpenseClaim {
	constructor({
		expenseClaimId,
		actions,
		attachments,
		comments,
		expenses,
		manager,
		metadata,
		user
	}) {
		this.expenseClaimId = expenseClaimId;
		this.actions = actions;
		this.attachments = attachments;
		this.comments = comments;
		this.expenses = expenses;
		this.manager = manager;
		this.metadata = metadata;
		this.user = user;
	}

	static async isAdmin() {
		const docRef = await firebase
			.firestore()
			.collection('permissions')
			.doc('expense-claims')
			.collection('admins')
			.doc(firebase.auth().currentUser.uid)
			.get();
		return docRef.exists;
	}

	static getListener(expenseClaimId) {
		return firebase
			.firestore()
			.collection('leave-requests')
			.doc(expenseClaimId);
	}
}
