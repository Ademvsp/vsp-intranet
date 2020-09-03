export default class Post {
	constructor({ postId, attachments, body, createdAt, comments, title, user }) {
		this.postId = postId;
		this.attachments = attachments;
		this.body = body;
		this.createdAt = createdAt;
		this.comments = comments;
		this.title = title;
		this.user = user;
	}
}
