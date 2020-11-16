const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithLineBreaks
} = require('../utils/html-helper');
const { BASE_URL } = process.env;
const { getShortenedLinkAttachments } = require('../utils/attachments');

module.exports.newProject = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const {
    attachments,
    name,
    customer,
    vendors,
    owners,
    status,
    value,
    description
  } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Project titled "${name}".`
    ),
    wrapWithQuote(`
			Created by: ${senderFullName}<br/>
			Customer: ${customer}<br/>
			Vendors: ${vendors}<br/>
			Owners: ${owners}<br/>
			Status: ${status}<br/>
			Estimated Value: ${value}<br/>
			Description: ${wrapWithLineBreaks(description)}
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
    wrapWithParagraph('To view this Project, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.editProject = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const {
    attachments,
    name,
    customer,
    vendors,
    owners,
    status,
    value,
    description
  } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a Project update for "${name}".`
    ),
    wrapWithQuote(`
			Updated by: ${senderFullName}<br/>
			Customer: ${customer}<br/>
			Vendors: ${vendors}<br/>
			Owners: ${owners}<br/>
			Status: ${status}<br/>
			Estimated Value: ${value}<br/>
			Description: ${wrapWithLineBreaks(description)}
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
    wrapWithParagraph('To view this Project, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newProjectComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, name } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the Project titled "${name}".`
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
    wrapWithParagraph('To comment, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.projectReminder = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const {
    attachments,
    name,
    customer,
    vendors,
    owners,
    status,
    value,
    description
  } = emailData;

  const html = [
    wrapWithParagraph(`This is a reminder about a Project titled "${name}".`),
    wrapWithQuote(`
			Customer: ${customer}<br/>
			Vendors: ${vendors}<br/>
			Owners: ${owners}<br/>
			Status: ${status}<br/>
			Estimated Value: ${value}<br/>
			Description: ${wrapWithLineBreaks(description)}
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
    wrapWithParagraph('To view all Projects, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
