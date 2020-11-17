const Notification = require('../models/notification');
const {
  EXPENSE_CLAIM_ACTION_REMINDER,
  EXPENSE_CLAIM_PAYMENT_REMINDER
} = require('../data/notification-types');
const ExpenseClaim = require('../models/expense-claim');

module.exports.sendExpenseClaimActionReminder = async () => {
  const expenseClaims = await ExpenseClaim.getAwaitingApproval();
  //Only send notifications if there is at least one document returned
  if (expenseClaims.length > 0) {
    // Get unique list of all expense claim managers
    const expenseClaimManagers = [];
    for (const expenseClaim of expenseClaims) {
      if (!expenseClaimManagers.includes(expenseClaim.manager)) {
        expenseClaimManagers.push(expenseClaim.manager);
      }
    }
    const notifications = [];
    for (const manager of expenseClaimManagers) {
      const notification = new Notification({
        link: '/expense-claims',
        metadata: {
          createdAt: new Date(),
          createdBy: manager,
          updatedAt: new Date(),
          updatedBy: manager
        },
        page: 'Expense Claims',
        recipient: manager,
        title: 'Expense Claims reminder to Approve outstanding Requests',
        type: EXPENSE_CLAIM_ACTION_REMINDER
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};

module.exports.sendExpenseClaimPaymentReminder = async () => {
  const expenseClaims = await ExpenseClaim.getAwaitingApproval();
  //Only send notifications if there is at least one document returned
  if (expenseClaims.length > 0) {
    // Get list of all expense claim admins
    const admins = await ExpenseClaim.getAdmins();
    const notifications = [];
    for (const admin of admins) {
      const notification = new Notification({
        link: '/expense-claims',
        metadata: {
          createdAt: new Date(),
          createdBy: admin,
          updatedAt: new Date(),
          updatedBy: admin
        },
        page: 'Expense Claims',
        recipient: admin,
        title: 'Expense Claims reminder to Pay outstanding Requests',
        type: EXPENSE_CLAIM_PAYMENT_REMINDER
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};
