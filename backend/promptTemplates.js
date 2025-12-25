/**
 * Constructs the system prompt for the AI based on user filters.
 * @param {Object} data - The input data from the frontend.
 * @returns {String} - The formatted prompt.
 */
function constructPrompt(data) {
  const {
    inputMethod, // 'text' or 'image'
    ingredients, // if text
    dishName, // if text
    imageAnalysis, // from previous step if image mode
    skillLevel,
    spiceLevel,
    regions, // array
    jugaad, // boolean
    measurement, // 'standard' or 'local'
    language // 'english' or 'hinglish'
  } = data;

  let basePrompt = `You are a master Indian Chef (Maharaj). Generate 4 distinct Indian recipes based on the following constraints.
    
    RECIPE LANGUAGE: ${language === 'hinglish' ? 'HINGLISH (A mix of Hindi and English, common in Indian kitchens)' : 'PURE ENGLISH'}
    
    CONTEXT:
    - Target Audience: Bachelors/Hostellers/Office-goers looking for practical cooking.
    - Tone: Friendly, practical, authoritative but encouraging.
    - Output Format: PURE JSON ARRAY. No markdown code blocks, just the JSON.
    `;

  // USER PREFERENCES
  basePrompt += `\nUSER PREFERENCES:
    - Skill Level: ${skillLevel || 'novice'} (Adjust complexity accordingly)
    - Spice Level: ${spiceLevel || 'moderate'}
    - Preferred Regions: ${regions && regions.length ? regions.join(', ') : 'Any Indian region'}
    - Measurement Style: ${measurement === 'local' ? 'Use katori, pinch, glass, spoon (local Indian units)' : 'Use grams/ml'}
    - Jugaad (Substitutes) Allowed: ${jugaad ? 'YES (Suggest alternatives for hard-to-find ingredients)' : 'NO (Stick to authentic ingredients)'}
    `;

  // INPUT SPECIFICS
  if (inputMethod === 'image') {
    basePrompt += `\nINPUT: The user uploaded an image. Vision analysis (if available/simulated): "${imageAnalysis || 'Ingredients detected from image'}". Use these.`;
  } else {
    basePrompt += `\nINPUT: The user wants to cook: "${dishName || ingredients || 'Something tasty'}". Ingredients available: "${ingredients || 'Not specified'}".`;
  }

  // OUTPUT STRUCTURE
  basePrompt += `\n
    OUTPUT FORMAT (JSON ARRAY of 4 objects):
    [
      {
        "name": "Recipe Name",
        "description": "Short appetizing description",
        "region": "Origin",
        "ingredients": ["1 cup rice", "2 onions", ...],
        "instructions": ["Step 1: Specific action", "Step 2: Next action", ...],
        "jugaad_tips": "If user doesn't have X, use Y...",
        "time": "XX mins",
        "difficulty": "Easy/Medium/Hard",
        "spice_level": "Low/Medium/High"
      }
    ]
    
    CRITICAL INSTRUCTIONS:
    - "instructions" MUST be an array of strings, where each string is a single step.
    - Each step should be clear, concise, and easy to follow.
    - DO NOT clump instructions into a single paragraph.
    - Language: Strict adherence to ${language === 'hinglish' ? 'Hinglish' : 'English'}.
    
    IMPORTANT: Provide strictly valid JSON. Do not include markdown formatting like \`\`\`json.`;

  return basePrompt;
}

module.exports = { constructPrompt };
