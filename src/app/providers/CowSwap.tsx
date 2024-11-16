'use client'
import React, { createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, UnsignedOrder, OrderSigningUtils, SigningScheme, OrderStatus } from '@cowprotocol/cow-sdk';
import { useWeb3Auth } from './web3Init';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { getCowTokenByAddress, getCowTokenByChainId, getCowTokenBySymbol } from '../utils/cowswaputils';

interface CowSwapContextType {
    approveToken: any;
    checkApproval: any;
    getCowSwapQuote: any;
    signCowSwapOrder: any;
    getOrderStatus: any;
    searchCowTokenBySymbolToolAndChainId: any;
    getCowSupportedTokensTool: any;
    getTokenBalance: any;
    getActiveOrders: any;
}

const CowSwapContext = createContext<CowSwapContextType | null>(null);

export const useCowSwap = () => {
    const context = useContext(CowSwapContext);
    if (!context) {
        throw new Error('useCowSwap must be used within a CowSwapProvider');
    }
    return context;
};

export function CowSwapProvider({ children }: { children: React.ReactNode }) {
    const { provider } = useWeb3Auth();

    const approveToken = tool(
        async ({ tokenAddress, tokenAmount, tokenDecimals }) => {
            console.log("approveToken", tokenAmount);
            try {
                console.log("provider", tokenAddress, tokenAmount, tokenDecimals);
                if (!provider) return;
                const relayerAddress = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110';
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const approveAbi = [
                    {
                        inputs: [
                            { name: '_spender', type: 'address' },
                            { name: '_value', type: 'uint256' },
                        ],
                        name: 'approve',
                        outputs: [{ type: 'bool' }],
                        stateMutability: 'nonpayable',
                        type: 'function',
                    },
                ];
                const signer = ethersProvider.getSigner();
                const wxDai = new ethers.Contract(tokenAddress, approveAbi, signer);
                const tx = await wxDai.approve(relayerAddress, ethers.utils.parseUnits(tokenAmount, tokenDecimals));
                const receipt = await tx.wait();
                return receipt;
            } catch (error) {
                console.log("error", error);
                return error;
            }
        },
        {
            name: 'approveToken',
            description: 'Approve a token for the relayer',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token to approve'),
                tokenAmount: z.string().describe('The amount of the token to approve'),
                tokenDecimals: z.number().describe('The number of decimals of the token'),
            })
        }
    );

    const checkApproval = tool(
        async ({ tokenAddress, tokenAmount, tokenDecimals, userAddress }) => {
            console.log("called", tokenAmount);
            if (!provider) return;
            const relayerAddress = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110';
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const approveAbi = [
                {
                    "constant": true,
                    "inputs": [
                        {
                            "name": "_owner",
                            "type": "address"
                        },
                        {
                            "name": "_spender",
                            "type": "address"
                        }
                    ],
                    "name": "allowance",
                    "outputs": [
                        {
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
            ];
            const wxDai = new ethers.Contract(tokenAddress, approveAbi, ethersProvider);
            const tx = await wxDai.allowance(userAddress, relayerAddress);
            console.log("allowance", tx);
            return parseFloat(ethers.utils.formatUnits(tx, tokenDecimals)) > parseFloat(tokenAmount);
        },
        {
            name: 'checkApproval',
            description: 'Check if a token is approved',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token to check'),
                tokenAmount: z.string().describe('The amount of the token to check'),
                tokenDecimals: z.number().describe('The number of decimals of the token'),
                userAddress: z.string().describe('The address of the user to check the allowance for'),
            })
        }
    )

    const getCowSwapQuote = tool(
        async ({ chainId, sellToken, buyToken, sellAmount, address, sellAmountDecimals }) => {
            const orderBookApi = new OrderBookApi({ chainId });

            const quoteRequest: OrderQuoteRequest = {
                sellToken,
                buyToken,
                from: address,
                receiver: address,
                sellAmountBeforeFee: ethers.utils.parseUnits(sellAmount, sellAmountDecimals).toString(),
                kind: OrderQuoteSideKindSell.SELL
            };
            const { quote } = await orderBookApi.getQuote(quoteRequest);
            return quote;
        },
        {
            name: 'getCowSwapQuote',
            description: 'Get a quote for a CowSwap order',
            schema: z.object({
                chainId: z.number().describe('The chain id of the order'),
                sellToken: z.string().describe('The address of the token to sell, it is crypto currecny address'),
                buyToken: z.string().describe('The address of the token to buy, it is crypto currecny address'),
                sellAmount: z.string().describe('The amount of the token to sell in the format of 1.2345'),
                address: z.string().describe('The address of the user making the order'),
                sellAmountDecimals: z.number().describe('The number of decimals of the token to sell'),
            })
        }
    );

    const signCowSwapOrder = tool(
        async ({ chainId, sellToken, buyToken, sellAmount, address }) => {
            if (!provider) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            const orderBookApi = new OrderBookApi({ chainId });
            const ownerAddress = await signer.getAddress();
            const feeAmount = '0';
            const quoteRequest: OrderQuoteRequest = {
                sellToken,
                buyToken,
                from: address,
                receiver: address,
                sellAmountBeforeFee: sellAmount,
                kind: OrderQuoteSideKindSell.SELL
            };
            const { quote } = await orderBookApi.getQuote(quoteRequest);

            const order: UnsignedOrder = {
                ...quote,
                sellAmount,
                feeAmount,
                receiver: ownerAddress,
            }

            const orderSigningResult = await OrderSigningUtils.signOrder(order, chainId, signer);

            const orderId = await orderBookApi.sendOrder({
                ...quote,
                ...orderSigningResult,
                sellAmount: order.sellAmount,
                feeAmount: order.feeAmount,
                signingScheme: orderSigningResult.signingScheme as unknown as SigningScheme
            })

            return { orderId }
        },
        {
            name: 'signCowSwapOrder',
            description: 'Sign a CowSwap order',
            schema: z.object({
                chainId: z.number().describe('The chain id of the order'),
                sellToken: z.string().describe('The address of the token to sell'),
                buyToken: z.string().describe('The address of the token to buy'),
                sellAmount: z.string().describe('The amount of the token to sell'),
                address: z.string().describe('The address of the user making the order'),
            })
        }
    );

    const getOrderStatus = tool(
        async ({ chainId, orderId }) => {
            const orderBookApi = new OrderBookApi({ chainId });
            const order = await orderBookApi.getOrder(orderId);
            const trades = await orderBookApi.getTrades({ orderUid: orderId });
            return { order, trades };
        },
        {
            name: 'getOrderStatus',
            description: 'Get the status of a CowSwap order',
            schema: z.object({
                chainId: z.number().describe('The chain id of the order'),
                orderId: z.string().describe('The id of the order'),
            })
        }
    );

    const getActiveOrders = tool(
        async ({ address, chainId, offset = 0 }) => {
            const orderBookApi = new OrderBookApi({ chainId });
            const orders = await orderBookApi.getOrders({ owner: address, offset, limit: 10 });
            let _activeOrders = [];
            for (const order of orders) {
                if (order.status === OrderStatus.OPEN) {
                    _activeOrders.push({
                        orderId: order.uid,
                        sellToken: order.sellToken,
                        buyToken: order.buyToken,
                        sellAmount: order.sellAmount,
                        buyAmount: order.buyAmount,
                        feeAmount: order.feeAmount,
                        status: order.status,
                    });
                }
            }
            return _activeOrders;
        },
        {
            name: 'getActiveOrders',
            description: 'Get the active orders of a user',
            schema: z.object({
                address: z.string().describe('The address of the user'),
                chainId: z.number().describe('The chain id of the orders'),
                offset: z.number().describe('The offset of the orders, limit is set to 10 by default'),
            })
        }
    )

    const searchCowTokenBySymbolToolAndChainId = tool(
        async ({ chainId, symbol }) => {
            const token = await getCowTokenBySymbol(symbol, chainId);
            return token;
        },
        {
            name: 'searchCowTokenBySymbolToolAndChainId',
            description: 'Search a token by symbol and chain id',
            schema: z.object({
                chainId: z.number().describe('The chain id of the token'),
                symbol: z.string().describe('The symbol of the token'),
            })
        }
    );

    const getCowSupportedTokensTool = tool(
        async ({ chainId }) => {
            const tokens = await getCowTokenByChainId(chainId);
            return tokens;
        },
        {
            name: 'getCowSupportedTokensTool',
            description: 'Get the supported tokens for a chain',
            schema: z.object({
                chainId: z.number().describe('The chain id of the tokens'),
            })
        }
    );

    const getTokenBalance = tool(
        async ({ tokenAddress, userAddress, tokenDecimals }) => {
            try {
                if (!provider) return;
                const erc20Abi = [
                    {
                        "constant": true,
                        "inputs": [
                            {
                                "name": "_owner",
                                "type": "address"
                            }
                        ],
                        "name": "balanceOf",
                        "outputs": [
                            {
                                "name": "balance",
                                "type": "uint256"
                            }
                        ],
                        "payable": false,
                        "stateMutability": "view",
                        "type": "function"
                    }
                ]
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const contract = new ethers.Contract(tokenAddress, erc20Abi, ethersProvider);
                const balance = await contract.balanceOf(userAddress);
                return parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
            } catch (e) {
                console.log("error", e);
                return 0;
            }
        },
        {
            name: 'getTokenBalance',
            description: 'Get the balance of a token',
            schema: z.object({
                tokenAddress: z.string().describe('The address of the token'),
                userAddress: z.string().describe('The address of the user'),
                tokenDecimals: z.number().describe('The number of decimals of the token'),
            })
        }
    )

    return (
        <CowSwapContext.Provider value={{
            approveToken,
            checkApproval,
            getCowSwapQuote,
            signCowSwapOrder,
            getOrderStatus,
            searchCowTokenBySymbolToolAndChainId,
            getCowSupportedTokensTool,
            getTokenBalance,
            getActiveOrders
        }}>
            {children}
        </CowSwapContext.Provider>
    );
}
