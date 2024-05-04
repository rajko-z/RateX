export type Token = {
  _address: string
  decimals: number
  name?: string
}

export type PoolInfo = {
  poolId: string
  dexId: string
  tokens: Token[]
}

export type SwapStep = {
  poolId: string
  dexId: string
  tokenIn: string
  tokenOut: string
}

export type Route = {
  swaps: SwapStep[]
  amountIn: bigint
  percentage: number
  quote: bigint
}

export type Quote = {
  routes: Route[],
  quote: bigint
}

export enum AlgoType {
  UNI_V3_SMART_ROUTER_LIKE_ALGO,
  ITERATIVE_SPLITTING
}