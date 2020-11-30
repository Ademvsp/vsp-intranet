const functions = require('firebase-functions');
const {
  runtimeOptions,
  region,
  timeZone,
  scheduleHour
} = require('../utils/function-parameters');
const { utcToZonedTime } = require('date-fns-tz');
const { isWeekend } = require('date-fns');
const { sendProductRequestActionReminder } = require('./product-requests');
const { sendEventReminder } = require('./events');
const { sendProjectReminders } = require('./projects');
const { sendLeaveRequestActionReminder } = require('./leave-requests');
const {
  sendExpenseClaimActionReminder,
  sendExpenseClaimPaymentReminder
} = require('./expense-claims');
const { deleteOldNotifications } = require('./notifications');
const Backup = require('../models/backup');

module.exports.dailyTasks = functions
  .runWith(runtimeOptions)
  .region(region)
  .pubsub.schedule(`every day ${scheduleHour}:00`)
  .timeZone(timeZone)
  .onRun(async (_context) => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    const promises = [
      sendEventReminder(),
      sendProjectReminders(),
      deleteOldNotifications()
    ];
    if (!isWeekend(zonedDate)) {
      promises.push(
        sendProductRequestActionReminder(),
        sendLeaveRequestActionReminder(),
        sendExpenseClaimActionReminder(),
        sendExpenseClaimPaymentReminder()
      );
    }
    await Promise.all(promises);
  });

module.exports.monthlyTasks = functions
  .runWith(runtimeOptions)
  .region(region)
  .pubsub.schedule('1st day of month 00:00')
  .timeZone(timeZone)
  .onRun(async (_context) => {
    const backup = await Backup.get();
    await backup.create();
  });
