const {
  wrapWithParagraph,
  wrapWithTemplate,
  transformForEmail,
  wrapWithQuote
} = require('../utils/html-helper');
const { BASE_URL, APP_NAME } = process.env;

module.exports.newUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const { email, phoneNumber } = emailData;

  const html = [
    wrapWithParagraph(`
      Welcome to the ${APP_NAME}!<br/>
    `),
    wrapWithParagraph(`
      To log in, visit:
    `),
    wrapWithQuote(`
      ${BASE_URL}${link}
    `),
    wrapWithParagraph(`
      You will be asked to use your work email ${email} as your user credential.<br />
      An SMS code will then be sent to your mobile phone ${phoneNumber} for verification.
		`)
  ];
  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
