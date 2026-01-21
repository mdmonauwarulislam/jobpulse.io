const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

/* ----------------------------------
   CLOUDINARY CONFIG
---------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ----------------------------------
   STORAGE CONFIG
---------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const parsed = path.parse(file.originalname);
    const cleanName = parsed.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();

    const rawTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (rawTypes.includes(file.mimetype)) {
      return {
        folder: 'jobpulse_uploads',
        resource_type: 'raw',
        public_id: `${cleanName}-${timestamp}${parsed.ext}`
      };
    }

    return {
      folder: 'jobpulse_uploads',
      resource_type: 'image',
      public_id: `${cleanName}-${timestamp}`
    };
  }
});

/* ----------------------------------
   FILE FILTER
---------------------------------- */
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

/* ----------------------------------
   MULTER
---------------------------------- */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/* ----------------------------------
   ERROR WRAPPER
---------------------------------- */
const handleUploadError = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

/* ----------------------------------
   DELETE HELPER
---------------------------------- */
const deleteFile = async (publicId, resourceType = 'raw') => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType,  content_disposition: 'inline' });
};

/* ----------------------------------
   EXPORTS
---------------------------------- */
module.exports = {
  uploadResume: handleUploadError(upload.single('resume')),
  uploadLogo: handleUploadError(upload.single('logo')),
  uploadMultiple: handleUploadError(upload.array('files', 5)),
  deleteFile
};
