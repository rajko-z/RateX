import { Token } from '../../../utils/types'
import {PoolData, PoolState} from './types'
import {AdaptedPoolData, LastQuote, PoolInfo, TickData} from "./types";
import { UniswapHelperContract } from '../../../contracts/rateX/UniswapHelper'
import { UniswapV3OffchainQuoter } from './quoter'
import { Pool } from '../pool';

export class UniswapV3PoolsState {
  private static poolStateMap: Map<string, PoolState> = new Map<string, PoolState>()
  public static quoter: UniswapV3OffchainQuoter = new UniswapV3OffchainQuoter()
  private static batch_size = 3;

  private constructor() {}

  public static getPoolState(poolAddress: string): PoolState | undefined {
    return this.poolStateMap.get(poolAddress.toLowerCase());
  }

  private static async getPoolsDataFromContract(pools: string[]): Promise<PoolData[]> {
    const rawPoolsData: any[] = await UniswapHelperContract.methods.fetchData(pools, 15).call()
    return rawPoolsData.map((rawPoolData: any) => _convertRowPoolData(rawPoolData))
  }


  public static async initializeFreshPoolsData(pools: string[]) {
    const poolsSize = pools.length;
    const numberOfBatches = Math.ceil(poolsSize / this.batch_size);

    const promises: Promise<PoolData[]>[] = [];

    for (let i = 0; i < numberOfBatches; i++) {
      const batch = pools.slice(i * this.batch_size, (i + 1) * this.batch_size);
      promises.push(this.getPoolsDataFromContract(batch));
    }

    const allPoolsData = await Promise.all(promises);

    allPoolsData.flat().forEach((poolData: PoolData) => {
      let poolState = _convertInitialPoolDataToPoolState(poolData);
      this.poolStateMap.set(poolData.info.pool.toLowerCase(), poolState);
    });
  }
}

export class UniswapV3Pool extends Pool {

  private quoter: UniswapV3OffchainQuoter;

  public constructor(poolId: string, dexId: string, tokens: Token[]) {
    super(poolId.toLowerCase(), dexId, tokens)
    this.quoter = new UniswapV3OffchainQuoter();
  }

  calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint {
    const poolData: PoolState | undefined = UniswapV3PoolsState.getPoolState(this.poolId)
    if (!poolData) {
      console.log('ERROR: Data for uni v3 pool: ' + this.poolId + ' not found')
      return BigInt(0)
    }

    return this.quoter.quote(poolData, tokenIn, tokenOut, amountIn)[0]
  }

  update(tokenIn: string, tokenOut: string, amountIn: bigint) {
    const poolData: PoolState | undefined = UniswapV3PoolsState.getPoolState(this.poolId)
    if (!poolData) {
      console.log('ERROR: Data for uni v3 pool: ' + this.poolId + ' not found')
      return BigInt(0)
    }

    // lastQuote will be stored each time we call quote
    const lastQuote = poolData.lastQuote;
    poolData.data.currentLiquidity = lastQuote.newLiquidity;
    poolData.data.currentSqrtPriceX96 = lastQuote.newSqrtPriceX96;
    poolData.data.currentTickIndex = lastQuote.newTickIndex;
  }
}


function _convertRowPoolData(poolData: any): PoolData {

    const getPoolInfo = (poolInfoRaw: any): PoolInfo => {
        const pool: string = poolInfoRaw[0];
        const token0: string = poolInfoRaw[1];
        const token1: string = poolInfoRaw[2];
        const tick: bigint = poolInfoRaw[3];
        const tickLiquidityNet: bigint = poolInfoRaw[4];
        const tickSpacing: bigint = poolInfoRaw[5];
        const fee: bigint = poolInfoRaw[6];
        const sqrtPriceX96: bigint = poolInfoRaw[7];
        const liquidity: bigint = poolInfoRaw[8];

        return new PoolInfo(
            pool,
            token0,
            token1,
            tick,
            tickLiquidityNet,
            tickSpacing,
            fee,
            sqrtPriceX96,
            liquidity
        );
    }

    const getTickData = (tickDataRaw: any): TickData => {
        const tick: bigint = tickDataRaw[0];
        const initialized: boolean = tickDataRaw[1];
        const liquidityNet: bigint = tickDataRaw[2];

        return new TickData(
            tick,
            initialized,
            liquidityNet
        );
    }

    const zeroForOneTicksRaw = poolData[1];
    const zeroForOneTicks: TickData[] = [];
    for (let i = 0; i < zeroForOneTicksRaw.length; i++) {
        zeroForOneTicks.push(getTickData(zeroForOneTicksRaw[i]));
    }

    const oneForZeroTicksRaw = poolData[2];
    const oneForZeroTicks: TickData[] = [];
    for (let i = 0; i < oneForZeroTicksRaw.length; i++) {
        oneForZeroTicks.push(getTickData(oneForZeroTicksRaw[i]));
    }

    return new PoolData(
        getPoolInfo(poolData[0]),
        zeroForOneTicks,
        oneForZeroTicks
    );
}

function _convertInitialPoolDataToPoolState(poolData: PoolData): PoolState {
    const adaptedPoolData = new AdaptedPoolData(poolData);
    const lastQuote = new LastQuote(
        adaptedPoolData.currentLiquidity,
        adaptedPoolData.currentSqrtPriceX96,
        adaptedPoolData.currentTickIndex
    );

    return new PoolState(adaptedPoolData, lastQuote);
}
