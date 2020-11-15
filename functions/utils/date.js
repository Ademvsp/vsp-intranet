const functions = require('firebase-functions');
const { runtimeOptions, region } = require('./function-parameters');
const { UNAUTHENTICATED, UNKNOWN } = require('./error-codes');

module.exports.SHORT_DATE = 'dd/MM/yyyy';
module.exports.LONG_DATE_TIME = 'eee, d MMM yyyy, h:mm aaa';
module.exports.LONG_DATE = 'eee, d MMM yyyy';
module.exports.FULL_DATE_TIME = 'yyyy-MM-dd HH:mm:ss zzz';
module.exports.MILLISECONDS = 'T';
module.exports.LOCALE = 'en-au';

module.exports.getServerTimeInMilliseconds = functions
  .region(region)
  .runWith(runtimeOptions)
  .https.onCall(async (_data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          UNAUTHENTICATED.code,
          'Authentication error'
        );
      }
      return Date.now();
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        UNKNOWN.code,
        'Server Time error',
        error
      );
    }
  });
