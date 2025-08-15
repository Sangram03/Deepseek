export const maxDuration = 60;
import ConnectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with ChatGPT API key
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY, // Ensure this is set in your environment
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    // Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Connect to the database
    await ConnectDB();

    // Find the chat document in the database
    const data = await Chat.findOne({ userId, _id: chatId });
    if (!data) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      });
    }

    // Create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    data.messages.push(userPrompt);

    // Call the OpenAI API to get a chat completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4o", "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      store: true,
    });

    // Append assistant's reply
    const message = {
      ...response.choices[0].message,
      timestamp: Date.now(),
    };
    data.messages.push(message);

    // Save updated chat
    await data.save();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
