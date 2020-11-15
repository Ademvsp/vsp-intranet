const admin = require('firebase-admin');
const Permission = require('./permission');
const collectionRef = admin.firestore().collection('promotions');
module.exports = class Promotion {
  constructor({
    promotionId,
    actions,
    attachments,
    body,
    comments,
    expiry,
    likes,
    metadata,
    title,
    user
  }) {
    this.actions = actions;
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

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.promotionId;
    return databaseObject;
  }

  static async getAdmins() {
    const permissions = await Permission.get('promotions');
    return permissions.groups.admins;
  }

  async save() {
    if (this.promotionId) {
      await collectionRef
        .doc(this.promotionId)
        .update(this.getDatabaseObject());
    }
  }

  async deleteAttachments() {
    await admin
      .storage()
      .bucket()
      .deleteFiles({
        prefix: `promotions/${this.promotionId}`
      });
  }
};
