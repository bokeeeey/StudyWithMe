import OpenAI from "openai";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../../.env.local") });

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuestion = async (topic: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates questions to test understanding of a topic.",
        },
        {
          role: "user",
          content: `Generate a question to test understanding of the topic: ${topic}`,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "No question generated";
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};

export const generateFeedback = async (
  question: string,
  answer: string
): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides feedback on answers to questions.",
        },
        {
          role: "user",
          content: `Question: ${question}\nAnswer: ${answer}\nPlease provide feedback on this answer.`,
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content || "No feedback generated";
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw error;
  }
};
