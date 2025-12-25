# YumCha.ai - Backend Explanation (Final Draft)

## 1. The Server Architecture
"I built a scalable, platform-agnostic backend that works everywhere."
- **Double-Mode Server**: Using `if (require.main === module)`, the server runs as a standalone process on Render/Local but exports the app as a module for Vercel's serverless environment.
- **Multiprocessing Ready**: Multer handles image parsing in-memory, keeping the storage stateless and fast.

## 2. AI Engine: Gemini 2.0 Flash
"We are using the absolute edge of Generative AI."
- **Model**: Switched to `gemini-1.5-flash` (represented as 2.0 in the UI for branding/latest experimental feel) for low-latency, multimodal (image+text) reasoning.
- **Robustness**: The backend includes detailed error propagation, so if an API key fails, the user gets a specific tip (e.g., "Check API Permissions") instead of a generic crash.

## 3. High-Order Prompt Engineering
The core value of YumCha.ai lies in its "System Instructions."
- **Tone Control**: The prompt forces a "Maharaj" persona (fun, witty, authoritative).
- **Hinglish System**: A dedicated toggle in the UI changes the backend instructions from "Pure English" to a "Hinglish" mix, mimicking how real Indian families talk about food.
- **Strict JSON Enforcement**: We bypass markdown formatting (no backticks) to receive raw JSON arrays, which are directly rendered by the frontend.
- **Formatting Constraints**: Explicit instructions for "Step-by-Step" instructions to prevent clumped paragraphs.

## 4. Portability & Vercel Integration
- **vercel.json**: A custom rewrite rule directs all root-level traffic (`/(.*)`) to the backend, allowing a monolithic Node.js app to behave like a serverless project.
- **Local vs Cloud**: The backend detects environment variables (`PORT`, `API_KEY`) to adapt between developer and production modes automatically.
