import { Token } from "../../utils/types"

export abstract class Pool {
    poolId: string
    dexId: string
    tokens: Token[]
  
    protected constructor(poolId: string, dexId: string, tokens: Token[]) {
      this.poolId = poolId
      this.dexId = dexId
      this.tokens = tokens.map((token) => ({ _address: token._address.toLowerCase(), decimals: token.decimals, name: token.name }))
    }
  
    abstract calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint
    abstract update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void
  
    containsToken(token: string): boolean {
      return this.tokens.some((t) => t._address.toLowerCase() === token.toLowerCase())
    }
  
    getToken0(): Token {
      return this.tokens[0]
    }
  
    getToken1(): Token {
      return this.tokens[1]
    }
  }