import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import CollectionData from './collection-data';

export default class ProductRequest {
	constructor({
		productRequestId,
		action,
		attachments,
		comments,
		cost,
		description,
		finalSku,
		metadata,
		productType,
		status,
		user,
		vendor,
		vendorSku
	}) {
		this.productRequestId = productRequestId;
		this.action = action;
		this.attachments = attachments;
		this.comments = comments;
		this.cost = cost;
		this.description = description;
		this.finalSku = finalSku;
		this.metadata = metadata;
		this.productType = productType;
		this.status = status;
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
		if (this.productRequestId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			console.log(this.getDatabaseObject());
			const docRef = await firebase
				.firestore()
				.collection('product-requests')
				.add(this.getDatabaseObject());
			this.productRequestId = docRef.id;
			console.log(docRef);
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

	static async get(userId) {
		let collection;
		let collectionRef = firebase
			.firestore()
			.collection('product-requests')
			.orderBy('metadata.createdAt', 'desc');
		if (userId) {
			collection = await collectionRef
				.where('metadata.createdBy', '==', userId)
				.get();
		} else {
			collection = await collectionRef.get();
		}
		const productRequests = collection.docs.map((doc) => {
			const metadata = {
				...doc.data().metadata,
				createdAt: doc.data().metadata.createdAt.toDate(),
				updatedAt: doc.data().metadata.updatedAt.toDate()
			};
			const action = {
				...doc.data().action,
				actionedAt: doc.data().action.actionedAt?.toDate()
			};
			return new ProductRequest({
				...doc.data(),
				productRequestId: doc.id,
				action: action,
				metadata: metadata
			});
		});
		return productRequests;
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

	static async isAdmin(userId) {
		const docRef = await firebase
			.firestore()
			.collection('permissions')
			.doc('product-requests')
			.collection('admins')
			.doc(userId)
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
