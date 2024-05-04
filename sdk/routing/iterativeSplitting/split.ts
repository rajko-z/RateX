import {Quote, Route } from "../../utils/types";
import { Pool } from '../../dexes/pools/pool'
import {multiHopSwap} from "./multiHopSwap";
import objectHash from "object-hash";

// percentage of the amountIn that we split into
const step: number = 5

/**
 * Algorithm that splits the input amount into (100/step) parts of step% each and finds the best route for each split.
 * The algorithm to find the best route for each iteration finds the route with the highest output amount.
 * (code is seen in ./multiHopSwap.ts)
 * After each iteration, the pools are updated with the amounts that passed through them.
 * 
 * @param tokenIn The address of the token we want to swap
 * @param tokenOut The address of the token we want to receive
 * @param amountIn The amount of tokenIn that we want to swap (in wei)
 * @param pools The fetched pools
 * @returns found quote
 */
function findRouteWithIterativeSplitting(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    pools: Pool[]
): Quote {

    const graph = _createGraph(pools)

    let amountOut: bigint = BigInt(0)
    const poolMap: Map<string, Pool> = new Map<string, Pool>(pools.map((pool: Pool) => [pool.poolId, pool]))
    const routes: Map<string, Route> = new Map<string, Route>()
    const splitAmountIn: bigint = (amountIn * BigInt(step)) / BigInt(100)

    for (let i = 0; i < 100; i += step) {
        const route: Route = multiHopSwap(splitAmountIn, tokenIn, tokenOut, graph)
        const routeHash = objectHash(route.swaps)

        let existingRoute: Route | undefined = routes.get(routeHash)
        if (!existingRoute) {
            route.percentage = step
            routes.set(routeHash, route)
        } else {
            existingRoute.percentage += step
        }

        amountOut += route.quote
        updatePoolsInRoute(poolMap, route, splitAmountIn)
    }

    const foundRoutes: Route[] = [];

    for (let route of routes.values()) {
        route.amountIn = (BigInt(route.percentage) * amountIn) / BigInt(100);
        foundRoutes.push(route);
    }
    const missingAmount = amountIn - foundRoutes.reduce((acc, route) => acc + route.amountIn, BigInt(0));
    foundRoutes[0].amountIn += missingAmount;

    const quote: Quote = { routes: foundRoutes, quote: amountOut };
    console.log("IterativeQuote: ", quote);
    return quote;
}

// Function to update all the pools in a route with the amounts that passed through them
function updatePoolsInRoute(poolMap: Map<string, Pool>, route: Route, amountIn: bigint): void {
    for (let swap of route.swaps) {
        const pool: Pool | undefined = poolMap.get(swap.poolId)
        if (!pool) {
            console.log('Pool ', swap.poolId, " doesn't exist!")
            continue
        }

        const amountOut: bigint = pool.calculateExpectedOutputAmount(swap.tokenIn, swap.tokenOut, amountIn)
        pool.update(swap.tokenIn, swap.tokenOut, amountIn, amountOut)
        amountIn = amountOut
    }
}

/**
 * Function to create a graph from all the fetched pools
 * Graph maps every token to a list of pools that token is in
 * 
 * @param pools The fetched pools
 * @returns The graph
 */
function _createGraph(pools: Pool[]): Map<string, Pool[]> {
    const graph: Map<string, Pool[]> = new Map<string, Pool[]>()
    for (let pool of pools) {
      for (let token of pool.tokens) {
        if (!graph.has(token._address)) {
          graph.set(token._address, [])
        }
        graph.get(token._address)?.push(pool)
      }
    }
  
    return graph
}

export { findRouteWithIterativeSplitting }