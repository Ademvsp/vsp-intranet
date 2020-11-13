const Notification = require('../models/notification');
const {
  PRODUCT_REQUEST_ACTION_REMINDER
} = require('../data/notification-types');
const ProductRequest = require('../models/product-request');

module.exports.sendProductRequestActionReminder = async () => {
  const productRequests = await ProductRequest.getAwaitingApproval();
  //Only send notifications if there is at least one document returned
  if (productRequests.length > 0) {
    const admins = await ProductRequest.getAdmins();
    const notifications = [];
    for (const admin of admins) {
      const notification = new Notification({
        link: '/product-requests',
        metadata: {
          createdAt: new Date(),
          createdBy: admin,
          updatedAt: new Date(),
          updatedBy: admin
        },
        page: 'Product Requests',
        recipient: admin,
        title: 'Product Requests reminder to Approve outstanding Requests',
        type: PRODUCT_REQUEST_ACTION_REMINDER
      });
      notifications.push(notification);
    }
    await Notification.saveAll(notifications);
  }
};
