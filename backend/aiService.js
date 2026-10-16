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

async function callGeminiWithRetry(genAI, contentParts, primaryModelName) {
    // Unique list of models to try in order of preference
    const candidateModels = Array.from(new Set([
        primaryModelName,
        "gemini-3.8-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash"
    ])).filter(Boolean);

    let lastError = null;

    for (const modelName of candidateModels) {
        // Try up to 2 times if we hit transient 503 spikes
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[AI Service] Invoking model '${modelName}' (attempt ${attempt})...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(contentParts);
                return result;
            } catch (err) {
                lastError = err;
                const msg = err.message || "";
                const isOverloaded = msg.includes("503") || msg.includes("high demand") || msg.includes("Service Unavailable");
                const isUnavailable = msg.includes("404") || msg.includes("not found") || msg.includes("no longer available");

                if (isUnavailable) {
                    console.warn(`[AI Service] Model '${modelName}' unavailable (404). Trying next model...`);
                    break;
                }

                if (isOverloaded && attempt < 2) {
                    console.warn(`[AI Service] Model '${modelName}' hit 503 high demand spike. Retrying in 1.5s...`);
                    await new Promise((res) => setTimeout(res, 1500));
                    continue;
                }

                // If attempts exhausted or other error, break to try fallback model
                console.warn(`[AI Service] Model '${modelName}' failed: ${msg}. Trying next candidate...`);
                break;
            }
        }
    }

    throw lastError;
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
        const preferredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

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

        const result = await callGeminiWithRetry(genAI, contentParts, preferredModel);
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
