const admin = require('firebase-admin');
const collectionRef = admin.firestore().collection('posts');
module.exports = class Post {
  constructor({
    postId,
    actions,
    attachments,
    body,
    comments,
    likes,
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
    this.likes = likes;
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
    if (this.postId) {
      await collectionRef.doc(this.postId).update(this.getDatabaseObject());
    }
  }
};
