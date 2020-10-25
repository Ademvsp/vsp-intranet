import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import CollectionData from './collection-data';

export default class Project {
	constructor({
		projectId,
		actions,
		attachments,
		comments,
		customer,
		description,
		metadata,
		name,
		owners,
		reminder,
		user,
		value,
		vendors
	}) {
		this.projectId = projectId;
		this.actions = actions;
		this.attachments = attachments;
		this.comments = comments;
		this.customer = customer;
		this.description = description;
		this.metadata = metadata;
		this.name = name;
		this.owners = owners;
		this.reminder = reminder;
		this.user = user;
		this.value = value;
		this.vendors = vendors;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.projectId;
		return databaseObject;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.projectId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions[this.actions.length - 1].actionedAt = new Date(serverTime);
			await firebase
				.firestore()
				.collection('projects-new')
				.doc(this.projectId)
				.update(this.getDatabaseObject());
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions = this.actions.map((action) => ({
				...action,
				actionedAt: new Date(serverTime)
			}));
			const docRef = await firebase
				.firestore()
				.collection('projects-new')
				.add(this.getDatabaseObject());
			this.projectId = docRef.id;
			// await CollectionData.updateCollectionData('projects', this.projectId);
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
			.collection('projects-new')
			.doc(this.projectId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(comment)
			});
		this.comments.push(comment);
	}

	static getListener(userId) {
		return firebase
			.firestore()
			.collection('projects-new')
			.where('owners', 'array-contains', userId)
			.orderBy('metadata.createdAt', 'desc');
	}
}
