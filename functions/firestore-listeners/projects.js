const Notification = require('../models/notification');
const {
  NEW_PROJECT,
  EDIT_PROJECT,
  NEW_PROJECT_COMMENT
} = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const Project = require('../models/project');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { toCurrency } = require('../utils/data-transformer');

module.exports.projectCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('projects/{projectId}')
  .onCreate(async (doc, context) => {
    const { projectId } = context.params;
    await CollectionData.addCollectionData({
      document: 'projects',
      docId: projectId
    });
  });

module.exports.projectUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('projects/{projectId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new post after update with uploaded attachments
      await newDocumentHandler(change, context);
    }
    if (oldDocData.actions.length === docData.actions.length - 1) {
      //If a new entry has been added to the actions array
      await newActionHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newDocumentHandler = async (change, context) => {
  const { projectId } = context.params;
  const doc = change.after;
  const project = new Project({
    projectId: projectId,
    ...doc.data()
  });
  const action = [...project.actions].pop();
  const projectUser = await User.get(project.user);
  const projectUserFullName = projectUser.getFullName();

  const recipients = [project.user, ...project.owners];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name;
  let promises = [];
  for (const owner of project.owners) {
    promises.push(User.get(owner));
  }
  const ownerUsers = await Promise.all(promises);

  const emailData = {
    attachments: project.attachments,
    name: project.name,
    description: project.description,
    customer: project.customer.name,
    vendors: project.vendors.map((vendor) => vendor.name).join(', '),
    owners: ownerUsers.map((owner) => owner.getFullName()).join(', '),
    status: action.actionType,
    value: toCurrency(project.value)
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: project.user,
    updatedAt: new Date(),
    updatedBy: project.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/projects/${projectId}`,
      metadata: metadata,
      page: 'Projects',
      recipient: recipient,
      title: `Project "${project.name}" created by ${projectUserFullName}`,
      type: NEW_PROJECT
    });
    notifications.push(notification);
  }
  promises = [];
  project.metadata.createdNotification = true;
  promises.push(project.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { projectId } = context.params;
  const doc = change.after;
  const project = new Project({
    projectId: projectId,
    ...doc.data()
  });

  const action = [...project.actions].pop();
  const actionUser = await User.get(action.actionedBy);
  const actionUserFullName = actionUser.getFullName();

  const recipients = [action.actionedBy, ...project.owners];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name;
  const promises = [];
  for (const owner of project.owners) {
    promises.push(User.get(owner));
  }
  const ownerUsers = await Promise.all(promises);

  const emailData = {
    attachments: project.attachments,
    name: project.name,
    description: project.description,
    customer: project.customer.name,
    vendors: project.vendors.map((vendor) => vendor.name).join(', '),
    owners: ownerUsers.map((owner) => owner.getFullName()).join(', '),
    status: action.actionType,
    value: toCurrency(project.value)
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: project.user,
    updatedAt: new Date(),
    updatedBy: project.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/projects/${projectId}`,
      metadata: metadata,
      page: 'Projects',
      recipient: recipient,
      title: `Project "${project.name}" updated by ${actionUserFullName}`,
      type: EDIT_PROJECT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};

const newCommentHandler = async (change, context) => {
  const { projectId } = context.params;
  const doc = change.after;
  const project = new Project({
    projectId: projectId,
    ...doc.data()
  });

  const comment = [...project.comments].pop();
  const commentUser = await User.get(comment.user);
  const commentUserFullName = commentUser.getFullName();

  const recipients = [comment.user, ...project.owners];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    name: project.name
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
      link: `/projects/${projectId}`,
      metadata: metadata,
      page: 'Projects',
      recipient: recipient,
      title: `Project "${project.name}" New comment from ${commentUserFullName}`,
      type: NEW_PROJECT_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};
