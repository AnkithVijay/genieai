'use client'
import React, { createContext, useContext } from 'react';
import { useWeb3Auth } from './web3Init';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import RPC from '../utils/ethersRPC';
import { ethers } from 'ethers';

interface EnsProviderContextType {
    getEnsName: any;
    getEnsAddress: any;
    sendAmount: any;
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

            const response = await fetch('https://gateway.thegraph.com/api/b1476e653e1c7bf04dd27b6181df59e0/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `{
                        accounts(where: { id: "${address.toLowerCase()}" }) {
                            domains(first: 1) {
                                name
                            }
                        }
                    }`
                })
            });

            const data = await response.json();
            const domains = data.data?.accounts[0]?.domains;

            if (!domains || domains.length === 0) {
                return null;
            }

            return domains[0].name;
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
                if (!ensDomain) return;

                const response = await fetch('https://gateway.thegraph.com/api/b1476e653e1c7bf04dd27b6181df59e0/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `{
                            domains(where: { name: "${ensDomain}" }) {
                                id
                                name
                                labelName
                                expiryDate
                                resolvedAddress {
                                    id
                                }
                            }
                        }`
                    })
                });

                const data = await response.json();
                const domain = data.data?.domains[0];
                const _provider = new ethers.providers.JsonRpcProvider("https://eth.blockscout.com/api/eth-rpc");
                const image = await _provider.getAvatar(domain.resolvedAddress?.id);

                if (!domain) {
                    return { error: "ENS domain not found" };
                }

                return {
                    address: domain.resolvedAddress?.id,
                    avatar: image
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

    const sendAmount = tool(
        async ({ reciever, amount }) => {
            try {
                if (!provider || !reciever || !amount) return;

                const tx = await RPC.sendTransaction(provider, reciever, amount);
                return tx;
            } catch (error) {
                console.log("Error sending amount:", error);
                return { error: "Error sending amount" };
            }
        }, {
        name: "sendAmount",
        description: "Send an amount of ETH to an ens address",
        schema: z.object({
            reciever: z.string().describe("The address to send the ETH to, example: '0x1234567890123456789012345678901234567890'"),
            amount: z.string().describe("The amount of erc20 or eth to send, example: '1'"),
        }),
    });

    return (
        <EnsProviderContext.Provider value={{
            getEnsName,
            getEnsAddress,
            sendAmount,
        }}>
            {children}
        </EnsProviderContext.Provider>
    );
}
