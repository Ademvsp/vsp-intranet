const functions = require('firebase-functions');
const { runtimeOptions, region } = require('../utils/function-parameters');
const admin = require('firebase-admin');
const {
  UNKNOWN,
  UNAUTHENTICATED,
  PERMISSION_DENIED
} = require('../utils/error-codes');
const CollectionData = require('../models/collection-data');
const User = require('../models/user');

module.exports.getAuthPhoneNumber = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, _context) => {
    try {
      const { email } = data;
      const user = await admin.auth().getUserByEmail(email);
      return user.phoneNumber;
    } catch (error) {
      throw new functions.https.HttpsError(UNKNOWN.code, JSON.stringify(error));
    }
  });

module.exports.getUserAuthData = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, context) => {
    try {
      if (!context.auth.token.admin) {
        throw new functions.https.HttpsError(
          UNAUTHENTICATED.code,
          'User is not authenticated as an admin'
        );
      }
      const { userId } = data;
      const user = await admin.auth().getUser(userId);
      let adminPermission = false;
      if (user.customClaims && user.customClaims.admin) {
        adminPermission = user.customClaims.admin;
      }
      return {
        uid: user.uid,
        admin: adminPermission,
        disabled: user.disabled,
        email: user.email,
        phoneNumber: user.phoneNumber
      };
    } catch (error) {
      throw new functions.https.HttpsError(UNKNOWN.code, JSON.stringify(error));
    }
  });

module.exports.revokeRefreshTokens = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, context) => {
    if (!context.auth.token.admin) {
      throw new functions.https.HttpsError(
        UNAUTHENTICATED.code,
        'Authentication error'
      );
    }
    const { userId } = data;
    await admin.auth().revokeRefreshTokens(userId);
  });

module.exports.revokeCurrentRefreshTokens = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        UNAUTHENTICATED.code,
        'Authentication error'
      );
    }
    await admin.auth().revokeRefreshTokens(context.auth.uid);
  });

module.exports.createUser = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, context) => {
    try {
      if (!context.auth.token.admin) {
        throw new functions.https.HttpsError(
          UNAUTHENTICATED.code,
          'User is not authenticated as an admin'
        );
      }
      const { values } = data;
      const {
        admin: adminPermission,
        active,
        firstName,
        lastName,
        email,
        authPhone,
        phone,
        extension,
        title,
        location,
        manager
      } = values;
      const user = new User({
        active: active,
        email: email,
        extension: extension,
        firstName: firstName,
        lastName: lastName,
        location: location,
        manager: manager,
        metadata: {
          createdAt: new Date(),
          createdBy: context.auth.uid,
          updatedAt: new Date(),
          updatedBy: context.auth.uid
        },
        phone: phone,
        profilePicture: '',
        settings: {
          expandSideDrawerItems: {},
          darkMode: false,
          workFromHome: false
        },
        title: title
      });
      await user.save({ authPhone, adminPermission });
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(UNKNOWN.code, JSON.stringify(error));
    }
  });

module.exports.updateUser = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, context) => {
    try {
      if (!context.auth.token.admin) {
        throw new functions.https.HttpsError(
          UNAUTHENTICATED.code,
          'User is not authenticated as an admin'
        );
      }
      const { userId, values } = data;
      const {
        admin: adminPermission,
        active,
        firstName,
        lastName,
        email,
        authPhone,
        phone,
        extension,
        title,
        location,
        manager
      } = values;
      //Disable ability to demote yourself as a an admin, This will lock you oout of the system
      if (!adminPermission && context.auth.uid === userId) {
        throw new functions.https.HttpsError(
          PERMISSION_DENIED.code,
          'You cannot demote yourself as an Administrator. Promote another Aministrator so they can demote you.'
        );
      }
      //Disable ability to demote yourself as a an admin, This will lock you oout of the system
      if (!active && context.auth.uid === userId) {
        throw new functions.https.HttpsError(
          PERMISSION_DENIED.code,
          'You cannot disable yourself as a User. Promote another Administrator so they can disable you.'
        );
      }
      const user = new User({
        userId: userId,
        active: active,
        email: email,
        extension: extension,
        firstName: firstName,
        lastName: lastName,
        location: location,
        manager: manager,
        phone: phone,
        title: title
      });
      //Update user record on back end
      const promises = [
        user.save({
          authPhone: authPhone,
          adminPermission: adminPermission,
          updatedBy: context.auth.uid
        })
      ];
      if (active) {
        promises.push(
          //Update collection data for active-users
          CollectionData.addCollectionData({
            document: 'active-users',
            docId: userId
          })
        );
      } else {
        promises.push(
          //Update collection data for active-users
          CollectionData.deleteCollectionData({
            document: 'active-users',
            docId: userId
          }),
          //Revoke access tokens
          admin.auth().revokeRefreshTokens(userId)
        );
      }
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(UNKNOWN.code, JSON.stringify(error));
    }
  });

module.exports.updatePassword = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (data, context) => {
    if (!context.auth.token.admin) {
      throw new functions.https.HttpsError(
        UNAUTHENTICATED.code,
        'User is not authenticated as an admin'
      );
    }
    const { userId, password } = data;
    await admin.auth().updateUser(userId, {
      password: password
    });
  });
