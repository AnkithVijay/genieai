import { HashLock, OrderParams, Quote, QuoteParams, SDK } from "@1inch/cross-chain-sdk";
import { ethers, randomBytes, solidityPackedKeccak256 } from "ethers";

import { FusionSDK, NetworkEnum, QuoteParams as FusionQuoteParams } from "@1inch/fusion-sdk";

let sdk: SDK | null = null;
let fusionxSdk: FusionSDK | null = null;







export const getOneInch = () => {
    if (!sdk) {
        sdk = new SDK({
            url: "https://api.1inch.dev/fusion-plus",
            authKey: process.env.ONEINCH_API_KEY
        });
    }
    return sdk;
}

export const getFusionxSdk = (network: number) => {
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
    walletAddress: string
}) => {
    const sdk = getOneInch();
    const quote = await sdk.getQuote(params);
    const secretsCount = quote.getPreset().secretsCount;

    const secrets = Array.from({ length: secretsCount }).map(() => getRandomBytes32());
    const secretHashes = secrets.map((x) => HashLock.hashSecret(x));
    const hashLock =
        secretsCount === 1
            ? HashLock.forSingleFill(secrets[0])
            : HashLock.forMultipleFills(
                secretHashes.map((secretHash, i) =>
                    solidityPackedKeccak256(["uint64", "bytes32"], [i, secretHash.toString()])
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
    return randomBytes(32);
}



export const getCrossChainQuote = async (params: QuoteParams, destinationTokenDecimals: number) => {
    const sdk = getOneInch();
    const response = await sdk.getQuote(params);
    return ethers.parseUnits(response.dstTokenAmount.toString(), destinationTokenDecimals);
}

export const getSameChainQuote = async (params: FusionQuoteParams, amount: string, chainId: number, toTokenDecimals: number) => {
    const sdk = getFusionxSdk(chainId);
    const response = await sdk.getQuote({
        ...params,
        amount: amount
    });
    console.log("quote resp", response.toTokenAmount);
    return ethers.formatUnits(response.toTokenAmount, toTokenDecimals);
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
    const url = `https://api.1inch.dev/token/v1.2/${chainId}/search?query=${nameOrSymbol}&only_positive_rating=true`;
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
        return data;
    } catch (error) {
        console.error(error);
        return error;
    }
}