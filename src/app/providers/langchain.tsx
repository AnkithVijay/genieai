'use client'
import React, { createContext, useContext } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END, MemorySaver } from "@langchain/langgraph/web";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getNftDataTool, getDefiDataTool, getTokenDataTool } from "../agent/tools/zapper";
import { useCowSwap } from './CowSwap';
import { useWrappedEther } from './WrappedEther';
import { useOneinch } from './Oneinch';


interface LangChainContextType {
    app: any;
}

const LangChainContext = createContext<LangChainContextType | null>(null);

export const useLangChain = () => {
    const context = useContext(LangChainContext);
    if (!context) {
        throw new Error('useLangChain must be used within a LangChainProvider');
    }
    return context;
};

export function LangChainProvider({ children }: { children: React.ReactNode }) {
    const { getCowSwapQuote, signCowSwapOrder, getOrderStatus, searchCowTokenBySymbolToolAndChainId, getCowSupportedTokensTool, approveToken, checkApproval, getTokenBalance } = useCowSwap();
    const { wrapEth, unwrapEth, wethBalance } = useWrappedEther();
    // const { getCrossChainQuoteTool, placeCrossChainOrderTool, getSupportedTokensByChainIdTool, getCrossChainSupportedTokensTool, getTokenByNameOrSymbolTool, getSameChainQuoteTool } = useOneinch();

    const zapperTools = [getTokenDataTool, getDefiDataTool, getNftDataTool];
    const wethTools = [wrapEth, unwrapEth, wethBalance];
    // const oneinchTools = [getCrossChainQuoteTool, placeCrossChainOrderTool, getSupportedTokensByChainIdTool, getCrossChainSupportedTokensTool, getTokenByNameOrSymbolTool, getSameChainQuoteTool];
    const cowswapTools = [getCowSwapQuote, approveToken, checkApproval, signCowSwapOrder, getOrderStatus, searchCowTokenBySymbolToolAndChainId, getCowSupportedTokensTool, getTokenBalance];

    const tools = [...cowswapTools, ...wethTools, ...zapperTools];
    const toolNode = new ToolNode(tools);

    const model = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    }).bindTools(tools);

    function shouldContinue(state: typeof MessagesAnnotation.State) {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];
        if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
            return "tools";
        }
        return END;
    }

    async function callModel(state: typeof MessagesAnnotation.State, config: any) {
        const { messages } = state;
        const response = await model.invoke(messages, config);
        return { messages: response };
    }

    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge(START, "agent")
        .addConditionalEdges("agent", shouldContinue, ["tools", END])
        .addEdge("tools", "agent");

    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

    return (
        <LangChainContext.Provider value={{ app }}>
            {children}
        </LangChainContext.Provider>
    );
}
