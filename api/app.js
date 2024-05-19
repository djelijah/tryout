const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 443;

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: 'AKIA2UC3DZU3N7T6UOHX',
    secretAccessKey: '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',
    region: 'us-east-1',
    endpoint: 'https://myscreams.s3.us-east-1.amazonaws.com'
});

// Set up multer storage to memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to handle audio recordings
app.post('/api/recordings', upload.single('recording'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${uuidv4()}${path.extname(file.originalname)}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error uploading file' });
        }
        res.json({ message: 'Recording received successfully', file: data.Location });
    });
});

// Endpoint to get list of recordings
app.get('/api/recordings', async (req, res) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const recordings = data.Contents.map(item => `https://${params.Bucket}.s3.amazonaws.com/${item.Key}`);
        res.json({ recordings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recordings' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
