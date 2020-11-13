const functions = require('firebase-functions');
const {
  runtimeOptions,
  region,
  timeZone,
  scheduleHour
} = require('../utils/function-parameters');
const { utcToZonedTime } = require('date-fns-tz');
const { isWeekend, format } = require('date-fns');
const { sendProductRequestActionReminder } = require('./product-requests');
const { LONG_DATE } = require('../utils/date');
const { sendEventReminder } = require('./events');
const { sendProjectReminders } = require('./projects');
const { sendLeaveRequestActionReminder } = require('./leave-requests');
const { sendExpenseClaimActionReminder } = require('./expense-claims');

module.exports.dailyTasks = functions
  .runWith(runtimeOptions)
  .region(region)
  .pubsub.schedule(`every day ${scheduleHour}:00`)
  .timeZone(timeZone)
  .onRun(async (_context) => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    console.log('Zoned Date:', format(zonedDate, LONG_DATE));
    console.log('New Date:', format(new Date(), LONG_DATE));
    const promises = [sendEventReminder(), sendProjectReminders()];
    if (!isWeekend(zonedDate)) {
      promises.push(
        sendProductRequestActionReminder(),
        sendLeaveRequestActionReminder(),
        sendExpenseClaimActionReminder()
      );
    }
    await Promise.all(promises);
  });
