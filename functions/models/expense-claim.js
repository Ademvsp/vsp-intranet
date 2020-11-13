const admin = require('firebase-admin');
const Permission = require('./permission');
const collectionRef = admin.firestore().collection('expense-claims');
const { SUBMITTED } = require('../data/expense-claim-status-types');

module.exports = class ExpenseClaim {
  constructor({
    expenseClaimId,
    actions,
    attachments,
    comments,
    expenses,
    manager,
    metadata,
    status,
    user
  }) {
    this.expenseClaimId = expenseClaimId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.expenses = expenses;
    this.manager = manager;
    this.metadata = metadata;
    this.status = status;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.expenseClaimId;
    return databaseObject;
  }

  static async getAdmins() {
    const permissions = await Permission.get('expense-claims');
    return permissions.groups.admins;
  }

  async save() {
    if (this.expenseClaimId) {
      await collectionRef
        .doc(this.expenseClaimId)
        .update(this.getDatabaseObject());
    }
  }

  static async getAwaitingApproval() {
    const collection = await collectionRef
      .where('status', '==', SUBMITTED)
      .get();
    const expenseClaims = collection.docs.map(
      (doc) => new ExpenseClaim({ expenseClaimId: doc.id, ...doc.data() })
    );
    return expenseClaims;
  }
};
