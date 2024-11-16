import { EIP712TypedData, HashLock, OrderParams, Quote, QuoteParams, SDK } from "@1inch/cross-chain-sdk";
import { ethers } from "ethers";

import { FusionSDK, NetworkEnum, QuoteParams as FusionQuoteParams } from "@1inch/fusion-sdk";

let sdk: SDK | null = null;
let fusionxSdk: FusionSDK | null = null;

type BlockchainProviderConnector = {
    signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string>;
    ethCall(contractAddress: string, callData: string): Promise<string>;
}

export const getOneInch = (signer: ethers.Signer) => {
    if (!sdk) {
        const blockchainProvider: BlockchainProviderConnector = {
            signTypedData: async (walletAddress: string, typedData: EIP712TypedData) => {
                return "0x" //+ await signer.signMessage(typedData);
            },
            ethCall: async (contractAddress: string, callData: string) => {
                const contract = new ethers.Contract(contractAddress, callData, signer);
                return contract.call(callData);
            }
        };
        sdk = new SDK({
            url: "https://api.1inch.dev/fusion-plus",
            authKey: process.env.ONEINCH_API_KEY,
            blockchainProvider: blockchainProvider
        });
    }
    return sdk;
}

export const getFusionxSdk = (network: number) => {
    console.log("apiKey", process.env.ONEINCH_API_KEY);
    fusionxSdk = new FusionSDK({
        url: "https://api.1inch.dev/fusion",
        authKey: process.env.ONEINCH_API_KEY || "",
        network: network
    });
    return fusionxSdk;
}


export const placeOrder = async (params: {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: string,
    enableEstimate: boolean,
    walletAddress: string,
}, signer: ethers.Signer) => {
    const sdk = getOneInch(signer);
    const quote = await sdk.getQuote(params);
    const secretsCount = quote.getPreset().secretsCount;

    const secrets = Array.from({ length: secretsCount }).map(() => getRandomBytes32());
    const secretHashes = secrets.map((x) => HashLock.hashSecret(x));
    const hashLock =
        secretsCount === 1
            ? HashLock.forSingleFill(secrets[0])
            : HashLock.forMultipleFills(
                secretHashes.map((secretHash, i) =>
                    ethers.utils.solidityKeccak256(["uint64", "bytes32"], [i, secretHash.toString()])
                ) as (string & {
                    _tag: "MerkleLeaf";
                })[]
            );

    const response = await sdk
        .placeOrder(quote, {
            walletAddress: params.walletAddress,
            hashLock,
            secretHashes
        });
    return response;
}

function getRandomBytes32(): any {
    return ethers.utils.randomBytes(32);
}



export const getCrossChainQuote = async (params: QuoteParams, destinationTokenDecimals: number, signer: ethers.Signer) => {
    const sdk = getOneInch(signer);
    const response = await sdk.getQuote(params);
    return ethers.utils.parseUnits(response.dstTokenAmount.toString(), destinationTokenDecimals);
}

export const getSameChainQuote = async (params: FusionQuoteParams, amount: string, chainId: number, toTokenDecimals: number) => {
    const sdk = getFusionxSdk(chainId);
    const response = await sdk.getQuote({
        ...params,
        amount: amount
    });
    console.log("quote resp", response.toTokenAmount);
    return ethers.utils.formatUnits(response.toTokenAmount, toTokenDecimals);
}

export const getCrossChainSupportedTokens = async (start: number, end: number) => {
    const url = "https://api.1inch.dev/token/v1.2/multi-chain/token-list";
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}`
        },
        params: {},
        paramsSerializer: {
            indexes: null
        }
    }
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return {
            total: data.length,
            tokens: data.slice(start, end)
        };
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const getSupportedTokensByChainId = async (chainId: number, start: number, end: number) => {
    const url = `https://api.1inch.dev/token/v1.2/${chainId}`;
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}`
        },
        params: {},
        paramsSerializer: {
            indexes: null
        }
    };
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        const tokenAddressArray = Object.keys(data);
        const tokenAddressRange = tokenAddressArray.slice(start, end);
        const tokenObjectArray = tokenAddressRange.map(address => data[address]);
        return {
            total: tokenAddressArray.length,
            tokens: tokenObjectArray
        };
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const getTokenByNameOrSymbol = async (chainId: number, nameOrSymbol: string) => {
    const url = `https://api.1inch.dev/token/v1.2/${chainId}/search`;
    const config = {
        headers: {
            "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}`
        },
        params: {
            query: nameOrSymbol,
            only_positive_rating: true
        },
        paramsSerializer: {
            indexes: null
        }
    }
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return error;
    }
}