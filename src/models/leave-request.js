import {
	APPROVED,
	REJECTED,
	REQUESTED
} from '../data/leave-request-status-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import CollectionData from './collection-data';

export default class LeaveRequest {
	constructor({
		leaveRequestId,
		actions,
		comments,
		end,
		manager,
		metadata,
		reason,
		start,
		type,
		user
	}) {
		this.leaveRequestId = leaveRequestId;
		this.actions = actions;
		this.comments = comments;
		this.end = end;
		this.manager = manager;
		this.metadata = metadata;
		this.reason = reason;
		this.start = start;
		this.type = type;
		this.user = user;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.leaveRequestId;
		return databaseObject;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.leaveRequestId) {
			// this.metadata = {
			// 	...this.metadata,
			// 	updatedAt: new Date(serverTime),
			// 	updatedBy: firebase.auth().currentUser.uid
			// };
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions = [
				{
					actionType: REQUESTED,
					actionedAt: new Date(serverTime),
					actionedBy: firebase.auth().currentUser.uid
				}
			];
			const docRef = await firebase
				.firestore()
				.collection('leave-requests')
				.add(this.getDatabaseObject());
			this.leaveRequestId = docRef.id;
			await CollectionData.updateCollectionData(
				'leave-requests',
				this.leaveRequestId
			);
			//Add to user sub collection of collection-data
			await CollectionData.updateSubCollectionData(
				'product-requests',
				'users',
				this.user,
				this.leaveRequestId
			);
			//Add to manager sub collection of collection-data
			await CollectionData.updateSubCollectionData(
				'product-requests',
				'users',
				this.manager,
				this.leaveRequestId
			);
		}
	}

	// async addComment(body, attachments, serverTime) {
	// 	const comment = {
	// 		attachments: attachments,
	// 		body: body,
	// 		metadata: {
	// 			createdAt: new Date(serverTime),
	// 			createdBy: firebase.auth().currentUser.uid,
	// 			updatedAt: new Date(serverTime),
	// 			updatedBy: firebase.auth().currentUser.uid
	// 		},
	// 		user: firebase.auth().currentUser.uid
	// 	};
	// 	await firebase
	// 		.firestore()
	// 		.collection('product-requests')
	// 		.doc(this.leaveRequestId)
	// 		.update({
	// 			comments: firebase.firestore.FieldValue.arrayUnion(comment)
	// 		});
	// 	this.comments.push(comment);
	// }

	// async approve(finalSku) {
	// 	const serverTime = await getServerTimeInMilliseconds();
	// 	const action = {
	// 		actionType: APPROVED,
	// 		actionedAt: new Date(serverTime),
	// 		actionedBy: firebase.auth().currentUser.uid
	// 	};
	// 	const metadata = {
	// 		createdAt: this.metadata.createdAt,
	// 		createdBy: this.metadata.createdBy,
	// 		updatedAt: new Date(serverTime),
	// 		updatedBy: firebase.auth().currentUser.uid
	// 	};
	// 	await firebase
	// 		.firestore()
	// 		.collection('product-requests')
	// 		.doc(this.leaveRequestId)
	// 		.update({
	// 			actions: firebase.firestore.FieldValue.arrayUnion(action),
	// 			finalSku: finalSku,
	// 			metadata: metadata
	// 		});
	// 	this.finalSku = finalSku;
	// 	this.metadata = metadata;
	// 	this.actions = [...this.actions, action];
	// }

	// async reject() {
	// 	const serverTime = await getServerTimeInMilliseconds();
	// 	const action = {
	// 		actionType: REJECTED,
	// 		actionedAt: new Date(serverTime),
	// 		actionedBy: firebase.auth().currentUser.uid
	// 	};
	// 	const metadata = {
	// 		createdAt: this.metadata.createdAt,
	// 		createdBy: this.metadata.createdBy,
	// 		updatedAt: new Date(serverTime),
	// 		updatedBy: firebase.auth().currentUser.uid
	// 	};
	// 	await firebase
	// 		.firestore()
	// 		.collection('product-requests')
	// 		.doc(this.leaveRequestId)
	// 		.update({
	// 			actions: firebase.firestore.FieldValue.arrayUnion(action),
	// 			metadata: metadata
	// 		});
	// 	this.metadata = metadata;
	// 	this.actions = [...this.actions, action];
	// }

	static async getAdmins() {
		const collection = await firebase
			.firestore()
			.collection('permissions')
			.doc('leave-requests')
			.collection('admins')
			.get();
		return collection.docs.map((doc) => doc.id);
	}

	static async isAdmin() {
		const docRef = await firebase
			.firestore()
			.collection('permissions')
			.doc('leave-requests')
			.collection('admins')
			.doc(firebase.auth().currentUser.uid)
			.get();
		return docRef.exists;
	}

	static getListener(leaveRequestId) {
		return firebase
			.firestore()
			.collection('leave-requests')
			.doc(leaveRequestId);
	}
}
