const { GoogleGenerativeAI } = require("@google/generative-ai");
const { constructPrompt } = require("./promptTemplates");
require("dotenv").config();

function getApiKey() {
    return (
        process.env.GEMINI_API_KEY ||
        process.env.API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        ""
    ).trim();
}

async function generateRecipes(userData, imageBuffer = null, mimeType = null) {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error(
            "API Key is missing on the server. Please set GEMINI_API_KEY, API_KEY, or GOOGLE_API_KEY in your Render environment variables."
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Active model recommended by Google API
        const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt = constructPrompt(userData);
        let contentParts = [prompt];

        if (imageBuffer && mimeType) {
            contentParts.push({
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType
                }
            });
            contentParts[0] += "\n[IMAGE CONTEXT]: An image of ingredients/dish is attached. Analyze it to suggest recipes.";
        }

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        const text = response.text();

        // Basic Cleanup if model returns markdown
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON:", text);
            return { error: "Failed to generate valid JSON content", raw: text };
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

module.exports = { generateRecipes };
