/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

const getChainId = async (provider: IProvider): Promise<any> => {
    try {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        // Get the connected Chain's ID
        const networkDetails = await ethersProvider.getNetwork();
        return networkDetails.chainId.toString();
    } catch (error) {
        return error;
    }
}

const getAccounts = async (provider: IProvider): Promise<any> => {
    try {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();

        // Get user's Ethereum public address
        const address = signer.getAddress();

        return await address;
    } catch (error) {
        return error;
    }
}

const getBalance = async (provider: IProvider): Promise<string> => {
    try {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();

        // Get user's Ethereum public address
        const address = signer.getAddress();

        // Get user's balance in ether
        const balance = ethers.utils.formatEther(
            await ethersProvider.getBalance(address) // Balance is in wei
        );

        return balance;
    } catch (error) {
        return error as string;
    }
}

const sendTransaction = async (provider: IProvider, to: string, amount: string): Promise<any> => {
    try {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();

        const destination = to;

        const fees = await ethersProvider.getFeeData()

        if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) {
            throw new Error("Failed to get fee data");
        }

        // Submit transaction to the blockchain
        const tx = await signer.sendTransaction({
            to: destination,
            value: amount,
            maxPriorityFeePerGas: fees.maxPriorityFeePerGas!, // Max priority fee per gas
            maxFeePerGas: fees.maxFeePerGas!, // Max fee per gas
        });

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        return receipt;
    } catch (error) {
        return error as string;
    }
}

const signMessage = async (provider: IProvider): Promise<any> => {
    try {
        // For ethers v5
        // const ethersProvider = new ethers.providers.Web3Provider(provider);
        const ethersProvider = new ethers.providers.Web3Provider(provider);

        // For ethers v5
        // const signer = ethersProvider.getSigner();
        const signer = ethersProvider.getSigner();
        const originalMessage = "YOUR_MESSAGE";

        // Sign the message
        const signedMessage = await signer.signMessage(originalMessage);

        return signedMessage;
    } catch (error) {
        return error as string;
    }
}

export default { getChainId, getAccounts, getBalance, sendTransaction, signMessage };