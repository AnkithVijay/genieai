export const getWrappedEthAddress = (chainId: number) => {
    switch (chainId) {
        case 1: return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
        case 11155111: return "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
        default: return "";
    }
}