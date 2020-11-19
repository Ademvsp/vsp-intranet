const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithBold
} = require('../utils/html-helper');
const { BASE_URL } = process.env;
const { format, utcToZonedTime } = require('date-fns-tz');
const { LONG_DATE, LONG_DATE_TIME } = require('../utils/date');
const User = require('../models/user');
const { getShortenedLinkAttachments } = require('../utils/attachments');

module.exports.newEvent = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Event titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Created by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph('To view this Event, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];
  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newEventAdmin = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay, user } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Event titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Created by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph(
      wrapWithBold(`Action Required: Update the leave balance of ${user}.`)
    ),
    wrapWithParagraph('To view this Event, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];
  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.editEvent = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about an Event update titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Updated by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph('To view this Event, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.editEventAdmin = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay, user } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about an Event update titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Updated by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph(
      wrapWithBold(`Action Required: Update the leave balance of ${user}.`)
    ),
    wrapWithParagraph('To view this Event, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.deleteEvent = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about an Event deletion titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Deleted by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph('To view all Events, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.deleteEventAdmin = async (notification, sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay, user } = emailData;
  const senderFullName = sender.getFullName();
  const recipient = new User({ ...notificationRecipient });
  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);
  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about an Event deletion titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Deleted by: ${senderFullName}<br/>
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph(
      wrapWithBold(`Action Required: Update the leave balance of ${user}.`)
    ),
    wrapWithParagraph('To view all Events, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newEventComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, eventTitle } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the Event titled "${eventTitle}".`
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

module.exports.eventReminder = async (notification, _sender) => {
  const { emailData, link, recipient: notificationRecipient } = notification;
  const { eventTitle, start, end, allDay } = emailData;
  const recipient = new User({ ...notificationRecipient });

  const timezone = await recipient.getTimezone();
  const dateFormat = allDay ? LONG_DATE : LONG_DATE_TIME;
  const zonedStartDate = utcToZonedTime(start, timezone);
  const zonedEndDate = utcToZonedTime(end, timezone);

  const startDateFormatted = format(zonedStartDate, dateFormat, {
    timeZone: timezone
  });
  const endDateFormatted = format(zonedEndDate, dateFormat, {
    timeZone: timezone
  });

  const html = [
    wrapWithParagraph(
      `This is a reminder about an Event titled "${eventTitle}".`
    ),
    wrapWithQuote(`
			Start Date: ${startDateFormatted}<br/>
			End Date: ${endDateFormatted}
		`),
    wrapWithParagraph('To view this Events, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
