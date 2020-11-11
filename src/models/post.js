import { CREATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('posts');

export default class Post {
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

  static getListener(postId) {
    return collectionRef.doc(postId);
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.postId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      await collectionRef.doc(this.postId).update(this.getDatabaseObject());
    } else {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          actionType: CREATE,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid,
          //notifyUsers from the post actions
          notifyUsers: this.actions[0].notifyUsers
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      const postId = docRef.id;
      this.postId = postId;
    }
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
      user: firebase.auth().currentUser.uid,
      notifyUsers: notifyUsers
    };
    await collectionRef.doc(this.postId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment),
      //Automatically add the commenter as a subsriber of the post so they receive notifications on new replies
      subscribers: firebase.firestore.FieldValue.arrayUnion(
        firebase.auth().currentUser.uid
      )
    });
    this.comments.push(comment);
  }

  async toggleSubscribePost() {
    const userId = firebase.auth().currentUser.uid;
    let dbAction = firebase.firestore.FieldValue.arrayUnion(userId);
    if (this.subscribers.includes(userId)) {
      dbAction = firebase.firestore.FieldValue.arrayRemove(userId);
    }
    await collectionRef.doc(this.postId).update({
      subscribers: dbAction
    });
  }

  async toggleLike() {
    const userId = firebase.auth().currentUser.uid;
    let dbAction = firebase.firestore.FieldValue.arrayUnion(userId);
    if (this.likes.includes(userId)) {
      dbAction = firebase.firestore.FieldValue.arrayRemove(userId);
    }
    await collectionRef.doc(this.postId).update({
      likes: dbAction
    });
  }

  async toggleCommentLike(index) {
    const userId = firebase.auth().currentUser.uid;
    const indexOfLike = this.comments[index].likes.indexOf(userId);
    if (indexOfLike === -1) {
      this.comments[index].likes.push(userId);
    } else {
      this.comments[index].likes.splice(indexOfLike, 1);
    }
    await collectionRef.doc(this.postId).update({
      comments: this.comments
    });
  }

  static async find(values) {
    const collection = await collectionRef.get();
    const results = [];
    collection.forEach((doc) => {
      const value = values.value.trim().toLowerCase();
      const userId = values.user?.userId;
      const post = new Post({
        ...doc.data(),
        postId: doc.id
      });
      if (this.getSearchMatch(post, value, userId)) {
        results.push(post.postId);
      }
    });
    //If no results found OR all results returned
    if (results.length === 0 || results.length === collection.length) {
      return null;
    }
    return results;
  }

  static getSearchMatch(post, value, userId) {
    if (post.title.toLowerCase().includes(value)) {
      if (userId) {
        if (userId === post.user) {
          return true;
        }
      } else {
        return true;
      }
    }
    if (post.body.toLowerCase().includes(value)) {
      if (userId) {
        if (userId === post.user) {
          return true;
        }
      } else {
        return true;
      }
    }
    const commentMatch = post.comments.find((comment) =>
      comment.body.toLowerCase().includes(value)
    );
    if (commentMatch) {
      if (userId) {
        if (userId === commentMatch.user) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
}
