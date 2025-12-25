const { GoogleGenerativeAI } = require("@google/generative-ai");
const { constructPrompt } = require("./promptTemplates");
require("dotenv").config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "YOUR_API_KEY_HERE");

async function generateRecipes(userData, imageBuffer = null, mimeType = null) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = constructPrompt(userData);
        let contentParts = [prompt];

        if (imageBuffer && mimeType) {
            // If image is provided, we send it to Gemini
            contentParts.push({
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType
                }
            });
            // Update prompt to acknowledge image
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
