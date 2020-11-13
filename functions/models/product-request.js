const admin = require('firebase-admin');
const Permission = require('./permission');
const collectionRef = admin.firestore().collection('product-requests');
const { REQUESTED } = require('../data/request-status-types');
module.exports = class ProductRequest {
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
    status,
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
    this.status = status;
    this.user = user;
    this.vendor = vendor;
    this.vendorSku = vendorSku;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.productRequestId;
    return databaseObject;
  }

  static async getAdmins() {
    const permissions = await Permission.get('product-requests');
    return permissions.groups.admins;
  }

  async save() {
    if (this.productRequestId) {
      await collectionRef
        .doc(this.productRequestId)
        .update(this.getDatabaseObject());
    }
  }

  static async getAwaitingApproval() {
    const collection = await collectionRef
      .where('status', '==', REQUESTED)
      .get();
    const productRequests = collection.docs.map(
      (doc) => new ProductRequest({ productRequestId: doc.id, ...doc.data() })
    );
    return productRequests;
  }
};
