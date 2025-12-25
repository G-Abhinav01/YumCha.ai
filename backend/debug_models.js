const https = require('https');
require('dotenv').config();

const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API_KEY not found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const models = JSON.parse(data);
            console.log("Available Models:");
            models.models.forEach(m => console.log(`- ${m.name.replace('models/', '')}`));
        } else {
            console.error(`Error: Status ${res.statusCode}`);
            console.error(data);
        }
    });

}).on('error', (err) => {
    console.error("Network Error:", err.message);
});
