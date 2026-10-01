const cloudinaryConfig = require('../config/cloudinary');

/**
 * Controller to upload a single image to Cloudinary
 * Returns the public secure URL so it can be saved with the product
 */
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided. Please attach an image file with field name "image".'
            });
        }

        if (!cloudinaryConfig.isCloudinaryConfigured()) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
            });
        }

        const result = await cloudinaryConfig.uploadStreamToCloudinary(req.file.buffer, {
            folder: 'ecommerce/products'
        });

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height
        });
    } catch (error) {
        console.error('CLOUDINARY UPLOAD ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image to Cloudinary',
            error: error.message
        });
    }
};

module.exports = {
    uploadImage
};
