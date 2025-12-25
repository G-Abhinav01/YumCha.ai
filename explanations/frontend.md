# YumCha.ai - Frontend Explanation (For the "Creator")

Here is how "you" designed the frontend.

## 1. The Vibe (Design System)
"I wanted something that feels premium, not like a college project."
- **Glassmorphism**: You'll see semi-transparent backgrounds (`rgba(255,255,255,0.05)`) on inputs and cards.
- **Dark Theme**: Pure black (`#0a0a0a`) background with Gold (`#FFD700`) accents.
- **Font**: Used 'Outfit', a clean modern sans-serif that looks great on screens.

## 2. No Frameworks (`Vanilla JS`)
"I chose Vanilla JavaScript (No React/Angular) for maximum performance and zero build-step complexity."
- **DOM Manipulation**: I manually create elements `document.createElement` to render the recipes.
- **State Management**: A simple `state` object tracks if we are in 'Text' mode or 'Image' mode.

## 3. The "Let Him COOK" Flow
- **Input Handling**: When you click the button, I gather all data (using `FormData`), including the image if present.
- **Animation**: I toggle a `hidden` class on the loading overlay. The simple GIF loop keeps the user engaged while the API is thinking.
- **Rendering**: When data comes back, I map through the JSON array and inject HTML into the grid.

## 4. Interactive Elements
- **Like Button**: A simple JS function toggles the heart icon.
- **View Recipe**: The "View Recipe" button toggles the visibility of the detailed ingredients list using `display: none/block`.

## 5. Mobile Responsiveness
"I used CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) so the cards automatically stack on mobile screens without needing complex media queries."
