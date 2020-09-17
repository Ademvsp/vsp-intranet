import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Post {
	constructor(
		postId,
		attachments,
		body,
		comments,
		metadata,
		subscribers,
		title,
		user
	) {
		this.postId = postId;
		this.attachments = attachments;
		this.body = body;
		this.comments = comments;
		this.metadata = metadata;
		this.subscribers = subscribers;
		this.title = title;
		this.user = user;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.postId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			await firebase.firestore().collection('posts').doc(this.postId).update({
				attachments: this.attachments,
				body: this.body,
				comments: this.comments,
				metadata: this.metadata,
				subscribers: this.subscribers,
				title: this.title,
				user: this.user
			});
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			const docRef = await firebase.firestore().collection('posts').add({
				attachments: this.attachments,
				body: this.body,
				comments: this.comments,
				metadata: this.metadata,
				subscribers: this.subscribers,
				title: this.title,
				user: this.user
			});
			const postId = docRef.id;
			this.postId = postId;
			await firebase
				.firestore()
				.collection('counters')
				.doc('posts')
				.update({
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(postId)
				});
			return postId;
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
			.collection('posts')
			.doc(this.postId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(comment)
			});
		this.comments.push(comment);
	}

	static async get(postId) {
		const doc = await firebase
			.firestore()
			.collection('posts')
			.doc(postId)
			.get();
		if (!doc.exists) {
			return null;
		}
		const metadata = {
			...doc.data().metadata,
			createdAt: doc.data().metadata.createdAt.toDate(),
			updatedAt: doc.data().metadata.updatedAt.toDate()
		};
		return new Post(
			doc.id,
			doc.data().attachments,
			doc.data().body,
			doc.data().comments,
			metadata,
			doc.data().subscribers,
			doc.data().title,
			doc.data().user
		);
	}

	static async getAll() {
		const collection = await firebase.firestore().collection('posts').get();
		return collection.docs;
	}

	async toggleSubscribePost() {
		const userId = firebase.auth().currentUser.uid;
		let dbAction = firebase.firestore.FieldValue.arrayUnion(userId);
		if (this.subscribers.includes(userId)) {
			dbAction = firebase.firestore.FieldValue.arrayRemove(userId);
		}
		await firebase.firestore().collection('posts').doc(this.postId).update({
			subscribers: dbAction
		});
	}

	static getListener(postId) {
		return firebase.firestore().collection('posts').doc(postId);
	}
}
