import { parse } from 'graphql'
import { gql, request } from 'graphql-request'
import { PoolsGetter } from './poolsGetter'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import {dexIds} from '../dexIdsList'
import { PoolInfo } from '../../utils/types'
import { Pool } from '../pools/pool'
import { BalancerWeightedPool } from '../pools/balancerV2WeightedPool'
import { BalancerHelperContract } from '../../contracts/rateX/BalancerHelper'

const balancerWeightedPoolTypes = ['Weighted', 'Managed', 'LiquidityBootstrapping']

export default class BalancerV2WeightedPoolsGetter implements PoolsGetter {

  endpoint = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2'
  dexId = dexIds.BALANCER_V2

  static initialize(): PoolsGetter {
    return new BalancerV2WeightedPoolsGetter()
  }

  async getTopPools(numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryTopPools(numPools))
    queryResult.pools.forEach((pool: any) => {
      try {
        poolsInfo.push(createPoolFromGraph(pool, this.dexId))
      } catch (e) {
      }
    })

    return poolsInfo
  }

  async getPoolsWithTokenPair(tokenA: string, tokenB: string, numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools))
    queryResult.pools.forEach((pool: any) => {
      try {
        poolsInfo.push(createPoolFromGraph(pool, this.dexId))
      } catch (e) {
      }
    })

    return poolsInfo
  }

  async getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithToken(token, numPools))
    queryResult.pools.forEach((pool: any) => {
      try {
        poolsInfo.push(createPoolFromGraph(pool, this.dexId))
      } catch (e) {
      }
    })

    return poolsInfo
  }

  async getAdditionalPoolDataOnchain(poolInfos: PoolInfo[]): Promise<Pool[]> {
    let newPools: Pool[] = []

    for (const pool of poolInfos) {
        // return token address after '-' split
        [pool.tokens[0]._address, pool.tokens[1]._address] = pool.tokens.map(token => token._address.split("-")[1])

        // @ts-ignore
        const res: any[] = await BalancerHelperContract.methods // @ts-ignore
        .getWeightedPoolInfo(pool.poolId)
        .call()
        .catch((err: any) => {
            console.log('Weighted Get Pool Info Error: ', err)
        })
        const [balances, weights, swapFeePercentage] = [res[3], res[4], res[5]];
        
        const weightedPool = new BalancerWeightedPool(
          pool.poolId,
          pool.dexId,
          pool.tokens,
          balances,
          weights,
          swapFeePercentage
        )             
        newPools.push(weightedPool)
    }
    return newPools
  }
}

function queryTopPools(numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql`{
    pools(first: ${numPools}, orderDirection: desc, orderBy: totalLiquidity, where: {totalLiquidity_not: "0"}) {
      id
      name
      address
      poolType
      poolTypeVersion
      tokens {
        id
        decimals
        name
      }
    }
  }
  `)
}

function queryPoolsWithTokenPair(tokenA: string, tokenB: string, numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql`{
      pools(first: ${numPools}, orderBy: totalLiquidity, where: {
          and: [
              {tokens_: {address: "${tokenA.toLowerCase()}"}},
              {tokens_: {address: "${tokenB.toLowerCase()}"}},
              {totalLiquidity_not: "0"}
            ],
        }
        ) {
          id
          address
          poolType
          poolTypeVersion
          tokens {
            id
            decimals
            name
          }
      }
  }
  `)
}

function queryPoolsWithToken(token: string, numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql`{
      pools(first: ${numPools}, orderBy: totalLiquidity, where: 
          {
              tokens_: {address_contains: "${token.toLowerCase()}"},
              totalLiquidity_not: "0"
          }
        ) {
          id
          address
          poolType
          poolTypeVersion
          tokens {
            id
            decimals
            name
          }
      }
  }
  `)
}

function createPoolFromGraph(jsonData: any, dexId: string): PoolInfo {
  const isWeighted = balancerWeightedPoolTypes.includes(jsonData.poolType)
  if (!isWeighted)
    throw new Error("BALANCER: Pool type not supported")

  const pool: PoolInfo = {
    poolId: jsonData.id,
    dexId: dexId,
    tokens: [
      {
        _address: jsonData.tokens[0].id,
        decimals: jsonData.tokens[0].decimals,
        name: jsonData.tokens[0].name
      },
      {
        _address: jsonData.tokens[1].id,
        decimals: jsonData.tokens[1].decimals,
        name: jsonData.tokens[1].name
      }
    ]
  }
  return pool
}
