const { getShortenedLinkAttachments } = require('../utils/attachments');
const {
  wrapWithParagraph,
  wrapWithQuote,
  wrapWithTemplate,
  transformForEmail,
  wrapWithBold
} = require('../utils/html-helper');
const { BASE_URL } = process.env;
const { format } = require('date-fns');
const { SHORT_DATE } = require('../utils/date');
const { toCurrency } = require('../utils/data-transformer');

module.exports.newExpenseClaimUser = async (notification, _sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, manager, totalValue } = emailData;

  const html = [
    wrapWithParagraph(`
			Your new Expense Claim for ${totalValue} has been successfully submitted.<br/>
			It is awaiting approval from ${manager}.
		`)
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
				`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
			`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(`		
			To view this Expense Claim, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newExpenseClaimManager = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `You have been notified by ${senderFullName} about a new Expense Claim.`
    )
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
			`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
		`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(
      wrapWithBold(
        'Action Required: To Approve or Reject this Expense Claim, visit this link:'
      )
    ),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.approveExpenseClaimUser = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			Your Expense has been approved by ${senderFullName}.
			Once paid, you will be notified by email.
		`)
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
			`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
		`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(`		
			To view this Expense Claim, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.approveExpenseClaimAdmin = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, expenseClaimUser, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			${expenseClaimUser}'s Expense Claim has been approved by ${senderFullName}.
		`)
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
			`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
		`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(
      wrapWithBold(`
        Action Required: Please pay ${totalValue} to ${expenseClaimUser}'s account on the next payment run.<br/>
        Once paid, please change the status of the Expense Claim to "Paid" on this page:
      `)
    ),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.rejectedExpenseClaimUser = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(
      `Your Expense Claim has been rejected by ${senderFullName}.`
    )
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
			`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
		`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(`		
			To view this Expense Claim, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.paidExpenseClaimUser = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { attachments, expenses, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			Your Expense Claim has been Paid by ${senderFullName}.<br/>
			You should receive it in your account shortly.
		`)
  ];
  //Loop through each expense
  for (const expense of expenses) {
    html.push(
      wrapWithParagraph(`
				${format(expense.date.toDate(), SHORT_DATE)} - ${expense.description}<br/>
				${wrapWithQuote(toCurrency(expense.value, 2))}
				`)
    );
  }
  html.push(
    wrapWithParagraph(`
			Total Value<br/>
			${wrapWithQuote(totalValue)}
		`)
  );
  //Loop through each reciept attachment
  const shortenedLinkAttachments = await getShortenedLinkAttachments(
    attachments
  );
  for (const attachment of shortenedLinkAttachments) {
    html.push(
      wrapWithParagraph(`
			<a href="${attachment.link}">${attachment.name}</a><br/>
		`)
    );
  }
  html.push(
    wrapWithParagraph(`		
			To view this Expense Claim, visit this link:
		`),
    wrapWithParagraph(`${BASE_URL}${link}`)
  );

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};

module.exports.newExpenseClaimComment = async (notification, sender) => {
  const { emailData, link, recipient } = notification;
  const { commentBody, attachments, totalValue } = emailData;
  const senderFullName = sender.getFullName();

  const html = [
    wrapWithParagraph(`
			You have been notified by ${senderFullName} about a new comment on an Expense Claim for ${totalValue}.
		`),
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

module.exports.expenseClaimActionReminder = async (notification, _sender) => {
  const { link, recipient } = notification;

  const html = [
    wrapWithParagraph(
      'This is a reminder that you have outstanding Expense Claims that require action.'
    ),
    wrapWithParagraph('To view all Expense Claims, visit this link:'),
    wrapWithParagraph(`${BASE_URL}${link}`)
  ];

  const templateHtml = wrapWithTemplate(html.join('\n'), recipient);
  const transformedHtml = transformForEmail(templateHtml);
  return transformedHtml;
};
