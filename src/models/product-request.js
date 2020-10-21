import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

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

	static getListener(productRequestId) {
		return firebase
			.firestore()
			.collection('product-requests')
			.doc(productRequestId);
	}
}
