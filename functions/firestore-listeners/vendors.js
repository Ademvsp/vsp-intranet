const Notification = require('../models/notification');
const { NEW_VENDOR } = require('../data/notification-types');
const { runtimeOptions, region } = require('../utils/function-parameters');
const User = require('../models/user');
const Vendor = require('../models/vendor');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');
const { INTERNAL } = require('../data/source-types');

module.exports.vendorCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('vendors-new/{vendorId}')
  .onCreate(async (doc, context) => {
    const { vendorId } = context.params;
    const vendor = new Vendor({
      vendorId: vendorId,
      ...doc.data()
    });
    //Only send an email if a user has added a new vendor
    if (vendor.source === INTERNAL) {
      const createdByUser = await User.get(vendor.metadata.createdBy);
      const createdByUserFullName = createdByUser.getFullName();
      const promises = [];
      const admins = await Vendor.getAdmins();

      const emailData = {
        name: vendor.name,
        createdAt: vendor.metadata.createdAt.toDate().getTime()
      };
      const metadata = {
        createdAt: new Date(),
        createdBy: vendor.metadata.createdBy,
        updatedAt: new Date(),
        updatedBy: vendor.metadata.updatedBy
      };

      const notifications = [];
      for (const recipient of admins) {
        const notification = new Notification({
          emailData: emailData,
          link: '/',
          metadata: metadata,
          page: 'Vendors',
          recipient: recipient,
          title: `Vendor "${vendor.name}" created by ${createdByUserFullName}`,
          type: NEW_VENDOR
        });
        notifications.push(notification);
      }
      promises.push(Notification.saveAll(notifications));
      promises.push(
        CollectionData.addCollectionData({
          document: 'vendors',
          docId: vendorId
        })
      );
      await Promise.all(promises);
    }
  });
