'use client'
import React, { useState } from 'react';
import { app } from './utils/langchain';
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import RPC from './utils/ethersRPC';
import { getSystemMessages } from "./utils/prompt";
import JSXStringRenderer from "./components/JSXString";
import { v4 as uuidv4 } from "uuid";

export default function Home() {

  const clientId = "BGZCvBJX8rGEZBWoGudKfqscNxmlaw6FNr7u5ni6T9iWaN-ZmST-jIhOSH1QA7nX0kXlaltJc_HmJIOiYe1T678";
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xaa36a7",
    rpcTarget: "https://rpc.ankr.com/eth_sepolia",
    // Avoid using public rpcTarget in production.
    // Use services like Infura, Quicknode etc
    displayName: "Ethereum Sepolia Testnet",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const web3AuthOptions: Web3AuthOptions = {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    privateKeyProvider,
    useAAWithExternalWallet: true,
  }
  const web3auth = new Web3Auth(web3AuthOptions);

  const [messages, setMessages] = React.useState<{ role: 'user' | 'ai', content: string, type: string }[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [threadId, setThreadId] = useState(uuidv4());
  const init = async () => {
    try {
      const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
      adapters.forEach((adapter: IAdapter<unknown>) => {
        web3auth.configureAdapter(adapter);
      });
      await web3auth.initModal();
      setProvider(web3auth.provider);

      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const login = async () => {
    await init();
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth.connected) {
      uiConsole("Not connected to Web3Auth");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  // Check the RPC file for the implementation
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole("Sending Transaction...");
    const transactionReceipt = await RPC.sendTransaction(provider);
    uiConsole(transactionReceipt);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }


  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !provider) return;

    setMessages(prev => [...prev, { role: 'user', content: message, type: "" }]);
    setInputMessage('');

    try {
      const address = "0x3Ee3Ffd237513a3477282eBA5F7c0AdF271e4aFa"
      // await RPC.getAccounts(provider);
      console.log("address", address);
      const systemMessages = getSystemMessages(address);
      const stream = await app.stream(
        { messages: [...systemMessages, { role: "user", content: message }] },
        {
          streamMode: "values",
          configurable: { thread_id: threadId }
        }
      );

      for await (const chunk of stream) {
        const lastMessage = chunk.messages[chunk.messages.length - 1];
        const type = lastMessage._getType();
        const content = lastMessage.content;
        const toolCalls = lastMessage.tool_calls;
        console.log("content", type);
        console.log("content", content);
        console.log("content", toolCalls);
        // const data = JSON.stringify({
        //     type,
        //     content,
        //     toolCalls
        // });

        if (content !== inputMessage && content && content !== "" && type === "ai") {
          setMessages(prev => [...prev, { role: 'ai', content: content, type: "html" }]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, there was an error processing your request.', type: "" }]);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col w-full max-w-2xl gap-8 row-start-2">
        <div className="flex justify-end gap-4">
          {!loggedIn ? (
            <button
              onClick={login}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Login
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={getUserInfo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Get User Info
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4 border rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${message.role === 'user'
                ? 'bg-blue-100 text-black ml-auto max-w-[80%]'
                : 'bg-gray-100 text-black mr-auto max-w-[80%]'
                }`}
            >
              {message.type === "html" ? <JSXStringRenderer jsxString={message.content} /> : message.content}
            </div>
          ))}
        </div>

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
