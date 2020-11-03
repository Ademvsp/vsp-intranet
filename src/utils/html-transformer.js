import LinkifyHtml from 'linkifyjs/html';

export const convertToThumbnail = (html) => {
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

export const convertToLink = (html) => {
  html = LinkifyHtml(html);
  html = html.split('<a href');
  html = html.join('<a target="_blank" href');
  return html;
};

export const trimEmptyParagraph = (html) => {
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

export const resizeImage = (html, size) => {
  html = html.split('<img');
  html = html.join(`<img style="max-width: ${size};"`);
  return html;
};

export const transformForWeb = (html) => {
  html = convertToThumbnail(html);
  html = convertToLink(html);
  html = trimEmptyParagraph(html);
  return html;
};

export const transformForEmail = (html, size) => {
  html = transformForWeb(html);
  html = resizeImage(html, size);
  return html;
};
