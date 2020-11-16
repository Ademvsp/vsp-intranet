const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithLineBreaks
} = require('../utils/html-helper');
const { getShortenedLinkAttachments } = require('../utils/attachments');
const { BASE_URL } = process.env;

module.exports.newFirmware = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { attachments, body, products, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about new Firmware uploaded titled "${title}".`
    ),
    wrapWithQuote(`
      Title: ${title}<br/>
      Product Affected: ${products}<br/>
      ${body ? `Release Notes: ${wrapWithLineBreaks(body)}` : ''}
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

module.exports.editFirmware = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { attachments, body, products, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a Firmware update titled "${title}".`
    ),
    wrapWithQuote(`
      Title: ${title}<br/>
      Product Affected: ${products}<br/>
      ${body ? `Release Notes: ${wrapWithLineBreaks(body)}` : ''}
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

module.exports.newFirmwareComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, commentBody, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on a Firmware titled ${title}.`
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
