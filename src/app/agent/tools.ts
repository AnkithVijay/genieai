import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchDefiData, fetchNFTData, fetchTokenData } from "../utils/zapper";

export const getTokenDataTool = tool(
    async ({ address }) => {
        try {
            const quote = await fetchTokenData(address);
            return quote;
        } catch (error: any) {
            return `Error getting token data: ${error.message}`;
        }
    },
    {
        name: "get_token_data",
        schema: z.object({
            address: z.string().describe("The address of the token to get the data for"),
        }),
        description: "This tool is used to get the token holdings of the user on multiple chains",
    }
);

export const getDefiDataTool = tool(
    async ({ address }) => {
        try {
            const quote = await fetchDefiData(address);
            return quote;
        } catch (error: any) {
            return `Error getting DeFi data: ${error.message}`;
        }
    },
    {
        name: "get_defi_data",
        schema: z.object({
            address: z.string().describe("The address of the user to get the DeFi data for"),
        }),
        description: "This tool is used to get the DeFi holdings of the user on multiple chains",
    }
);

export const getNftDataTool = tool(
    async ({ address }) => {
        try {
            const quote = await fetchNFTData(address);
            return quote;
        } catch (error: any) {
            return `Error getting NFT data: ${error.message}`;
        }
    },
    {
        name: "get_nft_data",
        schema: z.object({
            address: z.string().describe("The address of the user to get the NFT data for"),
        }),
    }
);