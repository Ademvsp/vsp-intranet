export default class Post {
	constructor(
		postId,
		attachments,
		body,
		comments,
		metadata,
		title,
		subscribers,
		user
	) {
		this.postId = postId;
		this.attachments = attachments;
		this.body = body;
		this.comments = comments;
		this.metadata = metadata;
		this.title = title;
		this.subscribers = subscribers;
		this.user = user;
	}
}
