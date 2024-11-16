'use client'
import React, { createContext, useContext } from 'react';
import { useWeb3Auth } from './web3Init';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { ethers } from 'ethers';

interface ContractInteractionContextType {
    getReadContractABI: any;
    getWriteContractABI: any;
    readContract: any;
    writeContract: any;
}

const ContractInteractionContext = createContext<ContractInteractionContextType | null>(null);

export const useContractInteraction = () => {
    const context = useContext(ContractInteractionContext);
    if (!context) {
        throw new Error('useContractInteraction must be used within a ContractInteractionProvider');
    }
    return context;
};

export function ContractInteractionProvider({ children }: { children: React.ReactNode }) {
    const { provider } = useWeb3Auth();

    const blockscoutApiKey = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_KEY;

    const getReadContractABI = tool(
        async ({ contractAddress }) => {
            try {
                // polygon.blockscout.com
                // eth-sepolia.blockscout.com
                const response = await fetch(`https://eth-sepolia.blockscout.com/api/v2/smart-contracts/${contractAddress}/methods-read?is_custom_abi=false&from=0xF61f5c4a3664501F499A9289AaEe76a709CE536e`);
                const data = await response.json();
                return {
                    abi: data,
                };
            } catch (error) {
                console.error("Error fetching ABI:", error);
                return { error: "Error fetching ABI" };
            }
        }, {
        name: "getContractABI",
        description: "Get the ABI for a smart contract which is used to read data from the contract",
        schema: z.object({
            contractAddress: z.string().describe("The address of the smart contract")
        }),
    });

    const getWriteContractABI = tool(
        async ({ contractAddress, chainId }) => {
            try {
                // polygon.blockscout.com
                // eth-sepolia.blockscout.com
                const response = await fetch(`https://eth-sepolia.blockscout.com/api/v2/smart-contracts/${contractAddress}/methods-write?is_custom_abi=false&from=0xF61f5c4a3664501F499A9289AaEe76a709CE536e`);
                const data = await response.json();
                return {
                    abi: data,
                };
            } catch (error) {
                console.error("Error fetching ABI:", error);
                return { error: "Error fetching ABI" };
            }
        }, {
        name: "getWriteContractABI",
        description: "Get the ABI for a smart contract which is used to write data to the contract",
        schema: z.object({
            contractAddress: z.string().describe("The address of the smart contract"),
            chainId: z.string().describe("The chain ID where the contract is deployed"),
        }),
    });

    const readContract = tool(
        async ({ contractAddress, abi, functionName, args }) => {
            try {
                console.log("read contract", contractAddress, abi, functionName, args);
                if (!provider) return { error: "Provider not available" };
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const contract = new ethers.Contract(contractAddress, abi, ethersProvider);
                let result;
                if (Object.keys(args).length > 0) {
                    result = await contract[functionName]({ ...args });
                } else {
                    result = await contract[functionName]();
                }
                return result;
            } catch (error) {
                console.error("Error reading contract:", error);
                return { error: "Error reading contract" };
            }
        }, {
        name: "readContract",
        description: "Read data from a smart contract",
        schema: z.object({
            contractAddress: z.string().describe("The address of the smart contract"),
            abi: z.any().describe("The ABI of the contract which you can get from the getReadContractABI and getWriteContractABI tools"),
            functionName: z.string().describe("The name of the function to call"),
            args: z.any().describe("The arguments to pass to the function, example ['value1','value2'}]"),
        }),
    });

    const writeContract = tool(
        async ({ contractAddress, abi, functionName, args }) => {
            try {
                console.log("write contract", contractAddress, abi, functionName, args);
                if (!provider) return { error: "Provider not available" };

                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const signer = ethersProvider.getSigner();
                const contract = new ethers.Contract(contractAddress, abi, signer);
                const result = await contract[functionName](...args);
                return result;
            } catch (error) {
                console.error("Error writing to contract:", error);
                return { error: "Error writing to contract" };
            }
        }, {
        name: "writeContract",
        description: "Write data to a smart contract",
        schema: z.object({
            contractAddress: z.string().describe("The address of the smart contract"),
            abi: z.any().describe("The ABI of the contract which you can get from the getReadContractABI and getWriteContractABI tools"),
            functionName: z.string().describe("The name of the function to call"),
            args: z.any().describe("The arguments to pass to the function, example ['value1','value2'}]"),
        }),
    });

    return (
        <ContractInteractionContext.Provider value={{
            getReadContractABI,
            getWriteContractABI,
            readContract,
            writeContract,
        }}>
            {children}
        </ContractInteractionContext.Provider>
    );
}
