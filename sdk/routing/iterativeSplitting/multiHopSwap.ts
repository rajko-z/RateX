import { Pool } from '../../dexes/pools/pool'
import {Route, SwapStep, Token} from '../../utils/types'

type DpInfo = {
  amountOut: bigint
  path: string[]
  swaps: SwapStep[]
}

const max_hops = 4

/**
 * The algorithm to find the best route for each iteration (highest output amount) is seen below.
 * @param amountIn The amount of tokenIn that we want to swap (in wei)
 * @param tokenIn The address of the token we want to swap
 * @param tokenOut The address of the token we want to receive
 * @param graph The graph of all the fetched pools. Maps a token to a list of pools that contain that token.
 * @returns found route
 */
function multiHopSwap(
  amountIn: bigint,
  tokenIn: string,
  tokenOut: string,
  graph: Map<string, Pool[]>
): Route {

  tokenIn = tokenIn.toLowerCase()
  tokenOut = tokenOut.toLowerCase()

  // dp[hop][token]
  const dp: Map<number, Map<string, DpInfo>> = new Map<number, Map<string, DpInfo>>()
  dp.set(0, new Map<string, DpInfo>())
  dp.get(0)?.set(tokenIn, { amountOut: amountIn, path: [tokenIn], swaps: [] })

  const res: DpInfo = { amountOut: BigInt(-1), path: [], swaps: [] }

  for (let hop = 0; hop < max_hops - 1; hop++) {
    dp.get(hop)?.forEach((dpInfo: DpInfo, tokenA: string) => {
      graph.get(tokenA)?.forEach((pool: Pool) => {
        pool.tokens.forEach((tokenB: Token) => {
          if (dpInfo.path.includes(tokenB._address)) {
            return
          }

          let amountOut: bigint = pool.calculateExpectedOutputAmount(tokenA, tokenB._address, dpInfo.amountOut)
          if (pool.dexId === 'CURVE') {
            amountOut = pool.calculateExpectedOutputAmount(tokenA, tokenB._address, dpInfo.amountOut)
          }

          if (amountOut <= BigInt(0)) {
            return
          }

          const newPath: string[] = [...dpInfo.path, tokenB._address]
          const currSwap: SwapStep = { poolId: pool.poolId, dexId: pool.dexId, tokenIn: tokenA, tokenOut: tokenB._address }
          const newSwaps: SwapStep[] = [...dpInfo.swaps, currSwap]

          if (!dp.has(hop + 1)) {
            dp.set(hop + 1, new Map<string, DpInfo>())
          }

          const dpEntry = dp.get(hop + 1)

          if (!dpEntry?.has(tokenB._address) || amountOut > (dpEntry?.get(tokenB._address)?.amountOut || 0)) {
            dp.get(hop + 1)?.set(tokenB._address, { amountOut: amountOut, path: newPath, swaps: newSwaps })
          }
        })
      })
    })

    const lastUsedHop = dp.get(hop + 1);

    if (lastUsedHop?.has(tokenOut)) {
      const tokenOutEntry = lastUsedHop.get(tokenOut);
      if ((tokenOutEntry?.amountOut) || -1 > res.amountOut) {
        res.amountOut = tokenOutEntry?.amountOut || BigInt(0)
        res.path = tokenOutEntry?.path || []
        res.swaps = tokenOutEntry?.swaps || []
      }
    }
  }

  return {
    swaps: res.swaps,
    quote: res.amountOut,
    percentage: 0,
    amountIn: BigInt(0) // will be set in iterative splitting when we know percentage
  }
}

export { multiHopSwap }
