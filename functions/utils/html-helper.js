const LinkifyHtml = require('linkifyjs/html');
const { EMAIL_FONT_URL, EMAIL_FONT_NAME, DEFAULT_SIGNATURE } = process.env;

const convertToThumbnail = (html) => {
  let startIndex;
  do {
    startIndex = html.indexOf('<img', startIndex);
    if (startIndex !== -1) {
      const endIndex = html.indexOf('>', startIndex);
      const imgTag = html.substring(startIndex, endIndex + 1);
      const imgUrl = imgTag.substring(
        imgTag.indexOf('src="') + 5,
        imgTag.indexOf('">')
      );
      const thumbnailTag = `<a href="${imgUrl}">${imgTag}</a>`;
      html = html.split(imgTag).join(thumbnailTag);
      startIndex += thumbnailTag.length;
    }
  } while (startIndex !== -1);
  return html;
};

const convertToLink = (html) => {
  html = LinkifyHtml(html);
  html = html.split('<a href');
  html = html.join('<a target="_blank" href');
  return html;
};

const trimEmptyParagraph = (html) => {
  const emptyParagraphString = '<p> </p>';
  html = html.trim();
  while (html.startsWith(emptyParagraphString)) {
    html = html.substring(emptyParagraphString.length);
  }
  while (html.endsWith(emptyParagraphString)) {
    html = html.substring(0, html.length - emptyParagraphString.length);
  }
  return html;
};

const resizeImage = (html, imageSize) => {
  html = html.split('<img');
  html = html.join(`<img style="max-width: ${imageSize};"`);
  return html;
};

const convertPrewrap = (html) => {
  html = html
    .split('<p style="white-space: pre-wrap;">')
    .join('<p style="white-space: pre;">');
  return html;
};

module.exports.wrapWithParagraph = (html) => {
  html = `<p>${html}</p>`;
  return html;
};

module.exports.wrapWithBold = (html) => {
  html = `<strong>${html}</strong>`;
  return html;
};

module.exports.wrapWithQuote = (html) => {
  html = `<div style="
						margin-bottom: 1rem;
						padding-left: 12px;
						border-left: 6px solid #eee;
						font-style: italic;
					">
						${html}
					</div>`;
  return html;
};

module.exports.wrapWithTemplate = (html, recipient) => {
  const htmlBody = `
		<head>
			<style type=“text/css”>@import url('${EMAIL_FONT_URL}');</style>
		</head>
		<div style="
			border: 1px solid #e5e5e5;
			border-radius: 4px;
			padding: 15px 20px;
			margin: auto;
			font-family: '${EMAIL_FONT_NAME}', verdana, geneva, sans-serif;
		">
			<p>Hello ${recipient.firstName},</p>
				${html}
			<p>
				--<br/><br/>
				${DEFAULT_SIGNATURE}
			</p>
		</div>
	`;
  return htmlBody;
};

module.exports.transformForEmail = (html) => {
  html = convertToThumbnail(html);
  html = convertToLink(html);
  html = trimEmptyParagraph(html);
  html = resizeImage(html, '50%');
  html = convertPrewrap(html);
  return html;
};
