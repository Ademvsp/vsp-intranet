import { CREATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Post {
	constructor({
		postId,
		actions,
		attachments,
		body,
		comments,
		metadata,
		subscribers,
		title,
		user
	}) {
		this.postId = postId;
		this.actions = actions;
		this.attachments = attachments;
		this.body = body;
		this.comments = comments;
		this.metadata = metadata;
		this.subscribers = subscribers;
		this.title = title;
		this.user = user;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.postId;
		return databaseObject;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.postId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			await firebase
				.firestore()
				.collection('posts')
				.doc(this.postId)
				.update(this.getDatabaseObject());
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions = [
				{
					actionType: CREATE,
					actionedAt: new Date(serverTime),
					actionedBy: firebase.auth().currentUser.uid,
					//notifyUsers from the post actions
					notifyUsers: this.actions[0].notifyUsers
				}
			];
			const docRef = await firebase
				.firestore()
				.collection('posts')
				.add(this.getDatabaseObject());
			const postId = docRef.id;
			this.postId = postId;
		}
	}

	async saveComment(body, attachments, notifyUsers, serverTime) {
		const comment = {
			attachments: attachments,
			body: body,
			metadata: {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			},
			user: firebase.auth().currentUser.uid,
			notifyUsers: notifyUsers
		};
		await firebase
			.firestore()
			.collection('posts')
			.doc(this.postId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(comment),
				//Automatically add the commenter as a subsriber of the post so they receive notifications on new replies
				subscribers: firebase.firestore.FieldValue.arrayUnion(
					firebase.auth().currentUser.uid
				)
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
		return new Post({
			...doc.data(),
			postId: doc.id,
			metadata: metadata
		});
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
