import {
	APPROVED,
	REJECTED,
	REQUESTED
} from '../data/product-request-status-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import CollectionData from './collection-data';

export default class ProductRequest {
	constructor({
		productRequestId,
		actions,
		attachments,
		comments,
		cost,
		description,
		finalSku,
		metadata,
		productType,
		user,
		vendor,
		vendorSku
	}) {
		this.productRequestId = productRequestId;
		this.actions = actions;
		this.attachments = attachments;
		this.comments = comments;
		this.cost = cost;
		this.description = description;
		this.finalSku = finalSku;
		this.metadata = metadata;
		this.productType = productType;
		this.user = user;
		this.vendor = vendor;
		this.vendorSku = vendorSku;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.productRequestId;
		return databaseObject;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (!this.productRequestId) {
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
				.collection('product-requests')
				.add(this.getDatabaseObject());
			this.productRequestId = docRef.id;
			await CollectionData.updateCollectionData(
				'product-requests',
				this.productRequestId
			);
			await CollectionData.updateSubCollectionData(
				'product-requests',
				'users',
				this.user,
				this.productRequestId
			);
		}
	}

	async addComment(body, attachments, serverTime) {
		const comment = {
			attachments: attachments,
			body: body,
			metadata: {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			},
			user: firebase.auth().currentUser.uid
		};
		await firebase
			.firestore()
			.collection('product-requests')
			.doc(this.productRequestId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(comment)
			});
		this.comments.push(comment);
	}

	async approve(finalSku) {
		const serverTime = await getServerTimeInMilliseconds();
		const action = {
			actionType: APPROVED,
			actionedAt: new Date(serverTime),
			actionedBy: firebase.auth().currentUser.uid
		};
		const metadata = {
			createdAt: this.metadata.createdAt,
			createdBy: this.metadata.createdBy,
			updatedAt: new Date(serverTime),
			updatedBy: firebase.auth().currentUser.uid
		};
		await firebase
			.firestore()
			.collection('product-requests')
			.doc(this.productRequestId)
			.update({
				actions: firebase.firestore.FieldValue.arrayUnion(action),
				finalSku: finalSku,
				metadata: metadata
			});
		this.finalSku = finalSku;
		this.metadata = metadata;
		this.actions = [...this.actions, action];
	}

	async reject() {
		const serverTime = await getServerTimeInMilliseconds();
		const action = {
			actionType: REJECTED,
			actionedAt: new Date(serverTime),
			actionedBy: firebase.auth().currentUser.uid
		};
		const metadata = {
			createdAt: this.metadata.createdAt,
			createdBy: this.metadata.createdBy,
			updatedAt: new Date(serverTime),
			updatedBy: firebase.auth().currentUser.uid
		};
		await firebase
			.firestore()
			.collection('product-requests')
			.doc(this.productRequestId)
			.update({
				actions: firebase.firestore.FieldValue.arrayUnion(action),
				metadata: metadata
			});
		this.metadata = metadata;
		this.actions = [...this.actions, action];
	}

	static async getAdmins() {
		const collection = await firebase
			.firestore()
			.collection('permissions')
			.doc('product-requests')
			.collection('admins')
			.get();
		return collection.docs.map((doc) => doc.id);
	}

	static async isAdmin() {
		const docRef = await firebase
			.firestore()
			.collection('permissions')
			.doc('product-requests')
			.collection('admins')
			.doc(firebase.auth().currentUser.uid)
			.get();
		return docRef.exists;
	}

	static getListener(productRequestId) {
		return firebase
			.firestore()
			.collection('product-requests')
			.doc(productRequestId);
	}
}
