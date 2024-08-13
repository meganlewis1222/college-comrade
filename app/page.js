"use client";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./Home.module.css";

export default function Home() {
    // Stores all messages in chatbot conversation, intialised to a standard greeting message
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Welcome to CollegeComrade! How may I help you?",
        },
    ]);
    const [userResponse, setUserResponse] = useState(""); // Stores the latest message from user

    // Function used to send the user's latest message to the API
    const sendMessage = async () => {
        // Update messages and render user message
        setMessages((messages) => [
            ...messages,
            { role: "user", content: userResponse },
        ]);
        setUserResponse("");
        // Chatbot begins responding
        setMessages((messages) => [
            ...messages,
            { role: "assistant", content: "" },
        ]);
        // Perform API call
        const response = await fetch("api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "aplication/json",
            },
            body: JSON.stringify({
                messages: messages,
                prompt: userResponse,
            }),
        });

        // TODO: use markdown to clean up the response from model
        // Streaming the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let chunk;
        let newMessage = "";

        while (!(chunk = await reader.read()).done) {
            const text = decoder.decode(chunk.value);
            console.log("Received chunk:", text);
            // Append the chunk to your chatbot UI
            newMessage += chunk;
            setMessages((messages) => {
                let lastMessage = messages[messages.length - 1];
                let otherMessages = messages.slice(0, messages.length - 1);
                return [
                    ...otherMessages,
                    { ...lastMessage, content: lastMessage.content + text },
                ];
            });
        }
    };
    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems={"center"}
            bgcolor="black"
        >
            <Stack
                direction="column"
                width={"500px"}
                height={"700px"}
                border={"1px solid black"}
                bgcolor={"white"}
                padding={3}
            >
                <Stack
                    direction={"column"}
                    spacing={2}
                    flexGrow={1}
                    overflow={"auto"}
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display={"flex"}
                            justifyContent={
                                message.role === "assistant"
                                    ? "flex-start"
                                    : "flex-end"
                            }
                        >
                            <Box
                                bgcolor={
                                    message.role === "assistant"
                                        ? "primary.main"
                                        : "secondary.main"
                                }
                                color={"white"}
                                borderRadius={5}
                                p={2}
                                className={styles["markdown-content"]}
                            >
                                {/* Render Markdown content */}
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Stack>

            <Stack
                direction={"row"}
                spacing={2}
                bgcolor={"white"}
                width={"500px"}
            >
                <TextField
                    label="Enter your reply here."
                    fullWidth
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                ></TextField>
                <Button variant="contained" onClick={sendMessage}>
                    Send
                </Button>
            </Stack>
        </Box>
    );
}
