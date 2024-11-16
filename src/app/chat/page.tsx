'use client'
import React, { useContext, useEffect, useState } from 'react';
import { getSystemMessages } from "../utils/prompt";
import { v4 as uuidv4 } from "uuid";
import { AIResponse } from '../components/AIResponse';
import { useWeb3Auth } from '../providers/web3Init';
import { useLangChain } from '../providers/langchain';

export default function Home() {

    const [messages, setMessages] = React.useState<{ role: 'user' | 'ai', content: string, type: string, isStreaming?: boolean }[]>([]);
    const [inputMessage, setInputMessage] = React.useState('');
    const [threadId, setThreadId] = useState(uuidv4());
    const [initialized, setInitialized] = useState(false);

    const { provider, login, logout, getUserInfo, loggedIn, getBalance, getAccounts, getChainId } = useWeb3Auth();
    const { app } = useLangChain();

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !provider) return;

        setMessages(prev => [...prev, { role: 'user', content: message, type: 'text' }]);
        setInputMessage('');

        try {
            const address = await getAccounts();
            const balance = await getBalance();
            const chainId = await getChainId();

            const systemMessages = getSystemMessages(address, balance, chainId);

            setMessages(prev => [...prev, {
                role: 'ai',
                content: JSON.stringify({
                    sections: [{
                        type: 'analysis',
                        title: 'Processing',
                        content: 'Analyzing your request...'
                    }]
                }),
                type: 'json',
                isStreaming: true
            }]);

            const messagesToSend = !initialized ? [...systemMessages, { role: "user", content: message }] : [{ role: "user", content: message }];
            setInitialized(true);

            const stream = await app.stream(
                { messages: messagesToSend },
                {
                    streamMode: "values",
                    configurable: { thread_id: threadId }
                }
            );

            let fullResponse = '';
            for await (const chunk of stream) {
                const lastMessage = chunk.messages[chunk.messages.length - 1];
                if (lastMessage.content && lastMessage.content !== "") {
                    fullResponse = lastMessage.content;
                }
            }

            // Final update only for the AI message
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex].role === 'ai') {
                    newMessages[lastIndex] = {
                        role: 'ai',
                        content: fullResponse,
                        type: 'json',
                        isStreaming: false
                    };
                }
                return newMessages;
            });
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: JSON.stringify({
                    sections: [{
                        type: 'analysis',
                        title: 'Error',
                        content: 'Sorry, there was an error processing your request.'
                    }]
                }),
                type: 'json',
                isStreaming: false
            }]);
        } finally {

        }
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col w-full max-w-2xl gap-8 row-start-2">
                <AIResponse messages={messages} handleSendMessage={handleSendMessage} />
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage(inputMessage);
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg text-black"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </form>
            </main>
        </div>
    );
}