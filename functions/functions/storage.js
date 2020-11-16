const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { runtimeOptions, region } = require('../utils/function-parameters');
const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');

module.exports.profilePictureUploadListener = functions
  .runWith(runtimeOptions)
  .region(region)
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;
    const metadata = {
      contentType: contentType
    };
    const bucket = admin.storage().bucket();

    if (filePath.startsWith('users/') && filePath.includes('profilePicture')) {
      const fileName = path.basename(filePath);
      const fileNameWithoutExtension = path.parse(filePath).name;
      const extension = path.parse(filePath).ext;
      const newFileName = `${fileNameWithoutExtension}_converted${extension}`;

      const tempFilePath = path.join(os.tmpdir(), fileName);
      const tempConvertedFilePath = path.join(os.tmpdir(), newFileName);

      await bucket.file(filePath).download({
        destination: tempFilePath
      });
      await sharp(tempFilePath).jpeg().toFile(tempConvertedFilePath);

      await bucket.upload(tempConvertedFilePath, {
        destination: newFileName,
        metadata: metadata
      });

      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(tempConvertedFilePath);
      console.log('makes it to the end');
    }
  });
