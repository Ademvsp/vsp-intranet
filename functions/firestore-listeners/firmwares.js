const Notification = require('../models/notification');
const {
  NEW_FIRMWARE,
  EDIT_FIRMWARE,
  NEW_FIRMWARE_COMMENT
} = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { UPDATE } = require('../data/actions');
const Firmware = require('../models/firmware');

module.exports.firmwareCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('firmwares/{firmwareId}')
  .onCreate(async (doc, context) => {
    const { firmwareId } = context.params;
    //Update the collection-data document
    await CollectionData.addCollectionData({
      document: 'firmwares',
      docId: firmwareId
    });
  });

module.exports.firmwareUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('firmwares/{firmwareId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new firmware after update with uploaded attachments
      await newDocumentHandler(change, context);
    } else if (oldDocData.actions.length === docData.actions.length - 1) {
      //Send email for any update to firmware
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newDocumentHandler = async (change, context) => {
  const { firmwareId } = context.params;
  const doc = change.after;
  const firmware = new Firmware({
    firmwareId: firmwareId,
    ...doc.data()
  });

  const action = [...firmware.actions].pop();
  const firmwareUser = await User.get(firmware.user);
  const firmwareUserFullName = firmwareUser.getFullName();

  const recipients = [firmware.user, ...action.notifyUsers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];

  const emailData = {
    attachments: firmware.attachments,
    body: firmware.body,
    products: firmware.products.join(', '),
    title: firmware.title
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: firmware.user,
    updatedAt: new Date(),
    updatedBy: firmware.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/firmware/${firmwareId}`,
      metadata: metadata,
      page: 'Firmware & Software',
      recipient: recipient,
      title: `New Firmware "${firmware.title}" uploaded by ${firmwareUserFullName}`,
      type: NEW_FIRMWARE
    });
    notifications.push(notification);
  }
  const promises = [];
  firmware.metadata.createdNotification = true;
  promises.push(firmware.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { firmwareId } = context.params;
  const doc = change.after;
  const firmware = new Firmware({
    firmwareId: firmwareId,
    ...doc.data()
  });

  const action = [...firmware.actions].pop();

  if (action.actionType === UPDATE) {
    const firmwareUser = await User.get(firmware.user);
    const firmwareUserFullName = firmwareUser.getFullName();
    const commentUsers = firmware.comments.map((comment) => comment.user);

    const recipients = [firmware.user, ...action.notifyUsers, ...commentUsers];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      attachments: firmware.attachments,
      body: firmware.body,
      products: firmware.products.join(', '),
      title: firmware.title
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: firmware.user,
      updatedAt: new Date(),
      updatedBy: firmware.user
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/firmware/${firmwareId}`,
        metadata: metadata,
        page: 'Firmware & Software',
        recipient: recipient,
        title: `Firmware "${firmware.title}" udpated by ${firmwareUserFullName}`,
        type: EDIT_FIRMWARE
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};

const newCommentHandler = async (change, context) => {
  const { firmwareId } = context.params;
  const doc = change.after;
  const firmware = new Firmware({
    firmwareId: firmwareId,
    ...doc.data()
  });

  const comment = [...firmware.comments].pop();
  const commentUser = await User.get(comment.user);
  const commentUserFullName = commentUser.getFullName();
  const commentUsers = firmware.comments.map((comment) => comment.user);

  const recipients = [comment.user, ...comment.notifyUsers, ...commentUsers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];

  const emailData = {
    attachments: comment.attachments,
    commentBody: comment.body,
    title: firmware.title
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: comment.user,
    updatedAt: new Date(),
    updatedBy: comment.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/firmware/${firmwareId}`,
      metadata: metadata,
      page: 'Firmware & Software',
      recipient: recipient,
      title: `Firmware "${firmware.title}" New comment from ${commentUserFullName}`,
      type: NEW_FIRMWARE_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};

module.exports.firmwareDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('firmwares/{firmwareId}')
  .onDelete(async (doc, context) => {
    const { firmwareId } = context.params;
    const firmware = new Firmware({
      firmwareId: firmwareId,
      ...doc.data()
    });
    const promises = [];
    promises.push(
      CollectionData.deleteCollectionData({
        document: 'firmwares',
        docId: firmwareId
      }),
      firmware.deleteAttachments()
    );
    await Promise.all(promises);
  });
