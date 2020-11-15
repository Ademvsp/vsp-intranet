const Notification = require('../models/notification');
const {
  NEW_EXPENSE_CLAIM_USER,
  NEW_EXPENSE_CLAIM_MANAGER,
  APPROVED_EXPENSE_CLAIM_USER,
  APPROVED_EXPENSE_CLAIM_ADMIN,
  REJECTED_EXPENSE_CLAIM_USER,
  PAID_EXPENSE_CLAIM_USER,
  NEW_EXPENSE_CLAIM_COMMENT
} = require('../data/notification-types');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const ExpenseClaim = require('../models/expense-claim');
const { toCurrency } = require('../utils/data-transformer');
const {
  APPROVED,
  REJECTED,
  PAID
} = require('../data/expense-claim-status-types');

module.exports.expenseClaimCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('expense-claims/{expenseClaimId}')
  .onCreate(async (doc, context) => {
    const { expenseClaimId } = context.params;
    const expenseClaim = new ExpenseClaim({
      expenseClaimId: expenseClaimId,
      ...doc.data()
    });
    const promises = [];
    //Update the collection-data document
    promises.push(
      CollectionData.addCollectionData({
        document: 'expense-claims',
        docId: expenseClaimId
      }),
      //Update the collection-data document for the user
      CollectionData.addSubCollectionData({
        document: 'expense-claims',
        subCollection: 'users',
        subCollectionDoc: expenseClaim.user,
        docId: expenseClaimId
      }),
      //Update the collection-data document for the manager
      CollectionData.addSubCollectionData({
        document: 'expense-claims',
        subCollection: 'users',
        subCollectionDoc: expenseClaim.manager,
        docId: expenseClaimId
      })
    );
    await Promise.all(promises);
  });

module.exports.expenseClaimUpdateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('expense-claims/{expenseClaimId}')
  .onUpdate(async (change, context) => {
    const oldDocData = change.before.data();
    const docData = change.after.data();
    if (!docData.metadata.createdNotification) {
      //Send email for new expense claim after update with uploaded attachments
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
  const { expenseClaimId } = context.params;
  const doc = change.after;
  const expenseClaim = new ExpenseClaim({
    expenseClaimId: expenseClaimId,
    ...doc.data()
  });
  const expenseClaimUser = await User.get(expenseClaim.user);
  const manager = await User.get(expenseClaim.manager);

  const totalValue = expenseClaim.expenses.reduce(
    (previousValue, currentValue) => previousValue + currentValue.value,
    0
  );
  const emailData = {
    attachments: expenseClaim.attachments,
    expenses: expenseClaim.expenses,
    manager: manager.getFullName(),
    totalValue: toCurrency(totalValue, 2)
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: expenseClaim.user,
    updatedAt: new Date(),
    updatedBy: expenseClaim.user
  };

  //Send user an email and notification
  const userNotification = new Notification({
    emailData: emailData,
    link: `/expense-claims/${expenseClaimId}`,
    metadata: metadata,
    page: 'Expense Claims',
    recipient: expenseClaimUser.userId,
    title: 'Your Expense Claim has been submitted successfully',
    type: NEW_EXPENSE_CLAIM_USER
  });
  //Send manager an email and notification
  const managerNotification = new Notification({
    emailData: emailData,
    link: `/expense-claims/${expenseClaimId}`,
    metadata: metadata,
    page: 'Expense Claims',
    recipient: manager.userId,
    title: `New Expense Claim from ${expenseClaimUser.getFullName()} is awaiting your Approval`,
    type: NEW_EXPENSE_CLAIM_MANAGER
  });
  const promises = [];
  expenseClaim.metadata.createdNotification = true;
  promises.push(expenseClaim.save());
  promises.push(Notification.saveAll([userNotification, managerNotification]));
  await Promise.all(promises);
};

const newActionHandler = async (change, context) => {
  const { expenseClaimId } = context.params;
  const doc = change.after;
  const expenseClaim = new ExpenseClaim({
    expenseClaimId: expenseClaimId,
    ...doc.data()
  });

  const action = [...expenseClaim.actions].pop();
  const expenseClaimUser = await User.get(expenseClaim.user);
  const admins = await ExpenseClaim.getAdmins();
  const promises = [];
  //Change notification template type depending on action
  let userNotificationType, adminNotificationType;
  if (action.actionType === APPROVED) {
    userNotificationType = APPROVED_EXPENSE_CLAIM_USER;
    adminNotificationType = APPROVED_EXPENSE_CLAIM_ADMIN;
  } else if (action.actionType === REJECTED) {
    userNotificationType = REJECTED_EXPENSE_CLAIM_USER;
  } else if (action.actionType === PAID) {
    userNotificationType = PAID_EXPENSE_CLAIM_USER;
  }

  const totalValue = expenseClaim.expenses.reduce(
    (previousValue, currentValue) => previousValue + currentValue.value,
    0
  );
  const emailData = {
    attachments: expenseClaim.attachments,
    expenses: expenseClaim.expenses,
    expenseClaimUser: expenseClaimUser.getFullName(),
    totalValue: toCurrency(totalValue, 2)
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: action.actionedBy,
    updatedAt: new Date(),
    updatedBy: action.actionedBy
  };

  const notifications = [];
  //Send user an email and notification
  const userNotification = new Notification({
    emailData: emailData,
    link: `/expense-claims/${expenseClaimId}`,
    metadata: metadata,
    page: 'Expense Claims',
    recipient: expenseClaimUser.userId,
    title: `Your Expense Claim for ${emailData.totalValue} has been ${action.actionType}`,
    type: userNotificationType
  });
  notifications.push(userNotification);
  //Send all admins an email and notification (only if approved. rejected and paid not required)
  if (action.actionType === APPROVED) {
    for (const admin of admins) {
      const adminNotification = new Notification({
        emailData: emailData,
        link: `/expense-claims/${expenseClaimId}`,
        metadata: metadata,
        page: 'Expense Claims',
        recipient: admin,
        title: `${expenseClaimUser.getFullName()}'s Expense Claim for ${
          emailData.totalValue
        } has been ${action.actionType}`,
        type: adminNotificationType
      });
      notifications.push(adminNotification);
    }
  }
  promises.push(Notification.saveAll(notifications));
  await Promise.all(promises);
};

const newCommentHandler = async (change, context) => {
  const { expenseClaimId } = context.params;
  const doc = change.after;
  const expenseClaim = new ExpenseClaim({
    expenseClaimId: expenseClaimId,
    ...doc.data()
  });
  const totalValue = expenseClaim.expenses.reduce(
    (previousValue, currentValue) => previousValue + currentValue.value,
    0
  );

  const comment = [...expenseClaim.comments].pop();
  const commentUser = await User.get(comment.user);
  const admins = await ExpenseClaim.getAdmins();

  const emailData = {
    commentBody: comment.body,
    attachments: comment.attachments,
    totalValue: toCurrency(totalValue, 2)
  };
  const metadata = {
    createdAt: new Date(),
    createdBy: comment.metadata.createdBy,
    updatedAt: new Date(),
    updatedBy: comment.metadata.updatedBy
  };

  const recipients = [...admins, expenseClaim.user, expenseClaim.manager];
  const uniqueRecipients = [...new Set(recipients)];
  const notifications = [];
  for (const recipient of uniqueRecipients) {
    const notification = new Notification({
      emailData: emailData,
      link: `/expense-claims/${expenseClaimId}`,
      metadata: metadata,
      page: 'Expense Claims',
      recipient: recipient,
      title: `Expense Claim for "${
        emailData.totalValue
      }" New comment from ${commentUser.getFullName()}`,
      type: NEW_EXPENSE_CLAIM_COMMENT
    });
    notifications.push(notification);
  }
  await Notification.saveAll(notifications);
};
