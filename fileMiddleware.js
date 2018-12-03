const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const proofStorage = cloudinaryStorage({
  cloudinary,
  folder: 'reactapp',
  allowedFormats: ['jpg', 'png', 'mp4'],
  transformation: [{ width: 280, height: 175, crop: 'limit' }],
  resource_type: 'auto',
  params: {
    resource_type: 'auto'
  }
});

const profileStorage = cloudinaryStorage({
  cloudinary,
  folder: 'reactapp',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 75, height: 75, crop: 'limit' }]
});

const proofParser = multer({ storage: proofStorage });
const profileParser = multer({ storage: profileStorage });

module.exports = { proofParser, profileParser, proofStorage };