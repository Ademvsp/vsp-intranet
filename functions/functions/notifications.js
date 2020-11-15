const { subDays } = require('date-fns');
const Notification = require('../models/notification');

module.exports.deleteOldNotifications = async () => {
  const oneMonthAgoDate = subDays(new Date(), 30);
  const oneMonthAgoNoticiations = await Notification.getOlderThan(
    oneMonthAgoDate
  );
  await Notification.deleteAll(oneMonthAgoNoticiations);
};
