export default class Notification {
	constructor({ notificationId, page, subject, link, createdAt }) {
		this.notificationId = notificationId;
		this.page = page;
		this.subject = subject;
		this.link = link;
		this.createdAt = createdAt;
	}
}
