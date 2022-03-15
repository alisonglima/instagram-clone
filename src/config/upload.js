const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const s3Storage = require('multer-sharp-s3');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION,
});

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.resolve(__dirname, '..', '..', 'uploads/resized'));
    },
    filename: (req, file, callback) => {
      const newFile = file;
      crypto.randomBytes(16, (err, hash) => {
        if (err) callback(err);

        // eslint-disable-next-line no-param-reassign
        newFile.key = `${hash.toString('hex')}-${file.originalname}`;

        callback(null, newFile.key);
      });
    },
  }),
  s3: s3Storage({
    s3: new aws.S3(),
    Bucket: 'semana-omnistack-7/resized',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    resize: {
      width: 614,
      height: 768,
    },
    toFormat: 'jpeg',
    Key: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) callback(err);

        const fileName = `${hash.toString('hex')}-${file.originalname}`;

        callback(null, fileName);
      });
    },
  }),
};

module.exports = {
  destination: path.resolve(__dirname, '..', '..', 'uploads/resized'),
  storage: storageTypes.s3,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'));
    }
  },
};
