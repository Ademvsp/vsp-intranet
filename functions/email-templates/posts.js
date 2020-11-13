const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail
} = require('../utils/html-helper');
const { getShortenedLinkAttachments } = require('../utils/attachments');
const { BASE_URL } = process.env;

module.exports.newPost = async (notification, sender) => {
  // const { emailData, link, metadata, page, recipient, title, type } = notification;
  const { emailData, link, recipient } = notification;
  const { body, attachments, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Post on the News Feed titled "${title}".`
    ),
    wrapWithQuote(body)
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

module.exports.newPostComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, title } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the News Feed titled "${title}".`
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

// module.exports.newPostLike = async (notification, sender) => {
// 	const { emailData, link, recipient } = notification;
// 	const { title } = emailData;
// 	const senderFullName = sender.getFullName();

// 	const html = [
// 		wrapWithParagraph(
// 			`${senderFullName} has liked your Post on the News Feed titled "${title}".`
// 		)
// 	];
// 	html.push(
// 		wrapWithParagraph('To comment, visit this link'),
// 		wrapWithParagraph(`${BASE_URL}${link}`)
// 	);

// 	const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
// 	const transformedHtml = transformForEmail(templateHtml);
// 	return transformedHtml;
// };
