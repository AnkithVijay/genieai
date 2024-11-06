import { Contract } from 'ethers';
import { ethers } from 'ethers';
import type { Signer } from '@ethersproject/abstract-signer';
import { SupportedChainId, OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, OrderSigningUtils, UnsignedOrder, SigningScheme } from '@cowprotocol/cow-sdk';
import { Provider } from '@ethersproject/providers';


export const approveToken = async (tokenAddress: string, relayerAddress: string, provider: Provider) => {
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

    const wxDai = new Contract(tokenAddress, approveAbi, provider);
    // const tx = await wxDai.approve(relayerAddress, ethers.utils.MaxUint256);
    // const receipt = await tx.wait();

    // return receipt;

}

export const getCowSwapQuote = async (chainId: SupportedChainId, sellToken: string, buyToken: string, sellAmount: string, address: string) => {

    const orderBookApi = new OrderBookApi({ chainId });
    // const ownerAddress = await signer.getAddress();

    const quoteRequest: OrderQuoteRequest = {
        sellToken,
        buyToken,
        from: address,
        receiver: address,
        sellAmountBeforeFee: sellAmount,
        kind: OrderQuoteSideKindSell.SELL,
    };

    const { quote } = await orderBookApi.getQuote(quoteRequest);
    return quote;
}

export const signCowSwapOrder = async (chainId: SupportedChainId, signer: Signer, sellToken: string, buyToken: string, sellAmount: string) => {
    const orderBookApi = new OrderBookApi({ chainId });
    const ownerAddress = await signer.getAddress();

    const feeAmount = '0'

    const quote = await getCowSwapQuote(chainId, ownerAddress, sellToken, buyToken, sellAmount);

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
}

export const getOrderStatus = async (chainId: SupportedChainId, orderId: string) => {
    const orderBookApi = new OrderBookApi({ chainId });
    const order = await orderBookApi.getOrder(orderId);
    const trades = await orderBookApi.getTrades({ orderUid: orderId });

    return {
        order,
        trades
    }
}