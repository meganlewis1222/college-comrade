import { NextResponse } from "next/server"; // Next.js's way of returning a response to user
import dotenv, { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // AI model

    const reqObj = await req.json(); // Parse request to JS object
    const prompt = reqObj.prompt; // Extract prompt from user

    // const result = await model.generateContent(prompt); // Send prompt to model
    const result = await model.generateContentStream(prompt);
    /* const response = await result.response;
    const textToSend = response.text(); // Convert response promise to text */

    /*// Print text as it comes in.
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
    }

    return NextResponse.json({ message: textToSend });*/

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result.stream) {
                    const chunkText = await chunk.text();
                    controller.enqueue(encoder.encode(chunkText));
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
