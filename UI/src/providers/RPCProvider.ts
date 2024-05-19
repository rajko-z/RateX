import Web3 from 'web3'

const TENDERLY_FORK_ID = process.env.REACT_APP_TENDERLY_FORK_ID

export const tenderlyForkEndpoint: string = `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`

function initArbitrumProvider(): Web3 {
  if (TENDERLY_FORK_ID !== undefined) {
    return new Web3(new Web3.providers.HttpProvider(tenderlyForkEndpoint))
  }
  throw new Error('Tenderly fork id is not defined')
}

function initRPCProvider(chainId: number): Web3 {
  // check if metamask is connected
  if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask) {
    return new Web3(window.ethereum)
  }
  if (chainId === 42161) {
    return initArbitrumProvider()
  }
  throw new Error('Unsupported chain');
}

export default initRPCProvider
