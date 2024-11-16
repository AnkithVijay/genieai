'use client'
import React, { createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, UnsignedOrder, OrderSigningUtils, SigningScheme } from '@cowprotocol/cow-sdk';
import { useWeb3Auth } from './web3Init';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getWrappedEthAddress } from '../utils/utils';
import { WETH_ABI } from '../abi/weth';

interface EnsProviderContextType {
    getEnsName: any;
    getEnsAddress: any;
}

const EnsProviderContext = createContext<EnsProviderContextType | null>(null);

export const useEnsProvider = () => {
    const context = useContext(EnsProviderContext);
    if (!context) {
        throw new Error('useEnsProvider must be used within a EnsProvider');
    }
    return context;
};

export function EnsProvider({ children }: { children: React.ReactNode }) {
    const { provider } = useWeb3Auth();

    const getEnsName = tool(async ({ address }) => {
        try {
            if (!provider || !address) return;
            const _provider = new ethers.providers.JsonRpcProvider('https://eth.blockscout.com/api/eth-rpc', {
                name: "mainnet",
                chainId: 1,
            });
            const ensName = await _provider.lookupAddress(address);
            return ensName;
        } catch (error) {
            console.error("Error getting ENS name:", error);
            return { error: "Error getting ENS name" };
        }
    }, {
        name: "getEnsName",
        description: "Get the ENS name for an address",
        schema: z.object({
            address: z.string().describe("The address to get the ENS name for, example: '0x1234567890123456789012345678901234567890'"),
        }),
    }
    );

    const getEnsAddress = tool(
        async ({ ensDomain }) => {
            try {
                console.log("ensDomain", ensDomain);
                if (!ensDomain) return;

                const _provider = new ethers.providers.JsonRpcProvider('https://eth.blockscout.com/api/eth-rpc', {
                    name: "mainnet",
                    chainId: 1,
                });
                const ensAvatar = await _provider.getAvatar(ensDomain);
                const ensAddress = await _provider.resolveName(ensDomain);
                return {
                    address: ensAddress,
                    avatar: ensAvatar
                };
            } catch (error) {
                console.log("Error getting ENS address:", error);
                return { error: "Error getting ENS address" };
            }
        }, {
        name: "getEnsAddress",
        description: "Get the ENS address for a domain",
        schema: z.object({
            ensDomain: z.string().describe("The ENS domain to get the address for, example: 'vitalik.eth'"),
        }),
    });


    return (
        <EnsProviderContext.Provider value={{
            getEnsName,
            getEnsAddress,
        }}>
            {children}
        </EnsProviderContext.Provider>
    );
}
