const { runtimeOptions, region } = require('../utils/function-parameters');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const Notification = require('../models/notification');
const admin = require('firebase-admin');
const { NEW_USER } = require('../data/notification-types');
const { APP_NAME } = process.env;

module.exports.userCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('users/{userId}')
  .onCreate(async (doc, context) => {
    const { userId } = context.params;
    const promises = [
      CollectionData.addCollectionData({
        document: 'users',
        docId: userId
      })
    ];
    if (doc.data().active) {
      const authUser = await admin.auth().getUser(userId);
      const emailData = {
        email: authUser.email,
        phoneNumber: authUser.phoneNumber
      };
      const metadata = {
        createdAt: new Date(),
        createdBy: doc.data().metadata.createdBy,
        updatedAt: new Date(),
        updatedBy: doc.data().metadata.updatedBy
      };

      const notification = new Notification({
        emailData: emailData,
        link: '/',
        metadata: metadata,
        page: APP_NAME,
        recipient: userId,
        title: `Welcome to the ${APP_NAME} ${doc.data().firstName}!`,
        type: NEW_USER
      });
      promises.push(
        //Update collection data for active-users
        CollectionData.addCollectionData({
          document: 'active-users',
          docId: userId
        }),
        //Generate a welcome notification / email
        notification.save()
      );
    }
    await Promise.all(promises);
  });
