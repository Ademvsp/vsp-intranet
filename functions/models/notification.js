const admin = require('firebase-admin');

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
    const docRef = await admin
      .firestore()
      .collection('notifications-new')
      .add(this.getDatabaseObject());
    this.notificationId = docRef.id;
  }

  static async saveAll(notifications) {
    const batch = admin.firestore().batch();
    for (const notification of notifications) {
      const docRef = admin.firestore().collection('notifications-new').doc();
      batch.set(docRef, notification.getDatabaseObject());
    }
    await batch.commit();
  }
};
