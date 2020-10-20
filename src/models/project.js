import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Project {
	constructor({
		projectId,
		attachments,
		comments,
		customer,
		description,
		metadata,
		name,
		owners,
		reminder,
		status,
		value,
		vendors
	}) {
		this.projectId = projectId;
		this.attachments = attachments;
		this.comments = comments;
		this.customer = customer;
		this.description = description;
		this.metadata = metadata;
		this.name = name;
		this.owners = owners;
		this.reminder = reminder;
		this.status = status;
		this.value = value;
		this.vendors = vendors;
	}

	getDatabaseObject() {
		return {
			attachments: this.attachments,
			comments: this.comments,
			customer: this.customer,
			description: this.description,
			metadata: this.metadata,
			name: this.name,
			owners: this.owners,
			reminder: this.reminder,
			status: this.status,
			value: this.value,
			vendors: this.vendors
		};
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.projectId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			await firebase
				.firestore()
				.collection('projectsNew')
				.doc(this.projectId)
				.update(this.getDatabaseObject());
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			const docRef = await firebase
				.firestore()
				.collection('projectsNew')
				.add(this.getDatabaseObject());
			this.projectId = docRef.id;
			await firebase
				.firestore()
				.collection('counters')
				.doc('projects')
				.update({
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(this.projectId)
				});
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
			.collection('projectsNew')
			.doc(this.projectId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(comment)
			});
		this.comments.push(comment);
	}

	static getListener(userId) {
		return firebase
			.firestore()
			.collection('projectsNew')
			.where('owners', 'array-contains', userId)
			.orderBy('metadata.createdAt', 'desc');
	}
}
