import firebase from '../utils/firebase';

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

	static getListener(userId) {
		return firebase
			.firestore()
			.collection('projectsNew')
			.where('owners', 'array-contains', userId)
			.orderBy('metadata.createdAt', 'desc');
	}
}
