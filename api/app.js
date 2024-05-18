const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to handle audio recordings
app.post('/api/recordings', upload.single('recording'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ message: 'Recording received successfully', file: `/uploads/${file.filename}` });
});

// Endpoint to get list of recordings
app.get('/api/recordings', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading recordings directory' });
        }
        const recordings = files.map(file => `/uploads/${file}`);
        res.json({ recordings: recordings });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
