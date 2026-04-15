const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

// Configure R2 Client (S3 Compatible)
const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToR2 = async (file, folder = 'uploads') => {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    console.log(`[R2 UPLOAD] Preparing upload: ${fileName} to bucket: ${process.env.R2_BUCKET_NAME}`);
    
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: 'max-age=31536000',
            Metadata: {
                'Access-Control-Allow-Origin': '*'
            }
        });

        await s3.send(command);
        const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        console.log(`[R2 UPLOAD] Success: ${url}`);
        return url;
    } catch (error) {
        console.error('[R2 UPLOAD] Error:', error);
        throw new Error('Image upload failed');
    }
};

/**
 * Deterministic upload for Radical Architecture
 * Saves to products/{id}/{index}.jpg
 */
const uploadToR2Deterministic = async (file, productId, index) => {
    const fileName = `products/${productId}/${index}.jpg`;
    console.log(`[R2 DETERMINISTIC] Uploading: ${fileName} (Product ID: ${productId}, Index: ${index})`);
    
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: 'image/jpeg', // Standardize to jpeg for simplicity or use file.mimetype
            CacheControl: 'max-age=31536000',
            Metadata: {
                'Access-Control-Allow-Origin': '*'
            }
        });

        await s3.send(command);
        const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        console.log(`[R2 DETERMINISTIC] Success: ${url}`);
        return url;
    } catch (error) {
        console.error('[R2 DETERMINISTIC] Error:', error);
        throw new Error('Image upload failed');
    }
};

module.exports = { upload, uploadToR2, uploadToR2Deterministic };
