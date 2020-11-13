var isgd = require('isgd');

const shorten = async (attachment) => {
  const shortenedLink = await new Promise((resolve) => {
    isgd.shorten(attachment.link, (res) => {
      resolve(res);
    });
  });
  const newAttachment = {
    ...attachment,
    link: shortenedLink
  };
  return newAttachment;
};

module.exports.getShortenedLinkAttachments = async (attachments) => {
  const promises = [];
  for (const attachment of attachments) {
    promises.push(shorten(attachment));
  }
  const shortenedLinkAttachments = await Promise.all(promises);
  return shortenedLinkAttachments;
};
