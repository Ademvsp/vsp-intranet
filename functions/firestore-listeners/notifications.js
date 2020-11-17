const Notification = require('../models/notification');
const functions = require('firebase-functions');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const {
  NEW_POST,
  NEW_EVENT,
  NEW_POST_COMMENT,
  EDIT_EVENT,
  DELETE_EVENT,
  NEW_PROJECT,
  EDIT_PROJECT,
  NEW_PROJECT_COMMENT,
  NEW_PRODUCT_REQUEST_USER,
  NEW_PRODUCT_REQUEST_ADMIN,
  NEW_PRODUCT_REQUEST_COMMENT,
  APPROVED_PRODUCT_REQUEST,
  REJECTED_PRODUCT_REQUEST,
  NEW_LEAVE_REQUEST_USER,
  NEW_LEAVE_REQUEST_MANAGER,
  APPROVED_LEAVE_REQUEST_USER,
  APPROVED_LEAVE_REQUEST_ADMIN,
  NEW_LEAVE_REQUEST_COMMENT,
  REJECTED_LEAVE_REQUEST_USER,
  NEW_CUSTOMER,
  NEW_VENDOR,
  NEW_EXPENSE_CLAIM_USER,
  NEW_EXPENSE_CLAIM_MANAGER,
  APPROVED_EXPENSE_CLAIM_USER,
  APPROVED_EXPENSE_CLAIM_ADMIN,
  REJECTED_EXPENSE_CLAIM_USER,
  PAID_EXPENSE_CLAIM_USER,
  NEW_EXPENSE_CLAIM_COMMENT,
  NEW_EVENT_COMMENT,
  NEW_PROMOTION,
  NEW_PROMOTION_COMMENT,
  EDIT_PROMOTION,
  NEW_JOB_DOCUMENT,
  EDIT_JOB_DOCUMENT,
  NEW_JOB_DOCUMENT_COMMENT,
  NEW_FIRMWARE,
  EDIT_FIRMWARE,
  NEW_FIRMWARE_COMMENT,
  NEW_EVENT_ADMIN,
  EDIT_EVENT_ADMIN,
  DELETE_EVENT_ADMIN,
  NEW_USER,
  EVENT_REMINDER,
  PROJECT_REMINDER,
  PRODUCT_REQUEST_ACTION_REMINDER,
  LEAVE_REQUEST_ACTION_REMINDER,
  EXPENSE_CLAIM_ACTION_REMINDER,
  EXPENSE_CLAIM_PAYMENT_REMINDER
} = require('../data/notification-types');
const {
  PERMISSION_DENIED,
  UNAUTHENTICATED,
  UNKNOWN
} = require('../utils/error-codes');
const { ADMIN_FROM, ADMIN_BCC } = process.env;
const Email = require('../models/email');
const { newPost, newPostComment } = require('../email-templates/posts');
const {
  newEvent,
  editEvent,
  deleteEvent,
  newEventComment,
  editEventAdmin,
  deleteEventAdmin,
  newEventAdmin,
  eventReminder
} = require('../email-templates/events');
const {
  newProject,
  editProject,
  newProjectComment,
  projectReminder
} = require('../email-templates/projects');
const {
  newProductRequestUser,
  newProductRequestAdmin,
  newProductRequestComment,
  approvedProductRequest,
  rejectedProductRequest,
  productRequestActionReminder
} = require('../email-templates/product-requests');
const {
  newLeaveRequestUser,
  newLeaveRequestManager,
  approveLeaveRequestUser,
  approveLeaveRequestAdmin,
  newLeaveRequestComment,
  rejectLeaveRequestUser,
  leaveRequestActionReminder
} = require('../email-templates/leave-requests');
const { newCustomer } = require('../email-templates/customers');
const { newVendor } = require('../email-templates/vendors');
const {
  newExpenseClaimUser,
  newExpenseClaimManager,
  approveExpenseClaimUser,
  approveExpenseClaimAdmin,
  rejectedExpenseClaimUser,
  paidExpenseClaimUser,
  newExpenseClaimComment,
  expenseClaimActionReminder,
  expenseClaimPaymentReminder
} = require('../email-templates/expense-claims');
const {
  newPromotion,
  newPromotionComment,
  editPromotion
} = require('../email-templates/promotions');
const {
  newJobDocument,
  editJobDocument,
  newJobDocumentComment
} = require('../email-templates/job-documents');
const {
  newFirmware,
  newFirmwareComment,
  editFirmware
} = require('../email-templates/firmwares');
const { newUser } = require('../email-templates/users');
const CollectionData = require('../models/collection-data');

const sendNotification = async (notification, sender) => {
  try {
    // const { emailData, link, metadata, page, recipient, title, type } = notification;
    let html;
    switch (notification.type) {
      case NEW_USER:
        html = await newUser(notification, sender);
        break;
      case NEW_CUSTOMER:
        html = await newCustomer(notification, sender);
        break;
      case NEW_VENDOR:
        html = await newVendor(notification, sender);
        break;
      case NEW_POST:
        html = await newPost(notification, sender);
        break;
      case NEW_POST_COMMENT:
        html = await newPostComment(notification, sender);
        break;
      case NEW_EVENT:
        html = await newEvent(notification, sender);
        break;
      case NEW_EVENT_ADMIN:
        html = await newEventAdmin(notification, sender);
        break;
      case EDIT_EVENT:
        html = await editEvent(notification, sender);
        break;
      case EDIT_EVENT_ADMIN:
        html = await editEventAdmin(notification, sender);
        break;
      case DELETE_EVENT:
        html = await deleteEvent(notification, sender);
        break;
      case DELETE_EVENT_ADMIN:
        html = await deleteEventAdmin(notification, sender);
        break;
      case NEW_EVENT_COMMENT:
        html = await newEventComment(notification, sender);
        break;
      case EVENT_REMINDER:
        html = await eventReminder(notification, sender);
        break;
      case NEW_PROJECT:
        html = await newProject(notification, sender);
        break;
      case EDIT_PROJECT:
        html = await editProject(notification, sender);
        break;
      case NEW_PROJECT_COMMENT:
        html = await newProjectComment(notification, sender);
        break;
      case PROJECT_REMINDER:
        html = await projectReminder(notification, sender);
        break;
      case NEW_PRODUCT_REQUEST_USER:
        html = await newProductRequestUser(notification, sender);
        break;
      case NEW_PRODUCT_REQUEST_ADMIN:
        html = await newProductRequestAdmin(notification, sender);
        break;
      case APPROVED_PRODUCT_REQUEST:
        html = await approvedProductRequest(notification, sender);
        break;
      case REJECTED_PRODUCT_REQUEST:
        html = await rejectedProductRequest(notification, sender);
        break;
      case NEW_PRODUCT_REQUEST_COMMENT:
        html = await newProductRequestComment(notification, sender);
        break;
      case PRODUCT_REQUEST_ACTION_REMINDER:
        html = await productRequestActionReminder(notification, sender);
        break;
      case NEW_LEAVE_REQUEST_USER:
        html = await newLeaveRequestUser(notification, sender);
        break;
      case NEW_LEAVE_REQUEST_MANAGER:
        html = await newLeaveRequestManager(notification, sender);
        break;
      case APPROVED_LEAVE_REQUEST_USER:
        html = await approveLeaveRequestUser(notification, sender);
        break;
      case APPROVED_LEAVE_REQUEST_ADMIN:
        html = await approveLeaveRequestAdmin(notification, sender);
        break;
      case REJECTED_LEAVE_REQUEST_USER:
        html = await rejectLeaveRequestUser(notification, sender);
        break;
      case NEW_LEAVE_REQUEST_COMMENT:
        html = await newLeaveRequestComment(notification, sender);
        break;
      case LEAVE_REQUEST_ACTION_REMINDER:
        html = await leaveRequestActionReminder(notification, sender);
        break;
      case NEW_EXPENSE_CLAIM_USER:
        html = await newExpenseClaimUser(notification, sender);
        break;
      case NEW_EXPENSE_CLAIM_MANAGER:
        html = await newExpenseClaimManager(notification, sender);
        break;
      case APPROVED_EXPENSE_CLAIM_USER:
        html = await approveExpenseClaimUser(notification, sender);
        break;
      case APPROVED_EXPENSE_CLAIM_ADMIN:
        html = await approveExpenseClaimAdmin(notification, sender);
        break;
      case REJECTED_EXPENSE_CLAIM_USER:
        html = await rejectedExpenseClaimUser(notification, sender);
        break;
      case PAID_EXPENSE_CLAIM_USER:
        html = await paidExpenseClaimUser(notification, sender);
        break;
      case NEW_EXPENSE_CLAIM_COMMENT:
        html = await newExpenseClaimComment(notification, sender);
        break;
      case EXPENSE_CLAIM_ACTION_REMINDER:
        html = await expenseClaimActionReminder(notification, sender);
        break;
      case EXPENSE_CLAIM_PAYMENT_REMINDER:
        html = await expenseClaimPaymentReminder(notification, sender);
        break;
      case NEW_PROMOTION:
        html = await newPromotion(notification, sender);
        break;
      case EDIT_PROMOTION:
        html = await editPromotion(notification, sender);
        break;
      case NEW_PROMOTION_COMMENT:
        html = await newPromotionComment(notification, sender);
        break;
      case NEW_JOB_DOCUMENT:
        html = await newJobDocument(notification, sender);
        break;
      case EDIT_JOB_DOCUMENT:
        html = await editJobDocument(notification, sender);
        break;
      case NEW_JOB_DOCUMENT_COMMENT:
        html = await newJobDocumentComment(notification, sender);
        break;
      case NEW_FIRMWARE:
        html = await newFirmware(notification, sender);
        break;
      case EDIT_FIRMWARE:
        html = await editFirmware(notification, sender);
        break;
      case NEW_FIRMWARE_COMMENT:
        html = await newFirmwareComment(notification, sender);
        break;
      default:
        break;
    }
    await sendEmail({
      subject: notification.title,
      html: html,
      recipient: notification.recipient
    });
  } catch (error) {
    throw new functions.https.HttpsError(
      UNAUTHENTICATED.code,
      'Authentication error'
    );
  }
};

const sendEmail = async (emailParams) => {
  // const { sender, subject, body, bcc, recipient } = emailParams;
  const { subject, html, recipient } = emailParams;
  let bcc = ADMIN_BCC ? ADMIN_BCC : '';
  const email = new Email({
    from: ADMIN_FROM,
    to: recipient.email,
    bcc: bcc,
    subject: subject,
    html: html
  });
  await email.send();
};

module.exports.notificationCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('/notifications/{notificationId}')
  .onCreate(async (doc, context) => {
    try {
      const { notificationId } = context.params;
      if (!doc.data().metadata.createdBy) {
        throw new functions.https.HttpsError(
          UNKNOWN.code,
          'Authentication error'
        );
      }
      const notification = new Notification({
        ...doc.data(),
        notificationId: notificationId
      });
      const sender = await User.get(notification.metadata.createdBy);
      const recipient = await User.get(notification.recipient);
      notification.recipient = recipient;

      const promises = [
        sendNotification(notification, sender),
        CollectionData.addCollectionData({
          document: 'notifications',
          docId: notification.notificationId
        })
      ];
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        PERMISSION_DENIED.code,
        'Notifiation error',
        error
      );
    }
  });

module.exports.notificationDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('/notifications/{notificationId}')
  .onDelete(async (doc, context) => {
    const { notificationId } = context.params;
    const notification = new Notification({
      notificationId: notificationId,
      ...doc.data()
    });
    await CollectionData.deleteCollectionData({
      document: 'notifications',
      docId: notification.notificationId
    });
  });
