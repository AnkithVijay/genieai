export interface TokenData {
    symbol: string;
    balance: string;
    value_usd: string;
    icon?: string;
}

export interface SwapAction {
    type: 'SWAP';
    from_token: string;
    to_token: string;
    amount: string;
    reason: string;
}

export interface Section {
    type: string;
    title?: string;
    content?: string | string[];
    data?: {
        tokens?: TokenData[];
    };
    actions?: SwapAction[];
    tokens?: Array<{
        symbol: string;
        name: string;
        address: string;
        logoURI?: string;
    }>;
    examples?: string[];
}

export interface AIResponseFormat {
    sections: Section[];
}

export const formatPortfolioResponse = (tokens: TokenData[]): Section => ({
    type: 'portfolio',
    title: 'Portfolio Overview',
    data: { tokens }
});

export const formatSwapAction = (
    fromToken: string,
    toToken: string,
    amount: string,
    reason: string
): SwapAction => ({
    type: 'SWAP',
    from_token: fromToken,
    to_token: toToken,
    amount,
    reason
});

export const formatAnalysis = (title: string, content: string): Section => ({
    type: 'analysis',
    title,
    content
});

export const validateResponseFormat = (response: any): AIResponseFormat => {
    if (!response.sections || !Array.isArray(response.sections)) {
        // Convert plain text responses to proper format
        return {
            sections: [{
                type: 'text',
                content: typeof response === 'string' ? response : JSON.stringify(response)
            }]
        };
    }
    return response as AIResponseFormat;
}; 