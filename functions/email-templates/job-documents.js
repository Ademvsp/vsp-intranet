const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithLineBreaks
} = require('../utils/html-helper');
const { getShortenedLinkAttachments } = require('../utils/attachments');
const { BASE_URL } = process.env;

module.exports.newJobDocument = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { attachments, body, customer, salesOrder, siteReference } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about new Job Documents uploaded for Sales Order ${salesOrder}.`
    ),
    wrapWithQuote(`
      Customer: ${customer}<br/>
      ${siteReference ? `Site Reference: ${siteReference}<br/>` : ''}
      ${body ? `Notes: ${wrapWithLineBreaks(body)}` : ''}
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

module.exports.editJobDocument = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { attachments, body, customer, salesOrder, siteReference } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a Job Document update for Sales Order ${salesOrder}.`
    ),
    wrapWithQuote(`
      Customer: ${customer}<br/>
      ${siteReference ? `Site Reference: ${siteReference}<br/>` : ''}
      ${body ? `Notes: ${wrapWithLineBreaks(body)}` : ''}
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

module.exports.newJobDocumentComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, commentBody, salesOrder } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the Job Documents for Sales Order ${salesOrder}.`
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
