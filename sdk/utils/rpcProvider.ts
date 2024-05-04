import Web3 from 'web3'

const TENDERLY_FORK_ID = '57a7e872-732d-4e91-8637-f2823a470047';
const tenderlyForkEndpoint: string = `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`;

function initArbitrumProvider(): Web3 {
  return new Web3(new Web3.providers.HttpProvider(tenderlyForkEndpoint));
}

function initRPCProvider(): Web3 {
  return initArbitrumProvider();
}

export default initRPCProvider;
