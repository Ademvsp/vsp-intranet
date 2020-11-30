const dotenv = require('dotenv');
const admin = require('firebase-admin');
//Initialize upon starting server
dotenv.config();
admin.initializeApp();
admin.firestore().settings({
  ignoreUndefinedProperties: true
});

const {
  getAuthPhoneNumber,
  getUserAuthData,
  updateUser,
  createUser,
  updatePassword,
  revokeRefreshTokens,
  revokeCurrentRefreshTokens
} = require('./functions/auth.js');
const { getServerTimeInMilliseconds } = require('./utils/date');
const {
  leaveRequestCreateListener,
  leaveRequestUpdateListener
} = require('./firestore-listeners/leave-requests');
const {
  notificationCreateListener,
  notificationDeleteListener
} = require('./firestore-listeners/notifications');
const { customerCreateListener } = require('./firestore-listeners/customers');
const {
  productRequestCreateListener,
  productRequestUpdateListener
} = require('./firestore-listeners/product-requests.js');
const {
  eventCreateListener,
  eventUpdateListener,
  eventDeleteListener
} = require('./firestore-listeners/events.js');
const {
  projectCreateListener,
  projectUpdateListener
} = require('./firestore-listeners/projects.js');
const {
  postCreateListener,
  postUpdateListener
} = require('./firestore-listeners/posts.js');
const { vendorCreateListener } = require('./firestore-listeners/vendors.js');
const {
  expenseClaimCreateListener,
  expenseClaimUpdateListener
} = require('./firestore-listeners/expense-claims.js');
const {
  promotionCreateListener,
  promotionUpdateListener,
  promotionDeleteListener
} = require('./firestore-listeners/promotions.js');
const {
  jobDocumentCreateListener,
  jobDocumentUpdateListener,
  jobDocumentDeleteListener
} = require('./firestore-listeners/job-documents.js');
const {
  firmwareCreateListener,
  firmwareUpdateListener,
  firmwareDeleteListener
} = require('./firestore-listeners/firmwares.js');
const { userCreateListener } = require('./firestore-listeners/users.js');
const { dailyTasks, monthlyTasks } = require('./functions/schedule.js');
const {
  resourceDeleteListener,
  resourceCreateListener
} = require('./firestore-listeners/resource.js');

//Authentication functions
module.exports.authFunctions = {
  getAuthPhoneNumber: getAuthPhoneNumber,
  getUserAuthData: getUserAuthData,
  createUser: createUser,
  updateUser: updateUser,
  updatePassword: updatePassword,
  revokeRefreshTokens: revokeRefreshTokens,
  revokeCurrentRefreshTokens: revokeCurrentRefreshTokens
};

//Utilities
module.exports.getServerTimeInMilliseconds = getServerTimeInMilliseconds;
//Scheduled functions
module.exports.scheduledFunctions = {
  dailyTasks: dailyTasks,
  monthlyTasks: monthlyTasks
};
//Firestore listeners
module.exports.usersFirestoreListener = {
  userCreateListener: userCreateListener
};
module.exports.customersFirestoreListener = {
  customerCreateListener: customerCreateListener
};
module.exports.vendorsFirestoreListener = {
  vendorCreateListener: vendorCreateListener
};
module.exports.notificationsFirestoreListeners = {
  notificationCreateListener: notificationCreateListener,
  notificationDeleteListener: notificationDeleteListener
};
module.exports.postsFirestoreListener = {
  postCreateListener: postCreateListener,
  postUpdateListener: postUpdateListener
};
module.exports.eventsFirestoreListeners = {
  eventCreateListener: eventCreateListener,
  eventUpdateListener: eventUpdateListener,
  eventDeleteListener: eventDeleteListener
};
module.exports.projectsFirestoreListeners = {
  projectCreateListener: projectCreateListener,
  projectUpdateListener: projectUpdateListener
};
module.exports.leaveRequestsFirestoreListeners = {
  leaveRequestCreateListener: leaveRequestCreateListener,
  leaveRequestUpdateListener: leaveRequestUpdateListener
};
module.exports.productRequestsFirestoreListeners = {
  productRequestCreateListener: productRequestCreateListener,
  productRequestUpdateListener: productRequestUpdateListener
};
module.exports.expenseClaimsFirestoreListeners = {
  expenseClaimCreateListener: expenseClaimCreateListener,
  expenseClaimUpdateListener: expenseClaimUpdateListener
};
module.exports.promotionsFirestoreListener = {
  promotionCreateListener: promotionCreateListener,
  promotionUpdateListener: promotionUpdateListener,
  promotionDeleteListener: promotionDeleteListener
};
module.exports.jobDocumentsFirestoreListener = {
  jobDocumentCreateListener: jobDocumentCreateListener,
  jobDocumentUpdateListener: jobDocumentUpdateListener,
  jobDocumentDeleteListener: jobDocumentDeleteListener
};
module.exports.firmwaresFirestorListener = {
  firmwareCreateListener: firmwareCreateListener,
  firmwareUpdateListener: firmwareUpdateListener,
  firmwareDeleteListener: firmwareDeleteListener
};
module.exports.resourcesFirestoreListener = {
  resourceCreateListener: resourceCreateListener,
  resourceDeleteListener: resourceDeleteListener
};
