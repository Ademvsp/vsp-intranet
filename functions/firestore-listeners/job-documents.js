const Notification = require('../models/notification');
const {
  NEW_JOB_DOCUMENT,
  NEW_JOB_DOCUMENT_COMMENT,
  EDIT_JOB_DOCUMENT
} = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { UPDATE } = require('../data/actions');
const JobDocument = require('../models/job-document');

module.exports.jobDocumentCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('job-documents/{jobDocumentId}')
  .onCreate(async (doc, context) => {
    const { jobDocumentId } = context.params;
    //Update the collection-data document
    await CollectionData.addCollectionData({
      document: 'job-documents',
      docId: jobDocumentId
    });
  });

module.exports.jobDocumentUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('job-documents/{jobDocumentId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new jobDocument after update with uploaded attachments
      await newDocumentHandler(change, context);
    } else if (oldDocData.actions.length === docData.actions.length - 1) {
      //Send email for any update to jobDocument
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newDocumentHandler = async (change, context) => {
  const { jobDocumentId } = context.params;
  const doc = change.after;
  const jobDocument = new JobDocument({
    jobDocumentId: jobDocumentId,
    ...doc.data()
  });

  const action = [...jobDocument.actions].pop();
  const jobDocumentUser = await User.get(jobDocument.user);
  const jobDocumentUserFullName = jobDocumentUser.getFullName();

  const recipients = [jobDocument.user, ...action.notifyUsers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];

  const emailData = {
    attachments: jobDocument.attachments,
    body: jobDocument.body,
    customer: jobDocument.customer.name,
    salesOrder: jobDocument.salesOrder,
    siteReference: jobDocument.siteReference
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: jobDocument.user,
    updatedAt: new Date(),
    updatedBy: jobDocument.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/job-documents/${jobDocumentId}`,
      metadata: metadata,
      page: 'Job Documents',
      recipient: recipient,
      title: `New Job Documents uploaded for Sales Order ${jobDocument.salesOrder} by ${jobDocumentUserFullName}`,
      type: NEW_JOB_DOCUMENT
    });
    notifications.push(notification);
  }
  const promises = [];
  jobDocument.metadata.createdNotification = true;
  promises.push(jobDocument.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { jobDocumentId } = context.params;
  const doc = change.after;
  const jobDocument = new JobDocument({
    jobDocumentId: jobDocumentId,
    ...doc.data()
  });

  const action = [...jobDocument.actions].pop();

  if (action.actionType === UPDATE) {
    const jobDocumentUser = await User.get(jobDocument.user);
    const jobDocumentUserFullName = jobDocumentUser.getFullName();
    const commentUsers = jobDocument.comments.map((comment) => comment.user);

    const recipients = [
      jobDocument.user,
      ...action.notifyUsers,
      ...commentUsers
    ];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const emailData = {
      attachments: jobDocument.attachments,
      body: jobDocument.body,
      customer: jobDocument.customer.name,
      salesOrder: jobDocument.salesOrder,
      siteReference: jobDocument.siteReference
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: jobDocument.user,
      updatedAt: new Date(),
      updatedBy: jobDocument.user
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/job-documents/${jobDocumentId}`,
        metadata: metadata,
        page: 'Job Documents',
        recipient: recipient,
        title: `Job Documents for Sales Order ${jobDocument.salesOrder} updated by ${jobDocumentUserFullName}`,
        type: EDIT_JOB_DOCUMENT
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};

const newCommentHandler = async (change, context) => {
  const { jobDocumentId } = context.params;
  const doc = change.after;
  const jobDocument = new JobDocument({
    jobDocumentId: jobDocumentId,
    ...doc.data()
  });

  const comment = [...jobDocument.comments].pop();
  const commentUser = await User.get(comment.user);
  const commentUserFullName = commentUser.getFullName();
  const commentUsers = jobDocument.comments.map((comment) => comment.user);

  const recipients = [comment.user, ...comment.notifyUsers, ...commentUsers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name

  const emailData = {
    attachments: comment.attachments,
    commentBody: comment.body,
    salesOrder: jobDocument.salesOrder
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
      link: `/job-documents/${jobDocumentId}`,
      metadata: metadata,
      page: 'Job Documents',
      recipient: recipient,
      title: `Job Documents for Sales Order ${jobDocument.salesOrder} New comment from ${commentUserFullName}`,
      type: NEW_JOB_DOCUMENT_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};

module.exports.jobDocumentDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('job-documents/{jobDocumentId}')
  .onDelete(async (doc, context) => {
    const { jobDocumentId } = context.params;
    const jobDocument = new JobDocument({
      jobDocumentId: jobDocumentId,
      ...doc.data()
    });
    const promises = [];
    promises.push(
      CollectionData.deleteCollectionData({
        document: 'job-documents',
        docId: jobDocumentId
      }),
      jobDocument.deleteAttachments()
    );
    await Promise.all(promises);
  });
