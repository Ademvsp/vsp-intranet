const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail
} = require('../utils/html-helper');
const { getShortenedLinkAttachments } = require('../utils/attachments');
const { BASE_URL } = process.env;

module.exports.newPromotion = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { body, attachments, title, expiry } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Promotion titled "${title}".`
    ),
    wrapWithQuote(body),
    wrapWithParagraph(`
      Expires: ${expiry}
    `)
  ];
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(
        `<a href="${attachment.link}">${attachment.name}</a><br/>`
      )
    );
  }
  html.push(
    wrapWithParagraph('To comment, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.editPromotion = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { body, attachments, title, expiry } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a Promotion update titled "${title}".`
    ),
    wrapWithQuote(body),
    wrapWithParagraph(`
      Expires: ${expiry}
    `)
  ];
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(
        `<a href="${attachment.link}">${attachment.name}</a><br/>`
      )
    );
  }
  html.push(
    wrapWithParagraph('To comment, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newPromotionComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the Promotion titled "${title}".`
    ),
    wrapWithQuote(`${commentBody}`)
  ];
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(
        `<a href="${attachment.link}">${attachment.name}</a><br/>`
      )
    );
  }
  html.push(
    wrapWithParagraph('To comment, visit this link'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
