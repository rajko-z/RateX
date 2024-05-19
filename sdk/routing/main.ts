import {Quote, AlgoType} from "../utils/types";
import {findRouteUniLikeAlgo} from "./uniswapV3SmartRouter/main";
import {findRouteWithIterativeSplitting} from "./iterativeSplitting/split";
import { fetchPools } from "../dexes/fetchPools";
import { Pool } from "../dexes/pools/pool";
import { initRPCProvider } from "../utils/rpcProvider";

export async function findQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  algoType: AlgoType = AlgoType.ITERATIVE_SPLITTING,
  rpcProvider: string
): Promise<Quote> {

    initRPCProvider(rpcProvider);

    const numFromToPools = 5;
    const numTopPools = 5;

    // for uni-like algo, use only pools with two tokens. For pools with more than two tokens, it get's really slow
    const onlyUsePoolsWithTwoTokens = algoType === AlgoType.UNI_V3_SMART_ROUTER_LIKE_ALGO;

    console.log('before fetching pools');
    const pools: Pool[] = await fetchPools(
      tokenIn,
      tokenOut,
      numFromToPools,
      numTopPools,
      onlyUsePoolsWithTwoTokens
    );

    console.log('Fetched pools:', pools)
    console.log("Pool size: ", pools.length)
    
    let foundQuote;
    if (algoType === AlgoType.UNI_V3_SMART_ROUTER_LIKE_ALGO) {
      foundQuote = findRouteUniLikeAlgo(tokenIn, tokenOut, amountIn, pools);
    }
    else if (algoType === AlgoType.ITERATIVE_SPLITTING) {
      foundQuote = findRouteWithIterativeSplitting(tokenIn, tokenOut, amountIn, pools);
    }
    else {
      throw new Error(`AlgoType ${algoType} not supported`);
    }

    // if poolId is in bytes32 convert it to address 
    foundQuote.routes[0].swaps.map((swap) => {
      if (swap.poolId.length === 66) {
        swap.poolId = swap.poolId.slice(0, 42)
      }
      return swap
    });

    return foundQuote;
}