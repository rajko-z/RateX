import Web3 from 'web3'

let web3: Web3;

export function initRPCProvider(rpcProviderUrl: string): void {
  web3 = new Web3(new Web3.providers.HttpProvider(rpcProviderUrl));
}

export function getInitializedProvider(): Web3 {
  if (!web3) {
    throw new Error('Web3 provider is not initialized');
  }
  return web3;
}
