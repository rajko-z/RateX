import { parse } from 'graphql'
import { gql, request } from 'graphql-request'
import { PoolsGetter } from './poolsGetter'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Pool, PoolInfo } from '../../utils/types'

export default class NewDex implements PoolsGetter {
  endpoint = ''
  dexId = ''

  static initialize(): PoolsGetter {
    return new NewDex()
  }

  async getTopPools(numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryTopPools(numPools))
    queryResult.pairs.forEach((pair: any) => {
      poolsInfo.push(pair.id)
    })

    return poolsInfo
  }

  async getPoolsWithTokenPair(token1: string, token2: string, first: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithTokenPair(token1, token2, first))
    queryResult.pairs.forEach((pair: any) => {
      poolsInfo.push(pair.id)
    })

    return poolsInfo
  }

  async getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]> {
    const poolsInfo: PoolInfo[] = []
    const queryResult = await request(this.endpoint, queryPoolsWithToken(token, numPools))
    queryResult.pairs.forEach((pair: any) => {
      poolsInfo.push(pair.id)
    })

    return poolsInfo
  }

  async getAdditionalPoolDataOnchain(poolInfos: PoolInfo[]): Promise<Pool[]> {
    return []
  }
}

function queryTopPools(numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql``)
}

function queryPoolsWithTokenPair(tokenA: string, tokenB: string, numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql``)
}

function queryPoolsWithToken(token: string, numPools: number): TypedDocumentNode<any, Record<string, unknown>> {
  return parse(gql``)
}
