import { getCrossChainQuote, placeOrder } from "@/app/utils/oneinch";
import { SupportedChains } from "@1inch/cross-chain-sdk";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getCrossChainQuoteTool = tool(
    async ({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount }) => {
        try {
            const quote = await getCrossChainQuote({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount });
            return quote;
        } catch (error: any) {
            return `Error getting token data: ${error.message}`;
        }
    },
    {
        name: "get_cross_chain_quote",
        schema: z.object({
            srcChainId: z.number().describe(`The source chain id, these are the supported chains : ${JSON.stringify(SupportedChains)}`),
            dstChainId: z.number().describe(`The destination chain id, these are the supported chains : ${JSON.stringify(SupportedChains)}`),
            srcTokenAddress: z.string().describe("The source token address"),
            dstTokenAddress: z.string().describe("The destination token address"),
            amount: z.string().describe("The amount to swap in wei"),
        }),
        description: "This tool is used to get the cross chain quote for a swap from 1inch",
    }
);

export const placeCrossChainOrderTool = tool(
    async ({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, enableEstimate, walletAddress }) => {
        try {
            const quote = await placeOrder({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, enableEstimate, walletAddress });
            return quote;
        } catch (error: any) {
            return `Error placing order: ${error.message}`;
        }
    },
    {
        name: "place_cross_chain_order",
        schema: z.object({
            srcChainId: z.number().describe(`The source chain id, these are the supported chains : ${JSON.stringify(SupportedChains)}`),
            dstChainId: z.number().describe(`The destination chain id, these are the supported chains : ${JSON.stringify(SupportedChains)}`),
            srcTokenAddress: z.string().describe("The source token address"),
            dstTokenAddress: z.string().describe("The destination token address"),
            amount: z.string().describe("The amount to swap in wei"),
            enableEstimate: z.boolean().describe("Whether to enable estimate"),
            walletAddress: z.string().describe("The wallet address"),
        }),
        description: "This tool is used to place a cross chain order on 1inch",
    }
);