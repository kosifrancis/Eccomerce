const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const isCloudinaryConfigured = () => {
    return Boolean(
        process.env.CLOUDINARY_URL || (
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        )
    );
};

/**
 * Uploads a buffer directly to Cloudinary using streaming.
 * @param {Buffer} fileBuffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const uploadStreamToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: 'ecommerce/products',
            resource_type: 'image',
            ...options
        };

        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

module.exports = {
    cloudinary,
    isCloudinaryConfigured,
    uploadStreamToCloudinary
};
