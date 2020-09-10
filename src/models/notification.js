export default class Notificaion {
	constructor({
		notificationId,
		createdBy,
		createdAt,
		recipient,
		page,
		title,
		link
	}) {
		this.notificationId = notificationId;
		this.createdBy = createdBy;
		this.createdAt = createdAt;
		this.recipient = recipient;
		this.page = page;
		this.title = title;
		this.link = link;
	}
}
