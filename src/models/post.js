export default class Post {
	constructor({
		postId,
		attachments,
		body,
		comments,
		title,
		subscribers,
		createdAt,
		createdBy
	}) {
		this.postId = postId;
		this.attachments = attachments;
		this.body = body;
		this.comments = comments;
		this.title = title;
		this.subscribers = subscribers;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
	}
}
