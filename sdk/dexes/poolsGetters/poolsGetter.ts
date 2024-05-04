import { PoolInfo } from '../../utils/types'
import { Pool } from '../pools/pool'

export interface PoolsGetter {
  getTopPools: (numPools: number) => Promise<PoolInfo[]>
  getPoolsWithTokenPair: (tokenA: string, tokenB: string, first: number) => Promise<PoolInfo[]>
  getPoolsWithToken: (token: string, first: number) => Promise<PoolInfo[]>
  getAdditionalPoolDataOnchain: (poolInfos: PoolInfo[]) => Promise<Pool[]>
}
