const Notification = require('../models/notification');
const { NEW_CUSTOMER } = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const Customer = require('../models/customer');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { INTERNAL } = require('../data/source-types');

module.exports.customerCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('customers/{customerId}')
  .onCreate(async (doc, context) => {
    const { customerId } = context.params;
    const customer = new Customer({
      customerId: customerId,
      ...doc.data()
    });
    //Only send an email if a user has added a customer
    if (customer.source === INTERNAL) {
      const createdByUser = await User.get(customer.metadata.createdBy);
      const createdByUserFullName = createdByUser.getFullName();
      const promises = [];
      const admins = await Customer.getAdmins();

      const emailData = {
        customerId: customer.customerId,
        name: customer.name,
        createdAt: customer.metadata.createdAt.toDate().getTime()
      };
      const metadata = {
        createdAt: new Date(),
        createdBy: customer.metadata.createdBy,
        updatedAt: new Date(),
        updatedBy: customer.metadata.updatedBy
      };

      const notifications = [];
      for (const recipient of admins) {
        const notification = new Notification({
          emailData: emailData,
          link: '/',
          metadata: metadata,
          page: 'Customers',
          recipient: recipient,
          title: `Customer "${customer.name}" created by ${createdByUserFullName}`,
          type: NEW_CUSTOMER
        });
        notifications.push(notification);
      }
      promises.push(Notification.saveAll(notifications));
      promises.push(
        CollectionData.addCollectionData({
          document: 'customers',
          docId: customerId
        })
      );
      await Promise.all(promises);
    }
  });
