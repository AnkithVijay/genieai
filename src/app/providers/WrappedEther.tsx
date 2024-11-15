'use client'
import React, { createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, UnsignedOrder, OrderSigningUtils, SigningScheme } from '@cowprotocol/cow-sdk';
import { useWeb3Auth } from './web3Init';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getWrappedEthAddress } from '../utils/utils';
import { WETH_ABI } from '../abi/weth';

interface WrappedEtherContextType {
    wrapEth: any;
    unwrapEth: any;
    wethBalance: any;
}

const WrappedEtherContext = createContext<WrappedEtherContextType | null>(null);

export const useWrappedEther = () => {
    const context = useContext(WrappedEtherContext);
    if (!context) {
        throw new Error('useWrappedEther must be used within a WrappedEtherProvider');
    }
    return context;
};

export function WrappedEtherProvider({ children }: { children: React.ReactNode }) {
    const { provider } = useWeb3Auth();
    const wrapEth = tool(async ({ amount, chainId }) => {
        try {
            if (!provider || !chainId || !amount) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            const wrappedEthAddress = getWrappedEthAddress(chainId);
            const contract = new ethers.Contract(wrappedEthAddress, WETH_ABI, signer);
            const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
            return tx;
        } catch (error) {
            console.error("Error wrapping ETH:", error);
            return { error: "Error wrapping ETH" };
        }
    }, {
        name: "wrapEth",
        description: "Wrap ETH to WETH",
        schema: z.object({
            amount: z.string().describe("The amount of ETH to wrap"),
            chainId: z.number().describe("The chain ID to wrap ETH on"),
        }),
    }
    );

    const unwrapEth = tool(
        async ({ amount, chainId }) => {
            if (!provider || !chainId || !amount) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            const wrappedEthAddress = getWrappedEthAddress(chainId);
            const contract = new ethers.Contract(wrappedEthAddress, WETH_ABI, signer);
            const tx = await contract.withdraw(ethers.utils.parseEther(amount));
            return tx;
        }, {
        name: "unwrapEth",
        description: "Unwrap WETH to ETH",
        schema: z.object({
            amount: z.string().describe("The amount of WETH to unwrap"),
            chainId: z.number().describe("The chain ID to unwrap WETH on"),
        }),
    });

    const wethBalance = tool(async ({ chainId }) => {
        if (!provider || !chainId) return;
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const wrappedEthAddress = getWrappedEthAddress(chainId);
        const contract = new ethers.Contract(wrappedEthAddress, WETH_ABI, signer);
        const balance = await contract.balanceOf(signer.getAddress());
        return ethers.utils.formatEther(balance);
    }, {
        name: "wethBalance",
        description: "Get the balance of WETH",
        schema: z.object({
            chainId: z.number().describe("The chain ID to get the WETH balance on"),
        }),
    });

    return (
        <WrappedEtherContext.Provider value={{
            wrapEth,
            unwrapEth,
            wethBalance
        }}>
            {children}
        </WrappedEtherContext.Provider>
    );
}
