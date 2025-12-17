export type NetworkType = 'ETHEREUM_TESTNET' | 'BSC_TESTNET';

export const NETWORKS = {
  ETHEREUM_TESTNET: {
    chainId: '0x5',
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Goerli ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
  BSC_TESTNET: {
    chainId: '0x61',
    chainName: 'BSC Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  },
};
