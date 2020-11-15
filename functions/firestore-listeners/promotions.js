const Notification = require('../models/notification');
const {
  NEW_PROMOTION,
  NEW_PROMOTION_COMMENT,
  EDIT_PROMOTION
} = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const Promotion = require('../models/promotion');
const { format } = require('date-fns');
const { LONG_DATE } = require('../utils/date');
const { UPDATE } = require('../data/actions');

module.exports.promotionCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('promotions/{promotionId}')
  .onCreate(async (doc, context) => {
    const { promotionId } = context.params;
    //Update the collection-data document
    await CollectionData.addCollectionData({
      document: 'promotions',
      docId: promotionId
    });
  });

module.exports.promotionUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('promotions/{promotionId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new promotion after update with uploaded attachments
      await newDocumentHandler(change, context);
    } else if (oldDocData.actions.length === docData.actions.length - 1) {
      //Send email for any update to promotion
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
    // else if (oldDocData.likes.length === docData.likes.length - 1) {
    // 	await newLikeHandler(change, context);
    // }
  });

const newDocumentHandler = async (change, context) => {
  const { promotionId } = context.params;
  const doc = change.after;
  const promotion = new Promotion({
    promotionId: promotionId,
    ...doc.data()
  });

  const action = [...promotion.actions].pop();
  const promotionUser = await User.get(promotion.user);
  const promotionUserFullName = promotionUser.getFullName();
  const promotionAdmins = await Promotion.getAdmins();

  const recipients = [
    promotion.user,
    ...action.notifyUsers,
    ...promotionAdmins
  ];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];

  let expiry = 'No Expiry Date';
  if (promotion.expiry) {
    expiry = format(promotion.expiry.toDate(), LONG_DATE);
  }

  const emailData = {
    body: promotion.body,
    attachments: promotion.attachments,
    title: promotion.title,
    expiry: expiry
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: promotion.user,
    updatedAt: new Date(),
    updatedBy: promotion.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/promotions/${promotionId}`,
      metadata: metadata,
      page: 'Promotions',
      recipient: recipient,
      title: `Promotions "${promotion.title}" New Promotion posted by ${promotionUserFullName}`,
      type: NEW_PROMOTION
    });
    notifications.push(notification);
  }
  const promises = [];
  promotion.metadata.createdNotification = true;
  promises.push(promotion.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { promotionId } = context.params;
  const doc = change.after;
  const promotion = new Promotion({
    promotionId: promotionId,
    ...doc.data()
  });

  const action = [...promotion.actions].pop();

  if (action.actionType === UPDATE) {
    const promotionUser = await User.get(promotion.user);
    const promotionUserFullName = promotionUser.getFullName();
    const commentUsers = promotion.comments.map((comment) => comment.user);
    const promotionAdmins = await Promotion.getAdmins();

    const recipients = [
      promotion.user,
      ...action.notifyUsers,
      ...commentUsers,
      ...promotionAdmins
    ];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    let expiry = 'No Expiry Date';
    if (promotion.expiry) {
      expiry = format(promotion.expiry.toDate(), LONG_DATE);
    }

    const emailData = {
      body: promotion.body,
      attachments: promotion.attachments,
      title: promotion.title,
      expiry: expiry
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: promotion.user,
      updatedAt: new Date(),
      updatedBy: promotion.user
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/promotions/${promotionId}`,
        metadata: metadata,
        page: 'Promotions',
        recipient: recipient,
        title: `Promotions "${promotion.title}" Existing Promotion updated by ${promotionUserFullName}`,
        type: EDIT_PROMOTION
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};

const newCommentHandler = async (change, context) => {
  const { promotionId } = context.params;
  const doc = change.after;
  const promotion = new Promotion({
    promotionId: promotionId,
    ...doc.data()
  });

  const comment = [...promotion.comments].pop();
  const commentUser = await User.get(comment.user);
  const commentUserFullName = commentUser.getFullName();
  const recipients = [comment.user, ...comment.notifyUsers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    title: promotion.title
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
      link: `/promotions/${promotionId}`,
      metadata: metadata,
      page: 'Promotions',
      recipient: recipient,
      title: `Promotions "${promotion.title}" New comment from ${commentUserFullName}`,
      type: NEW_PROMOTION_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};

module.exports.promotionDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('promotions/{promotionId}')
  .onDelete(async (doc, context) => {
    const { promotionId } = context.params;
    const promotion = new Promotion({
      promotionId: promotionId,
      ...doc.data()
    });
    const promises = [
      CollectionData.deleteCollectionData({
        document: 'promotions',
        docId: promotionId
      }),
      promotion.deleteAttachments()
    ];
    await Promise.all(promises);
  });
