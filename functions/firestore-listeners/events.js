const Notification = require('../models/notification');
const {
  NEW_EVENT,
  NEW_EVENT_ADMIN,
  EDIT_EVENT,
  DELETE_EVENT,
  NEW_EVENT_COMMENT,
  EDIT_EVENT_ADMIN,
  DELETE_EVENT_ADMIN
} = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const Event = require('../models/event');
const LeaveRequest = require('../models/leave-request');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { UPDATE, DELETE } = require('../data/actions');
const { SICK_LEAVE } = require('../data/events');

module.exports.eventCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('events/{eventId}')
  .onCreate(async (doc, context) => {
    const { eventId } = context.params;
    const event = new Event({
      eventId: eventId,
      ...doc.data()
    });

    const action = [...event.actions].pop();
    const createdByUser = await User.get(action.actionedBy);
    const createdByFullName = createdByUser.getFullName();

    const eventUser = await User.get(event.user);
    const eventUserFullName = eventUser.getFullName();
    const eventTitle = event.getEventTitle(eventUserFullName);

    const recipients = [
      event.user,
      createdByUser.userId,
      ...event.subscribers,
      ...action.notifyUsers
    ];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      eventTitle: eventTitle,
      start: event.start.toDate().getTime(),
      end: event.end.toDate().getTime(),
      allDay: event.allDay,
      user: createdByFullName
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: event.metadata.createdBy,
      updatedAt: new Date(),
      updatedBy: event.metadata.updatedBy
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/calendar/${eventId}`,
        metadata: metadata,
        page: 'Staff Calendar',
        recipient: recipient,
        title: `Staff Calendar "${eventTitle}" created by ${createdByFullName}`,
        type: NEW_EVENT
      });
      notifications.push(notification);
    }

    //Inform manager and leave request admins if a user puts in their sick leave
    if (event.type === SICK_LEAVE) {
      const eventManager = eventUser.manager;
      //Chcek if manager is recieving a notification already from previous loop, prevents duplicate emails
      const notificationForManagerExists = notifications.find(
        (notification) => notification.recipient === eventUser.manager
      );
      if (!notificationForManagerExists) {
        //Only if they are not already notified
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: eventManager,
            title: `Staff Calendar "${eventTitle}" created by ${createdByFullName}`,
            type: NEW_EVENT
          })
        );
      }
      const leaveRequestAdmins = await LeaveRequest.getAdmins();
      for (const leaveRequestAdmin of leaveRequestAdmins) {
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: leaveRequestAdmin,
            title: `Staff Calendar "${eventTitle}" created by ${createdByFullName}`,
            type: NEW_EVENT_ADMIN
          })
        );
      }
    }

    const promises = [
      Notification.saveAll(notifications),
      CollectionData.addCollectionData({
        document: 'events',
        docId: eventId
      })
    ];
    await Promise.all(promises);
  });

module.exports.eventUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('events/{eventId}')
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
  const { eventId } = context.params;
  const doc = change.after;
  const event = new Event({
    eventId: eventId,
    ...doc.data()
  });
  const action = [...event.actions].pop();
  if (action.actionType === UPDATE) {
    //Update event
    const eventUser = await User.get(event.user);
    const eventUserFullName = eventUser.getFullName();

    const updatedByUser = await User.get(action.actionedBy);
    const updatedByUserFullName = updatedByUser.getFullName();
    const eventTitle = event.getEventTitle(eventUserFullName);

    const recipients = [
      updatedByUser.userId,
      eventUser.userId,
      ...event.subscribers,
      ...action.notifyUsers
    ];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      eventTitle: eventTitle,
      start: event.start.toDate().getTime(),
      end: event.end.toDate().getTime(),
      allDay: event.allDay,
      user: updatedByUserFullName
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: updatedByUser.userId,
      updatedAt: new Date(),
      updatedBy: updatedByUser.userId
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/calendar/${eventId}`,
        metadata: metadata,
        page: 'Staff Calendar',
        recipient: recipient,
        title: `Staff Calendar "${eventTitle}" updated by ${updatedByUserFullName}`,
        type: EDIT_EVENT
      });
      notifications.push(notification);
    }

    //Inform manager and leave request admins if a user puts in their sick leave
    if (event.type === SICK_LEAVE) {
      const eventManager = eventUser.manager;
      //Chcek if manager is recieving a notification already from previous loop, prevents duplicate emails
      const notificationForManagerExists = notifications.find(
        (notification) => notification.recipient === eventUser.manager
      );
      if (!notificationForManagerExists) {
        //Only if they are not already notified
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: eventManager,
            title: `Staff Calendar "${eventTitle}" updated by ${updatedByUserFullName}`,
            type: EDIT_EVENT
          })
        );
      }
      const leaveRequestAdmins = await LeaveRequest.getAdmins();
      for (const leaveRequestAdmin of leaveRequestAdmins) {
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: leaveRequestAdmin,
            title: `Staff Calendar "${eventTitle}" updated by ${updatedByUserFullName}`,
            type: EDIT_EVENT_ADMIN
          })
        );
      }
    }

    await Notification.saveAll(notifications);
  } else if (action.actionType === DELETE) {
    //Delete event, log action as DELETE first to give chance to notify users through action[x].notifyUsers
    await event.delete();
  }
};
const newCommentHandler = async (change, context) => {
  const { eventId } = context.params;
  const doc = change.after;
  const event = new Event({
    eventId: eventId,
    ...doc.data()
  });

  const eventUser = await User.get(event.user);
  const eventUserFullName = eventUser.getFullName();
  const eventTitle = event.getEventTitle(eventUserFullName);

  const comment = [...event.comments].pop();
  const commentUser = await User.get(comment.user);

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    eventTitle: eventTitle
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: comment.metadata.createdBy,
    updatedAt: new Date(),
    updatedBy: comment.metadata.updatedBy
  };
  //Send notification to original event user, subscribers and notifyUsers for this comment
  const recipients = [...comment.notifyUsers, ...event.subscribers, event.user];
  const uniqueRecipients = [...new Set(recipients)];

  const notifications = [];
  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/events/${eventId}`,
      metadata: metadata,
      page: 'Staff Calendar',
      recipient: recipient,
      title: `Staff Calendar "${eventTitle}" New comment from ${commentUser.getFullName()}`,
      type: NEW_EVENT_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};

module.exports.eventDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('events/{eventId}')
  .onDelete(async (doc, context) => {
    const { eventId } = context.params;
    const event = new Event({
      eventId: eventId,
      ...doc.data()
    });
    const action = [...event.actions].pop();

    const eventUser = await User.get(event.user);
    const deletedByUser = await User.get(action.actionedBy);
    const deletedByUserFullName = deletedByUser.getFullName();
    const eventTitle = event.getEventTitle(deletedByUserFullName);
    const recipients = [
      deletedByUser.userId,
      event.user,
      ...event.subscribers,
      ...action.notifyUsers
    ];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      eventTitle: eventTitle,
      start: event.start.toDate().getTime(),
      end: event.end.toDate().getTime(),
      allDay: event.allDay,
      user: deletedByUserFullName
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: deletedByUser.userId,
      updatedAt: new Date(),
      updatedBy: deletedByUser.userId
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: '/calendar',
        metadata: metadata,
        page: 'Staff Calendar',
        recipient: recipient,
        title: `Staff Calendar "${eventTitle}" deleted by ${deletedByUserFullName}`,
        type: DELETE_EVENT
      });
      notifications.push(notification);
    }

    //Inform manager and leave request admins if a user puts in their sick leave
    if (event.type === SICK_LEAVE) {
      const eventManager = eventUser.manager;
      //Chcek if manager is recieving a notification already from previous loop, prevents duplicate emails
      const notificationForManagerExists = notifications.find(
        (notification) => notification.recipient === eventUser.manager
      );
      if (!notificationForManagerExists) {
        //Only if they are not already notified
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: eventManager,
            title: `Staff Calendar "${eventTitle}" deleted by ${deletedByUserFullName}`,
            type: DELETE_EVENT
          })
        );
      }
      const leaveRequestAdmins = await LeaveRequest.getAdmins();
      for (const leaveRequestAdmin of leaveRequestAdmins) {
        notifications.push(
          new Notification({
            emailData: emailData,
            link: `/calendar/${eventId}`,
            metadata: metadata,
            page: 'Staff Calendar',
            recipient: leaveRequestAdmin,
            title: `Staff Calendar "${eventTitle}" deleted by ${deletedByUserFullName}`,
            type: DELETE_EVENT_ADMIN
          })
        );
      }
    }

    const promises = [
      Notification.saveAll(notifications),
      CollectionData.deleteCollectionData({
        document: 'events',
        docId: eventId
      }),
      event.deleteAttachments()
    ];
    await Promise.all(promises);
  });
