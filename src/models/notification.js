import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('notifications');

export default class Notification {
  constructor({
    notificationId,
    emailData,
    link,
    metadata,
    page,
    recipient,
    title,
    type
  }) {
    this.notificationId = notificationId;
    this.emailData = emailData;
    this.link = link;
    this.metadata = metadata;
    this.page = page;
    this.recipient = recipient;
    this.title = title;
    this.type = type;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.notificationId;
    return databaseObject;
  }

  async delete() {
    await collectionRef.doc(this.notificationId).delete();
  }

  static async deleteAll(notifications) {
    const batch = firebase.firestore().batch();
    for (const notification of notifications) {
      const docRef = collectionRef.doc(notification.notificationId);
      batch.delete(docRef);
    }
    await batch.commit();
  }

  static getListener(userId) {
    const ONE_MONTH_MILLISECONDS = 2592000000;
    const ONE_MONTH_AGO_MILLISECONDS =
      new Date().getTime() - ONE_MONTH_MILLISECONDS;
    const ONE_MONTH_AGO_DATE = new Date(ONE_MONTH_AGO_MILLISECONDS);
    const ONE_MONTH_AGO_TIMESTAMP = firebase.firestore.Timestamp.fromDate(
      ONE_MONTH_AGO_DATE
    );

    return collectionRef
      .where('recipient', '==', userId)
      .where('metadata.createdAt', '>=', ONE_MONTH_AGO_TIMESTAMP);
  }
}
