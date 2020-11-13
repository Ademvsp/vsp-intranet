const admin = require('firebase-admin');
const Permission = require('./permission');
const collectionRef = admin.firestore().collection('leave-requests');
const { REQUESTED } = require('../data/request-status-types');

module.exports = class LeaveRequest {
  constructor({
    leaveRequestId,
    actions,
    comments,
    end,
    manager,
    metadata,
    reason,
    start,
    status,
    type,
    user
  }) {
    this.leaveRequestId = leaveRequestId;
    this.actions = actions;
    this.comments = comments;
    this.end = end;
    this.manager = manager;
    this.metadata = metadata;
    this.reason = reason;
    this.start = start;
    this.status = status;
    this.type = type;
    this.user = user;
  }

  static async getAdmins() {
    const permissions = await Permission.get('leave-requests');
    return permissions.groups.admins;
  }

  static async getAwaitingApproval() {
    const collection = await collectionRef
      .where('status', '==', REQUESTED)
      .get();
    const leaveRequests = collection.docs.map(
      (doc) => new LeaveRequest({ leaveRequestId: doc.id, ...doc.data() })
    );
    return leaveRequests;
  }
};
