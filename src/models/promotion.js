import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('promotions-new');

export default class Promotion {
  constructor({
    promotionId,
    attachments,
    body,
    comments,
    expiry,
    likes,
    metadata,
    title,
    user
  }) {
    this.promotionId = promotionId;
    this.attachments = attachments;
    this.body = body;
    this.comments = comments;
    this.expiry = expiry;
    this.likes = likes;
    this.metadata = metadata;
    this.title = title;
    this.user = user;
  }

  static getListener(promotionId) {
    return collectionRef.doc(promotionId);
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('promotions')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }

  async saveComment(body, attachments, notifyUsers, serverTime) {
    const comment = {
      attachments: attachments,
      body: body,
      likes: [],
      metadata: {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      },
      notifyUsers: notifyUsers,
      user: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.promotionId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
    this.comments.push(comment);
  }

  async toggleCommentLike(index) {
    const userId = firebase.auth().currentUser.uid;
    const indexOfLike = this.comments[index].likes.indexOf(userId);
    if (indexOfLike === -1) {
      this.comments[index].likes.push(userId);
    } else {
      this.comments[index].likes.splice(indexOfLike, 1);
    }
    await collectionRef.doc(this.promotionId).update({
      comments: this.comments
    });
  }
}
