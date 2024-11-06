import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { getCowSwapQuote, signCowSwapOrder, getOrderStatus } from "@/app/utils/cowswap";
import { ethers } from "ethers";
import { JsonRpcSigner, JsonRpcProvider } from "@ethersproject/providers";


const coswapChainList = {
    ARBITRUM_ONE: SupportedChainId.ARBITRUM_ONE,
    GNOSIS_CHAIN: SupportedChainId.GNOSIS_CHAIN,
    BASE: SupportedChainId.BASE
}

export const getCowSwapQuoteTool = tool(
    async ({ chainId, sellToken, buyToken, sellAmount, sellTokenDecimals, address }) => {
        console.log("address", address);
        console.log("address", sellTokenDecimals);
        try {
            // Convert the amount to the correct decimal format
            const formattedAmount = ethers.utils.formatUnits(sellAmount, sellTokenDecimals).toString();

            // Mock signer for quote (actual signer should be passed in production)
            // const provider = new JsonRpcProvider("https://arbitrum.llamarpc.com	");
            // const signer = new JsonRpcSigner({}, provider, "0x0000000000000000000000000000000000000000");

            const quote = await getCowSwapQuote(
                chainId as SupportedChainId,
                sellToken,
                buyToken,
                formattedAmount,
                address
            );
            return JSON.stringify(quote);
        } catch (error: any) {
            return `Error getting CowSwap quote: ${error.message}`;
        }
    },
    {
        name: "get_cowswap_quote",
        schema: z.object({
            chainId: z.number().describe(`The chain ID. Currently only supports Chain (${JSON.stringify(coswapChainList)})`),
            sellToken: z.string().describe("The address of the token you want to sell"),
            buyToken: z.string().describe("The address of the token you want to buy"),
            sellAmount: z.string().describe("The amount of tokens to sell, pass exactly what is given by user"),
            sellTokenDecimals: z.number().describe("The number of decimals for the sell token"),
            address: z.string().describe("The address of the user"),
        }),
        description: "Get a quote for a CowSwap trade",
    }
);

export const signCowSwapOrderTool = tool(
    async ({ chainId, sellToken, buyToken, sellAmount, sellTokenDecimals }) => {
        try {
            const formattedAmount = ethers.utils.parseUnits(sellAmount, sellTokenDecimals).toString();

            const provider = new JsonRpcProvider("https://rpc.gnosischain.com");
            const signer = new JsonRpcSigner({}, provider, "0x0000000000000000000000000000000000000000");

            const order = await signCowSwapOrder(
                chainId as SupportedChainId,
                signer,
                sellToken,
                buyToken,
                formattedAmount
            );
            return JSON.stringify(order);
        } catch (error: any) {
            return `Error signing CowSwap order: ${error.message}`;
        }
    },
    {
        name: "sign_cowswap_order",
        schema: z.object({
            chainId: z.number().describe(`The chain ID. Currently only supports Gnosis Chain (${SupportedChainId.GNOSIS_CHAIN})`),
            sellToken: z.string().describe("The address of the token you want to sell"),
            buyToken: z.string().describe("The address of the token you want to buy"),
            sellAmount: z.string().describe("The amount of tokens to sell"),
            sellTokenDecimals: z.number().describe("The number of decimals for the sell token"),
        }),
        description: "Sign and submit a CowSwap order on Gnosis Chain",
    }
);

export const getOrderStatusTool = tool(
    async ({ chainId, orderId }) => {
        try {
            const status = await getOrderStatus(chainId as SupportedChainId, orderId);
            return JSON.stringify(status);
        } catch (error: any) {
            return `Error getting order status: ${error.message}`;
        }
    },
    {
        name: "get_order_status",
        schema: z.object({
            chainId: z.number().describe(`The chain ID. Currently only supports Gnosis Chain (${SupportedChainId.GNOSIS_CHAIN})`),
            orderId: z.string().describe("The unique identifier of the CowSwap order"),
        }),
        description: "Get the status and trade information for a CowSwap order",
    }
);
