const multer = require('multer');

// Store file in memory as buffer so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml'
    ];

    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files (JPEG, JPG, PNG, WEBP, GIF, SVG) are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter
});

// Middleware helper to gracefully catch Multer errors (e.g. file size limit, invalid type)
const handleSingleImageUpload = (fieldName = 'image') => {
    const uploadSingle = upload.single(fieldName);

    return (req, res, next) => {
        uploadSingle(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum image size is 10MB.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

module.exports = {
    upload,
    handleSingleImageUpload
};
