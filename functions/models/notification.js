const admin = require('firebase-admin');
const collectionRef = admin.firestore().collection('notifications');
module.exports = class Notification {
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
    this.metadata = metadata;
    this.type = type;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.notificationId;
    return databaseObject;
  }

  async save() {
    const docRef = await collectionRef.add(this.getDatabaseObject());
    this.notificationId = docRef.id;
  }

  static async saveAll(notifications) {
    const promises = [];
    let batch = admin.firestore().batch();
    let count = 0;
    for (const notification of notifications) {
      const docRef = collectionRef.doc();
      batch.set(docRef, notification.getDatabaseObject());
      count++;
      if (count === 500) {
        promises.push(batch.commit());
        batch = admin.firestore().batch();
        count = 0;
      }
    }
    promises.push(batch.commit());
    await Promise.all(promises);
  }

  static async deleteAll(notifications) {
    const promises = [];
    let batch = admin.firestore().batch();
    let count = 0;
    for (const notification of notifications) {
      const docRef = collectionRef.doc(notification.notificationId);
      batch.delete(docRef, notification.getDatabaseObject());
      count++;
      if (count === 500) {
        promises.push(batch.commit());
        batch = admin.firestore().batch();
        count = 0;
      }
    }
    promises.push(batch.commit());
    await Promise.all(promises);
  }

  static async getOlderThan(date) {
    const collection = await collectionRef
      .where(
        'metadata.createdAt',
        '<=',
        admin.firestore.Timestamp.fromDate(date)
      )
      .get();
    const events = collection.docs.map(
      (doc) =>
        new Notification({
          notificationId: doc.id,
          ...doc.data()
        })
    );
    return events;
  }
};
