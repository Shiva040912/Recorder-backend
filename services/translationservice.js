const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const translateWorkToEnglish = async (work) => {
  if (!work || !work.trim()) {
    return "";
  }

  const prompt = `
Convert this Tanglish/Tamil-English mixed software development
work description into professional English.

Rules:
- Understand the meaning.
- Do not translate word-by-word.
- Do not return Tanglish.
- Do not add information.
- Keep it concise.
- Return ONLY the English sentence.

Example:
Input:
Trip sheet la ula mathiri irukura report mathri ingayum paniyachu

Output:
Implemented the report in this section similar to the existing Trip Sheet report.

Work:
${work.trim()}
`;

  let lastError;

  // Try Gemini up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const translatedText = response.text?.trim();

      if (!translatedText) {
        throw new Error("Gemini returned empty translation");
      }

      console.log("Original:", work);
      console.log("Translated:", translatedText);

      return translatedText;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini translation attempt ${attempt} failed:`,
        error.message
      );

      // Wait before retry
      if (attempt < 3) {
        await sleep(2000 * attempt);
      }
    }
  }

  throw lastError;
};

module.exports = {
  translateWorkToEnglish,
};