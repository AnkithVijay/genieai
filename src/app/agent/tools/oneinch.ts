import { getCrossChainQuote, getCrossChainSupportedTokens, getSameChainQuote, getSupportedTokensByChainId, getTokenByNameOrSymbol, placeOrder } from "@/app/utils/oneinch";
import { SupportedChains } from "@1inch/cross-chain-sdk";
import { tool } from "@langchain/core/tools";
import { ethers } from "ethers";
import { z } from "zod";
import { QuoteParams as FusionQuoteParams } from "@1inch/fusion-sdk";

export const getCrossChainQuoteTool = tool(
    async ({ srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, srcTokenDecimals, dstTokenDecimals }) => {
        try {
            const params = {
                srcChainId,
                dstChainId,
                srcTokenAddress,
                dstTokenAddress,
                amount: ethers.parseUnits(amount, srcTokenDecimals).toString()
            };
            const quote = await getCrossChainQuote(params, dstTokenDecimals);
            return quote;
        } catch (error: any) {
            return `Error getting quote: ${error.message}`;
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
            srcTokenDecimals: z.number().describe("The decimals of the source token"),
            dstTokenDecimals: z.number().describe("The decimals of the destination token"),
        }),
        description: "This tool is used to get the cross chain quote for a swap from 1inch, srcChainId and dstChainId should be different",
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



export const getSupportedTokensByChainIdTool = tool(
    async ({ chainId, start, end }) => {
        const tokens = await getSupportedTokensByChainId(chainId, start, end);
        return JSON.stringify(tokens);
    },
    {
        name: "get_supported_tokens_by_chain_id",
        schema: z.object({
            chainId: z.number().describe("The chain id of the chain to get the supported tokens for, here is the list of supported chains: " + JSON.stringify(SupportedChains)),
            start: z.number().describe("The start index of the tokens to get"),
            end: z.number().describe("The end index of the tokens to get"),
        }),
        description: "This tool is used to get the supported tokens for a chain id, here is the list of supported chains: " + JSON.stringify(SupportedChains),
    }
)

export const getCrossChainSupportedTokensTool = tool(
    async ({ start, end }) => {
        const tokens = await getCrossChainSupportedTokens(start, end);
        return JSON.stringify(tokens);
    },
    {
        name: "get_cross_chain_supported_tokens",
        schema: z.object({
            start: z.number().describe("The start index of the tokens to get"),
            end: z.number().describe("The end index of the tokens to get"),
        }),
        description: "This tool is used to get the supported tokens for all chains, here is the list of supported chains: " + JSON.stringify(SupportedChains),
    }
)

export const getTokenByNameOrSymbolTool = tool(
    async ({ chainId, nameOrSymbol }) => {
        const token = await getTokenByNameOrSymbol(chainId, nameOrSymbol);
        return JSON.stringify(token);
    },
    {
        name: "get_token_by_name_or_symbol",
        schema: z.object({
            chainId: z.number(),
            nameOrSymbol: z.string(),
        }),
        description: "This tool is used to get the token by name or symbol for a chain id",
    }
)

export const getSameChainQuoteTool = tool(
    async ({ params, chainId, fromTokenDecimals, toTokenDecimals }) => {
        console.log("ammmount", params.amount);
        console.log("fromTokenDecimals", fromTokenDecimals);
        console.log("formatted amount", ethers.parseUnits(params.amount, fromTokenDecimals).toString());
        params.amount = ethers.parseUnits(params.amount, fromTokenDecimals).toString();
        const quote = await getSameChainQuote(params as FusionQuoteParams, params.amount, chainId, toTokenDecimals);
        console.log("quote", quote);
        return quote;
    },
    {
        name: "get_same_chain_quote",
        schema: z.object({
            params: z.object({
                fromTokenAddress: z.string().describe("The address of the token to swap from"),
                toTokenAddress: z.string().describe("The address of the token to swap to"),
                amount: z.string().describe("The amount of tokens to swap, this is the amount of tokens you want to sell"),
            }),
            chainId: z.number().describe("The chain id of the chain to swap on, list of supported chains: " + JSON.stringify(SupportedChains)),
            fromTokenDecimals: z.number().describe("The decimals of the token to swap from"),
            toTokenDecimals: z.number().describe("The decimals of the token to swap to"),
        }),
        description: "This tool is used to get the quote for a swap on the same chain",
    }
)

export const getAmountInDecimalsTool = tool(
    async ({ amount, decimals }) => {
        return ethers.parseUnits(amount, decimals).toString();
    },
    {
        name: "get_amount_in_decimals",
        schema: z.object({
            amount: z.string(),
            decimals: z.number(),
        }),
        description: "This tool is used to get the amount in decimals",
    }
)