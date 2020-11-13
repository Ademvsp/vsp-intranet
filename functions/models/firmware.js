const admin = require('firebase-admin');
const Permission = require('./permission');

module.exports = class JobDocument {
  constructor({
    firmwareId,
    actions,
    attachments,
    body,
    comments,
    metadata,
    products,
    title,
    user
  }) {
    this.firmwareId = firmwareId;
    this.actions = actions;
    this.attachments = attachments;
    this.body = body;
    this.comments = comments;
    this.metadata = metadata;
    this.products = products;
    this.title = title;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.firmwareId;
    return databaseObject;
  }

  static async getAdmins() {
    const permissions = await Permission.get('firmwares');
    return permissions.groups.admins;
  }

  async save() {
    if (this.firmwareId) {
      await admin
        .firestore()
        .collection('firmwares-new')
        .doc(this.firmwareId)
        .update(this.getDatabaseObject());
    }
  }

  async deleteAttachments() {
    await admin
      .storage()
      .bucket()
      .deleteFiles({
        prefix: `firmwares-new/${this.firmwareId}`
      });
  }
};
