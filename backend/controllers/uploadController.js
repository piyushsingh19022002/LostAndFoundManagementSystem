const cloudinary = require('../config/cloudinary');

/**
 * @desc    Upload image to Cloudinary
 * @route   POST /api/upload
 * @access  Protected
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file format.' });
    }

    // Upload buffer directly to Cloudinary using a write stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lost_and_found_system', // Organize uploads in Cloudinary folder
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image to cloud storage.', error: error.message });
        }

        // Return the secure CDN url on successful upload
        return res.status(200).json({ imageUrl: result.secure_url });
      }
    );

    // End the stream by writing the file buffer
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload controller exception:', error);
    return res.status(500).json({ message: 'Server error during file upload.', error: error.message });
  }
};

module.exports = { uploadImage };
