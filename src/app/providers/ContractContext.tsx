'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWeb3Auth } from './web3Init';

interface ContractContextType {
    getSigner: () => Promise<ethers.Signer | undefined>;
    writeContract: (contractAddress: string, contractABI: any[], methodName: string, ...args: any[]) => Promise<any>;
    readContract: (contractAddress: string, contractABI: any[], methodName: string, ...args: any[]) => Promise<any>;
}

const ContractContext = createContext<ContractContextType | null>(null);

export function useContract() {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
}

interface ContractProviderProps {
    children: ReactNode;
}

export function ContractProviderWrapper({ children }: ContractProviderProps) {
    const { provider } = useWeb3Auth();

    const getSigner = async () => {
        if (!provider) return;
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        return signer;
    }

    const writeContract = async (contractAddress: string, contractABI: any[], methodName: string, ...args: any[]) => {
        if (!provider) return;
        const signer = await getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        return await contract.functions[methodName](...args);
    }

    const readContract = async (contractAddress: string, contractABI: any[], methodName: string, ...args: any[]) => {
        if (!provider) return;
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const contract = new ethers.Contract(contractAddress, contractABI, ethersProvider);
        return await contract.functions[methodName](...args);
    }

    return (
        <ContractContext.Provider value={{ getSigner, writeContract, readContract }}>
            {children}
        </ContractContext.Provider>
    );
} 