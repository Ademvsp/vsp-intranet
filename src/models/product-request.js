import {
  APPROVED,
  REJECTED,
  REQUESTED
} from '../data/product-request-status-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import Permission from './permission';
const collectionRef = firebase.firestore().collection('product-requests');

export default class ProductRequest {
  constructor({
    productRequestId,
    actions,
    attachments,
    comments,
    cost,
    description,
    finalSku,
    metadata,
    productType,
    user,
    vendor,
    vendorSku
  }) {
    this.productRequestId = productRequestId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.cost = cost;
    this.description = description;
    this.finalSku = finalSku;
    this.metadata = metadata;
    this.productType = productType;
    this.user = user;
    this.vendor = vendor;
    this.vendorSku = vendorSku;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.productRequestId;
    return databaseObject;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.productRequestId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      await collectionRef
        .doc(this.productRequestId)
        .update(this.getDatabaseObject());
    } else {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          actionType: REQUESTED,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      this.productRequestId = docRef.id;
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
    await collectionRef.doc(this.productRequestId).update({
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
    await collectionRef.doc(this.productRequestId).update({
      comments: this.comments
    });
  }

  async saveAction(actionType, finalSku) {
    const serverTime = await getServerTimeInMilliseconds();
    const action = {
      actionType: actionType,
      actionedAt: new Date(serverTime),
      actionedBy: firebase.auth().currentUser.uid
    };
    const metadata = {
      createdAt: this.metadata.createdAt,
      createdBy: this.metadata.createdBy,
      updatedAt: new Date(serverTime),
      updatedBy: firebase.auth().currentUser.uid
    };
    const docRef = collectionRef.doc(this.productRequestId);
    if (actionType === APPROVED) {
      await docRef.update({
        actions: firebase.firestore.FieldValue.arrayUnion(action),
        finalSku: finalSku,
        metadata: metadata
      });
      this.finalSku = finalSku;
    } else if (actionType === REJECTED) {
      await docRef.update({
        actions: firebase.firestore.FieldValue.arrayUnion(action),
        metadata: metadata
      });
    }
    this.metadata = metadata;
    this.actions = [...this.actions, action];
  }

  static async getPermissions() {
    const userId = firebase.auth().currentUser.uid;
    const permissions = await Permission.get('product-requests');
    for (const group in permissions.groups) {
      permissions.groups[group] = permissions.groups[group].includes(userId);
    }
    return permissions.groups;
  }

  static getListener(productRequestId) {
    return collectionRef.doc(productRequestId);
  }
}
