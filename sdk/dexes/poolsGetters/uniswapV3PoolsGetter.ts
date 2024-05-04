import { parse } from 'graphql'
import { gql, request } from 'graphql-request'
import { PoolsGetter } from './poolsGetter'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import {dexIds} from '../dexIdsList'
import { PoolInfo } from '../../utils/types'
import { Pool } from '../pools/pool'
import { UniswapV3Pool, UniswapV3PoolsState } from '../pools/uniswapV3/uniswapV3Pool';

export default class UniswapV3PoolsGetter implements PoolsGetter {
  endpoint = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum'
  dexId = dexIds.UNI_V3

  static initialize(): PoolsGetter {
    return new UniswapV3PoolsGetter()
  }

  async getTopPools(numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryTopPools(numPools))
    queryResult.liquidityPools.forEach((pool: any) => {
      poolsInfo.push(createPoolFromGraph(pool, this.dexId))
    })

    return poolsInfo
  }

  async getPoolsWithTokenPair(tokenA: string, tokenB: string, numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools))
    queryResult.liquidityPools.forEach((pool: any) => {
      poolsInfo.push(createPoolFromGraph(pool, this.dexId))
    })

    return poolsInfo
  }

  async getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithToken(token, numPools))
    queryResult.liquidityPools.forEach((pool: any) => {
      poolsInfo.push(createPoolFromGraph(pool, this.dexId))
    })
    return poolsInfo
  }

  async getAdditionalPoolDataOnchain(poolInfos: PoolInfo[]): Promise<Pool[]> {
    const pools = poolInfos.map((poolInfo: PoolInfo) => poolInfo.poolId)
    console.log("Start initialization");
    await UniswapV3PoolsState.initializeFreshPoolsData(pools)
    console.log("End initialization");
    return poolInfos.map((poolInfo: PoolInfo) => new UniswapV3Pool(poolInfo.poolId, this.dexId, poolInfo.tokens))
  }
}

function queryTopPools(numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql`
    {
      liquidityPools(first:${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD) {
        id
        cumulativeVolumeUSD
        inputTokens {
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
    liquidityPools(first: ${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD, where: {
      and: [
        {inputTokens_: {id: "${tokenA.toLowerCase()}"}},
        {inputTokens_: {id: "${tokenB.toLowerCase()}"}}
      ]
    }
    ) {
      id
      cumulativeVolumeUSD
      inputTokens {
        id
        decimals
        name
      }
    }
  }`)
}

function queryPoolsWithToken(token: string, numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql`{
    liquidityPools(first: ${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD, where: {
      inputTokens_: { id: "${token.toLowerCase()}" }
    }
    ) {
      id
      cumulativeVolumeUSD
      inputTokens {
        id
        decimals
        name
      }
    }
  }`)
}

function createPoolFromGraph(jsonData: any, dexId: string): PoolInfo {
  const pool: PoolInfo = {
    poolId: jsonData.id,
    dexId: dexId,
    tokens: jsonData.inputTokens.map((token: any, index: any) => {
      return {
        _address: token.id,
        decimals: token.decimals,
        name: token.name
      }
    }),
  }
  return pool
}
