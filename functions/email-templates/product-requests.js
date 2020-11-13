const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithBold
} = require('../utils/html-helper');
const { getShortenedLinkAttachments } = require('../utils/attachments');
const { BASE_URL } = process.env;

module.exports.newProductRequestUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const {
    attachments,
    vendor,
    vendorSku,
    productType,
    cost,
    description
  } = emailData;

  const html = [
    wrapWithParagraph(
      `Your Product Request form has been successfully submitted for "${vendorSku}".`
    ),
    wrapWithQuote(`
			Vendor: ${vendor}<br/>
			SKU: ${vendorSku}<br/>
			Product Type: ${productType}<br/>
			Cost: ${cost}<br/>
			Description: ${description}<br/>
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
    wrapWithParagraph(`
			Once it has been added to Fishbowl, you will receive an email notification.<br/>
			To view this Product Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newProductRequestAdmin = async (notification, sender) => {
  const senderFullName = sender.getFullName();
  const { emailData, link, recipient } = notification;
  const {
    attachments,
    vendor,
    vendorSku,
    productType,
    cost,
    description
  } = emailData;

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Product "${vendorSku}".`
    ),
    wrapWithQuote(`
			Vendor: ${vendor}<br/>
			SKU: ${vendorSku}<br/>
			Product Type: ${productType}<br/>
			Cost: ${cost}<br/>
			Description: ${description}<br/>
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
    wrapWithParagraph(
      wrapWithBold(`
        Action Required: Add the new Product into Fishbowl.
      `)
    ),
    wrapWithParagraph(`
			To view this Product Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newProductRequestComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, vendorSku } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new comment on the Product Request for "${vendorSku}".`
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

module.exports.approvedProductRequest = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { vendorSku, finalSku } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			Your Product Request to get "${vendorSku}" added to Fishbowl has been approved by ${senderFullName}<br/>
			Thew new part number in Fishbowl is:
		`),
    wrapWithQuote(`${finalSku}`),
    wrapWithParagraph(`
			To view this Product Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.rejectedProductRequest = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { vendorSku } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			Your Product Request to get "${vendorSku}" added to Fishbowl has been rejected by ${senderFullName}.
		`),
    wrapWithParagraph(`
			To view this Product Request, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.productRequestActionReminder = async (notification, _sender) => {
  const { link, recipient } = notification;

  const html = [
    wrapWithParagraph(
      'This is a reminder that you have outstanding Product Requests that require action.'
    ),
    wrapWithParagraph('To view all Product Requests, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
