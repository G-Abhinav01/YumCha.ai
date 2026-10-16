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
        // Default to gemini-2.5-flash with fallback options
        const primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

        let result;
        try {
            const model = genAI.getGenerativeModel({ model: primaryModel });
            result = await model.generateContent(contentParts);
        } catch (modelErr) {
            // If primary model is not found, fallback to gemini-2.0-flash
            if (modelErr.message && modelErr.message.includes("404") && primaryModel !== "gemini-2.0-flash") {
                console.warn(`Model ${primaryModel} failed with 404, attempting fallback to gemini-2.0-flash...`);
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                result = await fallbackModel.generateContent(contentParts);
            } else {
                throw modelErr;
            }
        }

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
