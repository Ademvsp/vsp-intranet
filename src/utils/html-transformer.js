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

export default (html) => {
	html = convertToThumbnail(html);
	html = convertToLink(html);
	return html;
};
