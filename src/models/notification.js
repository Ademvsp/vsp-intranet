export default class Notificaion {
	constructor(
		notificationId,
		createdAt,
		createdBy,
		link,
		page,
		recipient,
		title
	) {
		this.notificationId = notificationId;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.link = link;
		this.page = page;
		this.recipient = recipient;
		this.title = title;
	}
}
