import OpenAI from "openai";

export const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
});

export const MODEL = process.env.LLM_MODEL ?? "";
