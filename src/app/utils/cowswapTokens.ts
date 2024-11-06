import { cowTokens } from "../data/cow_tokens";

export const getCowTokens = async () => {
    return cowTokens;
}

export const getCowTokenByAddress = async (address: string) => {
    return cowTokens.find(token => token.address === address);
}

export const getCowTokenBySymbol = async (symbol: string, chainId: number) => {
    return cowTokens.find(token => token.symbol === symbol && token.chainId === chainId);
}

export const getCowTokenByChainId = async (chainId: number) => {
    return cowTokens.filter(token => token.chainId === chainId);
}