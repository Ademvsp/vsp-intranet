const { getShortenedLinkAttachments } = require('../utils/attachments');
const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithBold
} = require('../utils/html-helper');
const { BASE_URL } = process.env;

module.exports.newLeaveRequestUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const { type, start, end, reason, manager } = emailData;

  const html = [
    wrapWithParagraph(
      `Your ${type} Request form has been successfully submitted.`
    ),
    wrapWithQuote(`
			Leave Type: ${type}<br/>
			Start Date: ${start}<br/>
			End Date: ${end}<br/>
			Reason: ${reason}<br/>
			Awaiting Approval from: ${manager}<br/>
		`),
    wrapWithParagraph(`		
			To view this Leave Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newLeaveRequestManager = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { type, start, end, reason, manager } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new ${type} request.`
    ),
    wrapWithQuote(`
			Leave Type: ${type}<br/>
			Start Date: ${start}<br/>
			End Date: ${end}<br/>
			Reason: ${reason}<br/>
			Awaiting Approval from: ${manager}<br/>
		`),
    wrapWithParagraph(
      wrapWithBold(`		
        Action Required: To Approve or Reject this Leave Request, visit this link:
      `)
    ),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.approveLeaveRequestUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const { type, start, end, reason, manager } = emailData;

  const html = [
    wrapWithParagraph(`
			Your ${type} Request form has been successfully approved by ${manager}.<br/>
			An entry has automatically been created on the Staff Calendar.`),
    wrapWithQuote(`
			Leave Type: ${type}<br/>
			Start Date: ${start}<br/>
			End Date: ${end}<br/>
			Reason: ${reason}<br/>
			Approved by: ${manager}<br/>
		`),
    wrapWithParagraph(`		
			To view this Leave Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.approveLeaveRequestAdmin = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { type, start, end, reason, manager } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			${senderFullName} ${type} Request form has been successfully approved by ${manager}.<br/>
			An entry has automatically been created on the Staff Calendar.<br/>
			Please deduct the leave accordingly.
		`),
    wrapWithQuote(`
			Leave Type: ${type}<br/>
			Start Date: ${start}<br/>
			End Date: ${end}<br/>
			Reason: ${reason}<br/>
			Approved by: ${manager}<br/>
		`),
    wrapWithParagraph(`		
			To view this Leave Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.rejectLeaveRequestUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const { type, start, end, reason, manager } = emailData;

  const html = [
    wrapWithParagraph(`
			Your ${type} Request form has been rejected by ${manager}.
		`),
    wrapWithQuote(`
			Leave Type: ${type}<br/>
			Start Date: ${start}<br/>
			End Date: ${end}<br/>
			Reason: ${reason}<br/>
			Approved by: ${manager}<br/>
		`),
    wrapWithParagraph(`		
			To view this Leave Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newLeaveRequestComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, type } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on a ${type} Request.`
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

module.exports.leaveRequestActionReminder = async (notification, _sender) => {
  const { link, recipient } = notification;

  const html = [
    wrapWithParagraph(
      'This is a reminder that you have outstanding Leave Requests that require action.'
    ),
    wrapWithParagraph('To view all Leave Requests, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
