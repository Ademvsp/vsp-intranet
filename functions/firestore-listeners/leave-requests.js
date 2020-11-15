const Notification = require('../models/notification');
const { format } = require('date-fns');
const { LONG_DATE } = require('../utils/date');
const {
  NEW_LEAVE_REQUEST_USER,
  NEW_LEAVE_REQUEST_MANAGER,
  APPROVED_LEAVE_REQUEST_USER,
  APPROVED_LEAVE_REQUEST_ADMIN,
  REJECTED_LEAVE_REQUEST_USER,
  NEW_LEAVE_REQUEST_COMMENT
} = require('../data/notification-types');
const { APPROVED, REJECTED } = require('../data/request-status-types');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const LeaveRequest = require('../models/leave-request');
const Event = require('../models/event');
const { CREATE } = require('../data/actions');

module.exports.leaveRequestCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('leave-requests/{leaveRequestId}')
  .onCreate(async (doc, context) => {
    const { leaveRequestId } = context.params;
    const leaveRequest = new LeaveRequest({
      leaveRequestId: leaveRequestId,
      ...doc.data()
    });
    const leaveRequestUser = await User.get(leaveRequest.user);
    const manager = await User.get(leaveRequest.manager);
    const emailData = {
      type: leaveRequest.type,
      start: format(leaveRequest.start.toDate(), LONG_DATE),
      end: format(leaveRequest.end.toDate(), LONG_DATE),
      reason: leaveRequest.reason,
      manager: manager.getFullName()
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: leaveRequest.user,
      updatedAt: new Date(),
      updatedBy: leaveRequest.user
    };
    //Send user an email and notification
    const userNotification = new Notification({
      notificationId: null,
      emailData: emailData,
      link: `/leave-requests/${leaveRequestId}`,
      metadata: metadata,
      page: 'Leave Requests',
      recipient: leaveRequestUser.userId,
      title: `Your ${leaveRequest.type} Request has been submitted successfully`,
      type: NEW_LEAVE_REQUEST_USER
    });
    //Send manager an email and notification
    const managerNotification = new Notification({
      notificationId: null,
      emailData: emailData,
      link: `/leave-requests/${leaveRequestId}`,
      metadata: metadata,
      page: 'Leave Requests',
      recipient: manager.userId,
      title: `New ${
        leaveRequest.type
      } Request from ${leaveRequestUser.getFullName()} is awaiting your Approval`,
      type: NEW_LEAVE_REQUEST_MANAGER
    });
    const promises = [];
    promises.push(
      Notification.saveAll([userNotification, managerNotification]),
      //Update the collection-data document
      CollectionData.addCollectionData({
        document: 'leave-requests',
        docId: leaveRequestId
      }),
      //Update the collection-data document for the user
      CollectionData.addSubCollectionData({
        document: 'leave-requests',
        subCollection: 'users',
        subCollectionDoc: leaveRequestUser.userId,
        docId: leaveRequestId
      }),
      //Update the collection-data document for the manager
      CollectionData.addSubCollectionData({
        document: 'leave-requests',
        subCollection: 'users',
        subCollectionDoc: manager.userId,
        docId: leaveRequestId
      })
    );
    await Promise.all(promises);
  });

module.exports.leaveRequestUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('leave-requests/{leaveRequestId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (oldDocData.actions.length === docData.actions.length - 1) {
      //If a new entry has been added to the actions array
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newActionHandler = async (change, context) => {
  const { leaveRequestId } = context.params;
  const doc = change.after;
  const leaveRequest = new LeaveRequest({
    leaveRequestId: leaveRequestId,
    ...doc.data()
  });

  const action = [...leaveRequest.actions].pop();
  const leaveRequestUser = await User.get(leaveRequest.user);
  const manager = await User.get(leaveRequest.manager);
  const admins = await LeaveRequest.getAdmins();
  const promises = [];
  //Change notification template type depending on action
  let userNotificationType, adminNotificationType;
  if (action.actionType === APPROVED) {
    userNotificationType = APPROVED_LEAVE_REQUEST_USER;
    adminNotificationType = APPROVED_LEAVE_REQUEST_ADMIN;
    //Create calendar event automatically
    const event = new Event({
      actions: [
        {
          actionType: CREATE,
          actionedAt: new Date(),
          actionedBy: action.actionedBy,
          notifyUsers: [leaveRequest.manager, leaveRequest.user]
        }
      ],
      allDay: true,
      comments: [],
      details: leaveRequest.reason,
      end: leaveRequest.end,
      locations: [leaveRequestUser.location],
      metadata: {
        createdAt: new Date(),
        createdBy: action.actionedBy,
        updatedAt: new Date(),
        updatedBy: action.actionedBy
      },
      start: leaveRequest.start,
      subscribers: [leaveRequestUser.userId],
      type: leaveRequest.type,
      user: leaveRequestUser.userId
    });
    promises.push(event.save());
  } else if (action.actionType === REJECTED) {
    userNotificationType = REJECTED_LEAVE_REQUEST_USER;
  }

  const emailData = {
    type: leaveRequest.type,
    start: format(leaveRequest.start.toDate(), LONG_DATE),
    end: format(leaveRequest.end.toDate(), LONG_DATE),
    reason: leaveRequest.reason,
    manager: manager.getFullName(),
    user: leaveRequestUser.getFullName()
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: action.actionedBy,
    updatedAt: new Date(),
    updatedBy: action.actionedBy
  };

  const notifications = [];
  //Send user an email and notification
  const userNotification = new Notification({
    emailData: emailData,
    link: `/leave-requests/${leaveRequestId}`,
    metadata: metadata,
    page: 'Leave Requests',
    recipient: leaveRequestUser.userId,
    title: `Your ${leaveRequest.type} Request has been ${action.actionType}`,
    type: userNotificationType
  });
  notifications.push(userNotification);
  //Send all admins an email and notification (Only for approval, not rejection)
  if (action.actionType !== REJECTED) {
    for (const admin of admins) {
      const adminNotification = new Notification({
        emailData: emailData,
        link: `/leave-requests/${leaveRequestId}`,
        metadata: metadata,
        page: 'Leave Requests',
        recipient: admin,
        title: `${
          leaveRequest.type
        } Request from ${leaveRequestUser.getFullName()} has been ${
          action.actionType
        }`,
        type: adminNotificationType
      });
      notifications.push(adminNotification);
    }
  }
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newCommentHandler = async (change, context) => {
  const { leaveRequestId } = context.params;
  const doc = change.after;
  const leaveRequest = new LeaveRequest({
    leaveRequestId: leaveRequestId,
    ...doc.data()
  });

  const comment = [...leaveRequest.comments].pop();
  const commentUser = await User.get(comment.user);
  const admins = await LeaveRequest.getAdmins();

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    type: leaveRequest.type
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: comment.metadata.createdBy,
    updatedAt: new Date(),
    updatedBy: comment.metadata.updatedBy
  };

  const recipients = [...admins, leaveRequest.user, leaveRequest.manager];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/leave-requests/${leaveRequestId}`,
      metadata: metadata,
      page: 'Leave Requests',
      recipient: recipient,
      title: `Leave Request "${
        leaveRequest.type
      }" New comment from ${commentUser.getFullName()}`,
      type: NEW_LEAVE_REQUEST_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};
