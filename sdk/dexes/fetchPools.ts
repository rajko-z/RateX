import { PoolsGetter } from './poolsGetters/poolsGetter'
import { PoolInfo } from '../utils/types'
import { Pool } from './pools/pool'

let initialized = false
let initializedDexes: PoolsGetter[] = []
let dexesPools: Map<PoolsGetter, PoolInfo[]> = new Map<PoolsGetter, PoolInfo[]>()

async function initializeDexes(): Promise<void> {
  try {
    const files = [
      'sushiSwapV2PoolsGetter.ts',
      'uniswapV3PoolsGetter.ts',
      'balancerV2WeightedPoolsGetter.ts',
      'camelotV2PoolsGetter.ts',
      'curvePoolsGetter.ts',
    ]
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const module = await import(`../dexes/poolsGetters/${file}`)
        const dex: PoolsGetter = module.default.initialize()
        initializedDexes.push(dex)
        dexesPools.set(dex, [])
      }
    }
  } catch (err) {
    console.error('Error reading directory dexes_graph:', err)
  }
}

async function checkInitializedDexes() {
  if (!initialized) {
    await initializeDexes()
    initialized = true
  }
}

/*   Returns dictionary of dexes and their poolIds for token1 and token2:
 *   UniswapV3: [poolId1, poolId2, ...],
 *   SushiSwapV2: [poolId1, poolId2, ...]
 */
async function getPoolIdsForTokenPairs(tokenA: string, tokenB: string, numPools: number = 3): Promise<void> {
  await checkInitializedDexes()

  const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithTokenPair(tokenA, tokenB, numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* Get pools from each dex in initializedDexes list that have token as one of the tokens in the pool
 * @param token: token address to match (for now the chain is Arbitrum -> param for the future)
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getPoolIdsForToken(token: string, numPools: number = 5): Promise<void> {
  await checkInitializedDexes()

  const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithToken(token, numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* Get top pools from each dex in initializedDexes list - returns a list of poolIds
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getTopPools(numPools: number = 5): Promise<void> {
  await checkInitializedDexes()

  const allPoolsPromises = initializedDexes.map((dex) => dex.getTopPools(numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* We are fetching pools from multiple dexes, so we might get duplicate pools
* top numTopPools pools for tokenFrom and tokenTo are fetched from each DEX
* top numTopPools by TVL from each DEX
* top numTopPools that contain tokenFrom and tokenTo from each DEX (possible direct swap)
*/
async function fetchPools(
  tokenFrom: string,
  tokenTo: string,
  numFromToPools: number = 5,
  numTopPools: number = 5,
  onlyPoolsWithTwoTokens: boolean = false
): Promise<Pool[]> {
  let pools: Pool[] = []
  dexesPools.forEach((poolInfos: PoolInfo[], dex: PoolsGetter) => {
    dexesPools.set(dex, [])
  })

  await checkInitializedDexes()

  // call Graph API
  const promises: Promise<void>[] = []
  promises.push(getPoolIdsForToken(tokenFrom, numFromToPools))
  promises.push(getPoolIdsForToken(tokenTo, numFromToPools))
  promises.push(getTopPools(numTopPools))
  promises.push(getPoolIdsForTokenPairs(tokenFrom, tokenTo, numFromToPools))
  await Promise.all(promises)

  filterDuplicatePools()

  if (onlyPoolsWithTwoTokens) {
    removePoolsWithMoreThanTwoTokens()
  }

  // call Solidity for additional pool data
  const dexPoolsPromises: Promise<Pool[]>[] = []
  for (let [dex, poolInfos] of dexesPools.entries()) {
    dexPoolsPromises.push(dex.getAdditionalPoolDataOnchain(poolInfos))
  }
  const allPoolsData = await Promise.all(dexPoolsPromises)
  allPoolsData.forEach((poolsData: Pool[]) => {
    pools.push(...poolsData)
  })

  return pools
}

function removePoolsWithMoreThanTwoTokens(): void {
  dexesPools.forEach((poolInfos: PoolInfo[], dex: PoolsGetter, self) => {
    const filteredPoolInfos = poolInfos.filter((poolInfo: PoolInfo) => {
      return poolInfo.tokens.length === 2
    })
    self.set(dex, filteredPoolInfos)
  })
}

function filterDuplicatePools(): void {
  dexesPools.forEach((poolInfos: PoolInfo[], dex: PoolsGetter, self) => {
    const filteredPoolInfos = poolInfos.filter((poolInfo: PoolInfo, index: number, allPoolInfos: PoolInfo[]) => {
      return allPoolInfos.findIndex((pool2) => pool2.poolId === poolInfo.poolId) === index
    })
    self.set(dex, filteredPoolInfos)
  })
}

export { fetchPools }
