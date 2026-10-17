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

function normalizeRecipes(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
        if (Array.isArray(data.recipes)) return data.recipes;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.dishes)) return data.dishes;
        if (Array.isArray(data.items)) return data.items;
        if (data.name && data.ingredients) return [data];
    }
    return null;
}

function extractJson(text) {
    if (!text || typeof text !== "string") return null;

    let clean = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

    // 1. Direct parse attempt
    try {
        const parsed = JSON.parse(clean);
        const normalized = normalizeRecipes(parsed);
        if (normalized) return normalized;
    } catch (e) {}

    // 2. Extract [ ... ] array
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    if (startArr !== -1 && endArr > startArr) {
        try {
            const arr = JSON.parse(clean.substring(startArr, endArr + 1));
            const normalized = normalizeRecipes(arr);
            if (normalized) return normalized;
        } catch (e) {}
    }

    // 3. Extract { ... } object containing array
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');
    if (startObj !== -1 && endObj > startObj) {
        try {
            const obj = JSON.parse(clean.substring(startObj, endObj + 1));
            const normalized = normalizeRecipes(obj);
            if (normalized) return normalized;
        } catch (e) {}
    }

    return null;
}

async function callGeminiWithRetry(genAI, contentParts, primaryModelName) {
    const candidateModels = Array.from(new Set([
        primaryModelName,
        "gemini-3.8-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash"
    ])).filter(Boolean);

    let lastError = null;

    // Generous token budget to completely prevent truncated JSON
    const fastGenConfig = {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096,
    };

    for (const modelName of candidateModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[AI Service] Invoking model '${modelName}' (attempt ${attempt})...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: fastGenConfig,
                });
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
                    console.warn(`[AI Service] Model '${modelName}' hit 503 high demand spike. Retrying in 1.2s...`);
                    await new Promise((res) => setTimeout(res, 1200));
                    continue;
                }

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

        const parsedRecipes = extractJson(text);
        if (parsedRecipes && Array.isArray(parsedRecipes) && parsedRecipes.length > 0) {
            return parsedRecipes;
        }

        console.error("Failed to parse valid recipes from model output:", text);
        return { error: "Failed to parse recipes from model output", raw: text };

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

module.exports = { generateRecipes };
