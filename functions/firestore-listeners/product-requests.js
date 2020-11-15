const Notification = require('../models/notification');
const {
  NEW_PRODUCT_REQUEST_USER,
  NEW_PRODUCT_REQUEST_ADMIN,
  APPROVED_PRODUCT_REQUEST,
  REJECTED_PRODUCT_REQUEST,
  NEW_PRODUCT_REQUEST_COMMENT
} = require('../data/notification-types');
const { APPROVED, REJECTED } = require('../data/request-status-types');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const ProductRequest = require('../models/product-request');
const { toCurrency } = require('../utils/data-transformer');

module.exports.productRequestCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('product-requests/{productRequestId}')
  .onCreate(async (doc, context) => {
    const { productRequestId } = context.params;
    const productRequest = new ProductRequest({
      productRequestId: productRequestId,
      ...doc.data()
    });
    const promises = [
      //Update the collection-data document
      CollectionData.addCollectionData({
        document: 'product-requests',
        docId: productRequestId
      }),
      //Update the collection-data document for the user
      CollectionData.addSubCollectionData({
        document: 'product-requests',
        subCollection: 'users',
        subCollectionDoc: productRequest.user,
        docId: productRequestId
      })
    ];
    await Promise.all(promises);
  });

module.exports.productRequestUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('product-requests/{productRequestId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new product request after update with uploaded attachments
      await newDocumentHandler(change, context);
    } else if (oldDocData.actions.length === docData.actions.length - 1) {
      //If a new entry has been added to the actions array
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newDocumentHandler = async (change, context) => {
  const { productRequestId } = context.params;
  const doc = change.after;
  const productRequest = new ProductRequest({
    productRequestId: productRequestId,
    ...doc.data()
  });
  const productRequestUser = await User.get(productRequest.user);
  const admins = await ProductRequest.getAdmins();

  const emailData = {
    attachments: productRequest.attachments,
    vendor: productRequest.vendor.name,
    vendorSku: productRequest.vendorSku,
    productType: productRequest.productType,
    cost: toCurrency(productRequest.cost),
    description: productRequest.description
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: productRequest.user,
    updatedAt: new Date(),
    updatedBy: productRequest.user
  };

  const notifications = [];
  //Send user an email and notification
  const userNotification = new Notification({
    notificationId: null,
    emailData: emailData,
    link: `/product-requests/${productRequestId}`,
    metadata: metadata,
    page: 'Product Requests',
    recipient: productRequestUser.userId,
    title: `Your Product Request for "${productRequest.vendorSku}" has been submitted successfully`,
    type: NEW_PRODUCT_REQUEST_USER
  });
  notifications.push(userNotification);

  //Send admins an email and notification
  for (const admin of admins) {
    const adminNotification = new Notification({
      notificationId: null,
      emailData: emailData,
      link: `/product-requests/${productRequestId}`,
      metadata: metadata,
      page: 'Product Requests',
      recipient: admin,
      title: `New Product Request from ${productRequestUser.getFullName()} is awaiting your Approval`,
      type: NEW_PRODUCT_REQUEST_ADMIN
    });
    notifications.push(adminNotification);
  }
  const promises = [];
  productRequest.metadata.createdNotification = true;
  promises.push(productRequest.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { productRequestId } = context.params;
  const doc = change.after;
  const productRequest = new ProductRequest({
    productRequestId: productRequestId,
    ...doc.data()
  });
  const action = [...productRequest.actions].pop();
  const productRequestUser = await User.get(productRequest.user);
  //Change notification template type depending on action
  let userNotificationType;
  if (action.actionType === APPROVED) {
    userNotificationType = APPROVED_PRODUCT_REQUEST;
  } else if (action.actionType === REJECTED) {
    userNotificationType = REJECTED_PRODUCT_REQUEST;
  }
  const emailData = {
    vendorSku: productRequest.vendorSku,
    finalSku: productRequest.finalSku || ''
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: action.actionedBy,
    updatedAt: new Date(),
    updatedBy: action.actionedBy
  };
  //Send user an email and notification
  const userNotification = new Notification({
    emailData: emailData,
    link: `/product-requests/${productRequestId}`,
    metadata: metadata,
    page: 'Product Requests',
    recipient: productRequestUser.userId,
    title: `Product Request for "${productRequest.vendorSku}" has been ${action.actionType}`,
    type: userNotificationType
  });
  await userNotification.save();
};

const newCommentHandler = async (change, context) => {
  const { productRequestId } = context.params;
  const doc = change.after;
  const productRequest = new ProductRequest({
    productRequestId: productRequestId,
    ...doc.data()
  });

  const comment = [...productRequest.comments].pop();
  const commentUser = await User.get(comment.user);
  const admins = await ProductRequest.getAdmins();

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    type: productRequest.type,
    vendorSku: productRequest.vendorSku
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: comment.metadata.createdBy,
    updatedAt: new Date(),
    updatedBy: comment.metadata.updatedBy
  };

  const recipients = [...admins, productRequest.user];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/product-requests/${productRequestId}`,
      metadata: metadata,
      page: 'Product Requests',
      recipient: recipient,
      title: `Product Request "${
        productRequest.vendorSku
      }" New comment from ${commentUser.getFullName()}`,
      type: NEW_PRODUCT_REQUEST_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};
