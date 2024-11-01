import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END, MemorySaver } from "@langchain/langgraph/web";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getNftDataTool, getDefiDataTool, getTokenDataTool } from "../agent/tools/zapper";
import { searchTool } from "../agent/tools/search";
import { getCrossChainQuoteTool, placeCrossChainOrderTool } from "../agent/tools/oneinch";

const zapperTools = [getTokenDataTool, getDefiDataTool, getNftDataTool];
const oneInchTools = [getCrossChainQuoteTool, placeCrossChainOrderTool];
const searchTools = [searchTool];


const tools = [...zapperTools, ...oneInchTools, ...searchTools];

const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
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

export const app = workflow.compile({ checkpointer: memory });
