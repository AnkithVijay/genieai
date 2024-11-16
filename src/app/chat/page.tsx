"use client";
import React, { useContext, useEffect, useState } from "react";
import { getSystemMessages } from "../utils/prompt";
import { v4 as uuidv4 } from "uuid";
import { AIResponse } from "../components/AIResponse";
import { useWeb3Auth } from "../providers/web3Init";
import { useLangChain } from "../providers/langchain";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Navbar } from "../components/Navbar/Navbar";
import { Profile } from "../components/Navbar/Profile";
import { ArrowUp } from "lucide-react";

export default function Home() {
    const [messages, setMessages] = React.useState<
        {
            role: "user" | "ai";
            content: string;
            type: string;
            isStreaming?: boolean;
        }[]
    >([]);
    const [inputMessage, setInputMessage] = React.useState("");
    const [threadId, setThreadId] = useState(uuidv4());
    const [initialized, setInitialized] = useState(false);

    const {
        provider,
        login,
        logout,
        getUserInfo,
        loggedIn,
        getBalance,
        getAccounts,
        getChainId,
    } = useWeb3Auth();
    const { app } = useLangChain();

    const promptOptions = [
        "How much ETH do I have?",
        "What is the quote for 0.02 WETH to USDT?",
        "What is the address of vijayankith.eth?",
        "Send 0.001 ETH to vijayankith.eth"
    ];

    const renderPromptOptions = () => {
        if (messages.length > 0) return null;

        return (
            <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    How can I help you today?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promptOptions.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => handleSendMessage(prompt)}
                            className="p-4 text-left border border-primary/30 rounded-lg 
                                     hover:border-primary hover:bg-primary/5 transition-all
                                     text-gray-700 hover:text-primary"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !provider) return;

        setMessages((prev) => [
            ...prev,
            { role: "user", content: message, type: "text" },
        ]);
        setInputMessage("");

        try {
            const address = await getAccounts();
            const balance = await getBalance();
            const chainId = await getChainId();

            const systemMessages = getSystemMessages(address, balance, chainId);

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: JSON.stringify({
                        sections: [
                            {
                                type: "analysis",
                                title: "Processing",
                                content: "Analyzing your request...",
                            },
                        ],
                    }),
                    type: "json",
                    isStreaming: true,
                },
            ]);

            const messagesToSend = !initialized
                ? [...systemMessages, { role: "user", content: message }]
                : [{ role: "user", content: message }];
            setInitialized(true);

            const stream = await app.stream(
                { messages: messagesToSend },
                {
                    streamMode: "values",
                    configurable: { thread_id: threadId },
                }
            );

            let fullResponse = "";
            for await (const chunk of stream) {
                const lastMessage = chunk.messages[chunk.messages.length - 1];
                if (lastMessage.content && lastMessage.content !== "") {
                    fullResponse = lastMessage.content;
                }
            }

            // Final update only for the AI message
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex].role === "ai") {
                    newMessages[lastIndex] = {
                        role: "ai",
                        content: fullResponse,
                        type: "json",
                        isStreaming: false,
                    };
                }
                return newMessages;
            });
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: JSON.stringify({
                        sections: [
                            {
                                type: "analysis",
                                title: "Error",
                                content: "Sorry, there was an error processing your request.",
                            },
                        ],
                    }),
                    type: "json",
                    isStreaming: false,
                },
            ]);
        } finally {
        }
    };

    return (
        <SidebarProvider>
            <Navbar />
            <div className="flex justify-start items-start w-screen p-4 gap-8">
                <main className="flex flex-col flex-grow h-full w-full gap-8">
                    <SidebarTrigger />
                    {renderPromptOptions()}
                    <AIResponse
                        messages={messages}
                        handleSendMessage={handleSendMessage}
                    />
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(inputMessage);
                        }}
                    >
                        <div className="flex flex-row justify-between p-2 border rounded-full text-black w-full">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full bg-transparent focus:outline-none focus:ring-0 text-black ml-4"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30 font-semibold text-lg border border-primary/50 hover:border-primary"
                            >
                                <ArrowUp />
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            <Profile />
        </SidebarProvider>
    );
}
