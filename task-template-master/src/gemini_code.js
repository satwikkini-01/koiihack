

import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = "AIzaSyDAgtN1RiD7oMBSMMEuioVPwTjXoklDHYc"

async function generateSummary(context, apiKey) {
  try {
      const genAI = new GoogleGenerativeAI(apiKey);

      let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Construct the prompt with context
      const prompt = {
          contents: [
          {
              role: 'user',
              parts: [
              {
                  text: `Summarize the following news article into a concise paragraph containing the key details, including the main topic, any important names, dates, locations, and outcomes. Ensure the summary is clear and objective, without personal opinions or embellishments. Keep the summary under [desired word count] words.
                  Article: \n\n${JSON.stringify(
                  context
                  )}`,
              },
              ],
          },
          ],
      };

      const result = await model.generateContent(prompt);

      console.log('gemini returned comment', result.response.text());
      const comment = result.response.text();
      
      return comment;

  } catch (error) {
    console.error('Error generating Bluesky comment:', error);
    return null; // Or handle the error as needed
  }
}
const data = {
  headlines:"BJP To File Police Case Against Rahul Gandhi After MPs Allege Injury",
  content:"New Delhi: Protest, counterprotests and brawls, and now a police case against Congress MP Rahul Gandhi - over Home Minister Amit Shah's"
}
generateSummary(data, apiKey)
