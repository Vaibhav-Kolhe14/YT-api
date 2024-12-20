const cloudinary = require('cloudinary').v2;
const fs = require('fs')

    // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // if(!localFilePath) {
        //     throw new Error("Local file path not provided");
        // }
        const uploadResult = await cloudinary.uploader
        .upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(uploadResult);
        console.log("File has been Uploaded :: ", uploadResult.url);
        fs.unlinkSync(localFilePath)
        return uploadResult
    } catch (error) {
        console.error("Error uploading to Cloudinary :: ", error);
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as upload operation got failed
        return null
    }
}


const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return null;

        // Extract public_id from the URL
        const publicIdMatch = imageUrl.match(/\/v\d+\/([^/.]+)\./);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;

        if (!publicId) {
            console.error("Could not extract public_id from URL:", imageUrl);
            return false;
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            console.log('Image deleted successfully');
            return true;
        } else {
            console.log('Error deleting image:', result);
            return false;
        }
    } catch (error) {
        console.error('Error while deleting image:', error.message);
        return false;
    }
};

module.exports = { 
    uploadOnCloudinary,
    deleteImage
}