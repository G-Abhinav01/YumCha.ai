# YumCha.ai - Backend Explanation (For the "Creator")

Here is how "you" built the backend. Use these points when explaining it to someone.

## 1. The Core Server (`server.js`)
"I set up a lightweight **Express.js** server. It’s the backbone that listens for requests."
- **Why Express?**: It's fast, minimal, and perfect for creating APIs quickly.
- **Port 3000**: The server runs on port 3000 (standard for Node apps).
- **Middleware**: I added `cors` (to allow requests from anywhere if needed) and `multer` (to handle image uploads in memory without clogging the disk).

## 2. The AI Integration (`aiService.js`)
"Refusing to use basic string matching, I integrated **Google's Gemini API** for true intelligence."
- **Why Gemini?**: It has a huge context window and great reasoning capabilities for recipes.
- **Streaming/Generating**: The generic `generateContent` function sends the prompt to Gemini.
- **Vision Support**: If an image is uploaded, I convert it to base64 and send it along with the prompt so Gemini can "see" the ingredients.

## 3. The "Maharaj" Prompt (`promptTemplates.js`)
"The secret sauce isn't the code, it's the Prompt Engineering."
- I didn't just say "give me recipes". I created a dynamic prompt builder.
- It takes user inputs (Jugaad, Region, Spice Level) and constructs a strict system instruction.
- **Roleplay**: Note the instruction "You are a master Indian Chef (Maharaj)". This forces the AI to adopt a specific persona.
- **JSON Enforcement**: I strictly explicitly ordered the AI to output **Pure JSON** so our frontend can render it beautifully without manual parsing.

## 4. Security
- **API Keys**: I stored the API Key in a `.env` file which is git-ignored. This means if I push this code to GitHub, my secret key won't be exposed.

## Summary mainly for YOU
"The backend is stateless. It takes a request, asks the AI, and returns the data. No databases needed for this MVP, which keeps it extremely low latency."
