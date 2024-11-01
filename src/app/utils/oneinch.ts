import { HashLock, SDK } from "@1inch/cross-chain-sdk";
import { randomBytes, solidityPackedKeccak256 } from "ethers";

let sdk: SDK | null = null;


const getOneInchSDK = () => {
    if (!sdk) {
        console.log("Initializing OneInch SDK");
        sdk = new SDK({
            url: "https://api.1inch.dev/fusion-plus",
            authKey: process.env.ONEINCH_API_KEY
        });
    }
    console.log("OneInch SDK initialized", sdk);
    return sdk;
}


export const getCrossChainQuote = async (params: {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: string
}) => {
    const sdk = getOneInchSDK();
    const quote = await sdk.getQuote(params);
    return quote;
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
    const sdk = getOneInchSDK();
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