const admin = require('firebase-admin');
const Permission = require('./permission');
const collectionRef = admin.firestore().collection('job-documents');

module.exports = class JobDocument {
  constructor({
    jobDocumentId,
    actions,
    attachments,
    body,
    comments,
    customer,
    metadata,
    salesOrder,
    siteReference,
    user
  }) {
    this.jobDocumentId = jobDocumentId;
    this.actions = actions;
    this.attachments = attachments;
    this.body = body;
    this.comments = comments;
    this.customer = customer;
    this.metadata = metadata;
    this.salesOrder = salesOrder;
    this.siteReference = siteReference;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.jobDocumentId;
    return databaseObject;
  }

  static async getAdmins() {
    const permissions = await Permission.get('job-documents');
    return permissions.groups.admins;
  }

  async save() {
    if (this.jobDocumentId) {
      await collectionRef
        .doc(this.jobDocumentId)
        .update(this.getDatabaseObject());
    }
  }

  async deleteAttachments() {
    await admin
      .storage()
      .bucket()
      .deleteFiles({
        prefix: `job-documents/${this.jobDocumentId}`
      });
  }
};
