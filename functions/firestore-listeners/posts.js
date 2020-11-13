const Notification = require('../models/notification');
const { NEW_POST, NEW_POST_COMMENT } = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const Post = require('../models/posts');

module.exports.postCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('posts/{postId}')
  .onCreate(async (doc, context) => {
    const { postId } = context.params;
    //Update the collection-data document
    await CollectionData.addCollectionData({
      document: 'posts',
      docId: postId
    });
  });

module.exports.postUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new post after update with uploaded attachments
      await newDocumentHandler(change, context);
    } else if (oldDocData.comments.length === docData.comments.length - 1) {
      //If a new comment has been addded to the comments array
      await newCommentHandler(change, context);
    }
  });

const newDocumentHandler = async (change, context) => {
  const { postId } = context.params;
  const doc = change.after;
  const post = new Post({
    postId: postId,
    ...doc.data()
  });

  const action = [...post.actions].pop();
  const postUser = await User.get(post.user);
  const postUserFullName = postUser.getFullName();

  const recipients = [post.user, ...action.notifyUsers, ...post.subscribers];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];

  const emailData = {
    body: post.body,
    attachments: post.attachments,
    title: post.title
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: post.user,
    updatedAt: new Date(),
    updatedBy: post.user
  };

  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/newsfeed/${postId}`,
      metadata: metadata,
      page: 'News Feed',
      recipient: recipient,
      title: `News Feed "${post.title}" New post from ${postUserFullName}`,
      type: NEW_POST
    });
    notifications.push(notification);
  }
  const promises = [];
  post.metadata.createdNotification = true;
  promises.push(post.save());
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newCommentHandler = async (change, context) => {
  const { postId } = context.params;
  const doc = change.after;
  const post = new Post({
    postId: postId,
    ...doc.data()
  });

  const comment = [...post.comments].pop();
  const commentUser = await User.get(comment.user);
  const commentUserFullName = commentUser.getFullName();
  const recipients = [
    post.user,
    comment.user,
    ...comment.notifyUsers,
    ...post.subscribers
  ];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  //Retrieve owner user objects to get each full name

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    title: post.title
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
      link: `/newsfeed/${postId}`,
      metadata: metadata,
      page: 'News Feed',
      recipient: recipient,
      title: `News Feed "${post.title}" New comment from ${commentUserFullName}`,
      type: NEW_POST_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};
