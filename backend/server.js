const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { generateRecipes } = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger (Debug)
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, '../frontend')));
// Multer for memory storage (for image uploads)
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API: Generate Recipes
app.post('/api/generate', upload.single('image'), async (req, res) => {
    try {
        const userData = req.body; // text fields, inputMethod, filters
        const imageFile = req.file;

        console.log("Received Request:", userData);
        if (imageFile) console.log("Image received:", imageFile.mimetype);

        const recipes = await generateRecipes(userData, imageFile ? imageFile.buffer : null, imageFile ? imageFile.mimetype : null);

        if (recipes.error) {
            return res.status(500).json({ success: false, message: "Failed to parse recipes." });
        }

        res.json({ success: true, count: recipes.length, recipes });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong! Maybe the Maharaj is sleeping." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.API_KEY ? 'Active' : 'Missing API Key'}`);
});
