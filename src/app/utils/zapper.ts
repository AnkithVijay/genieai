export const fetchTokenData = async (address: string) => {
    try {
        const response = await fetch(`api/v1/data/tokens?address=${address}`);
        if (!response.ok) throw new Error('Failed to fetch token data');
        const data = await response.json();
        return data ? JSON.stringify(data) : undefined;
    } catch (error) {
        console.error("Error fetching token data:", error);
        throw error;
    }
};

export const fetchDefiData = async (address: string) => {
    try {
        const response = await fetch(`api/v1/data/positions?address=${address}`);
        if (!response.ok) throw new Error('Failed to fetch DeFi data');
        const data = await response.json();
        return data ? JSON.stringify(data) : undefined;
    } catch (error) {
        console.error("Error fetching DeFi data:", error);
        throw error;
    }
};

export const fetchNFTData = async (address: string) => {
    try {
        const response = await fetch(`api/v1/data/nfts?address=${address}`);
        if (!response.ok) throw new Error('Failed to fetch NFT data');
        const data = await response.json();
        return data ? JSON.stringify(data) : undefined;
    } catch (error) {
        console.error("Error fetching NFT data:", error);
        throw error;
    }
};