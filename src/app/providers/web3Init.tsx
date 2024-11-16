'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import RPC from '../utils/ethersRPC';

interface Web3ContextType {
    provider: IProvider | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getUserInfo: () => Promise<void>;
    loggedIn: boolean;
    getBalance: () => Promise<string>;
    getAccounts: () => Promise<string>;
    getChainId: () => Promise<number>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3Auth = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3Auth must be used within a Web3Provider');
    }
    return context;
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);


    const clientId = "BGZCvBJX8rGEZBWoGudKfqscNxmlaw6FNr7u5ni6T9iWaN-ZmST-jIhOSH1QA7nX0kXlaltJc_HmJIOiYe1T678";
    const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xaa36a7",
        rpcTarget: "https://rpc.ankr.com/eth_sepolia",
        displayName: "Ethereum Sepolia Testnet",
        blockExplorerUrl: "https://sepolia.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    };

    useEffect(() => {
        const init = async () => {
            try {
                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });

                const web3AuthOptions: Web3AuthOptions = {
                    clientId,
                    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                    privateKeyProvider,
                    useAAWithExternalWallet: true,
                };

                const web3authInstance = new Web3Auth(web3AuthOptions);
                const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
                adapters.forEach((adapter: IAdapter<unknown>) => {
                    web3authInstance.configureAdapter(adapter);
                });
                await web3authInstance.initModal();

                setWeb3auth(web3authInstance);
                if (web3authInstance.connected) {
                    setLoggedIn(true);
                    setProvider(web3authInstance.provider);
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const login = async () => {
        try {
            if (!web3auth) return;
            const web3authProvider = await web3auth.connect();
            setProvider(web3authProvider);
            setLoggedIn(true);
        } catch (error) {
            alert("Error logging in");
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            if (!web3auth) return;
            await web3auth.logout();
            setProvider(null);
            setLoggedIn(false);
        } catch (error) {
            alert("Error logging out");
            console.error(error);
        }
    };

    const getUserInfo = async () => {
        if (!web3auth?.connected) {
            console.log("Not connected to Web3Auth");
            return;
        }
        try {
            const user = await web3auth.getUserInfo();
            console.log(user);
        } catch (error) {
            alert("Error getting user info");
            console.error(error);
        }
    };

    const getBalance = async () => {
        if (!provider) return "0";
        try {
            const balance = await RPC.getBalance(provider);
            if (!balance) return "0";
            return balance;
        } catch (error) {
            alert("Error getting balance");
            console.error(error);
            return "0";
        }
    };

    const getAccounts = async () => {
        if (!provider) return;
        try {
            const accounts = await RPC.getAccounts(provider);
            return accounts;
        } catch (error) {
            alert("Error getting accounts");
            console.error(error);
            return [];
        }
    };

    const getChainId = async () => {
        if (!provider) return;
        try {
            const chainId = await RPC.getChainId(provider);
            return chainId;
        } catch (error) {
            alert("Error getting chain id");
            console.error(error);
            return 0;
        }
    };

    return (
        <Web3Context.Provider value={{ provider, login, logout, getUserInfo, loggedIn, getBalance, getAccounts, getChainId }}>
            {children}
        </Web3Context.Provider>
    );
}