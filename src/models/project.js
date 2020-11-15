import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('projects');
export default class Project {
  constructor({
    projectId,
    actions,
    attachments,
    comments,
    customer,
    description,
    metadata,
    name,
    owners,
    reminder,
    user,
    value,
    vendors
  }) {
    this.projectId = projectId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.customer = customer;
    this.description = description;
    this.metadata = metadata;
    this.name = name;
    this.owners = owners;
    this.reminder = reminder;
    this.user = user;
    this.value = value;
    this.vendors = vendors;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.projectId;
    return databaseObject;
  }

  static getListener() {
    const userId = firebase.auth().currentUser.uid;
    return collectionRef
      .where('owners', 'array-contains', userId)
      .orderBy('metadata.createdAt', 'desc');
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.projectId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions[this.actions.length - 1].actionedAt = new Date(serverTime);
      await collectionRef.doc(this.projectId).update(this.getDatabaseObject());
    } else {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          //Extract status.name from project actions
          actionType: this.actions[0].actionType,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      this.projectId = docRef.id;
    }
  }

  async saveComment(body, attachments, serverTime) {
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
      user: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.projectId).update({
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
    await collectionRef.doc(this.projectId).update({
      comments: this.comments
    });
  }
}
