import { Pool } from '../../dexes/pools/pool'
import {ComputeRoutesParams, TRoute, TRouteStep} from "./types";

export default function computeRoutes(
    tokenIn: string,
    tokenOut: string,
    pools: Pool[],
    maxHops: number
) {
    const usedPools = Array<boolean>(pools.length).fill(false);
    const routes: TRoute[] = [];

    const params = new ComputeRoutesParams(tokenIn, tokenOut, pools, maxHops);

    _computeRoutes(
        params,
        [],
        usedPools,
        routes,
        tokenIn
    );

    return routes;
}

function _computeRoutes(
    params: ComputeRoutesParams,
    currentRoute: TRouteStep[],
    usedPools: boolean[],
    foundRoutes: TRoute[],
    previousTokenOut: string
) {
    if (currentRoute.length > params.maxHops) {
        return;
    }

    if (routeFound(currentRoute, params)) {
        foundRoutes.push({
            steps: [...currentRoute],
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut
        });
        return;
    }

    for (let i = 0; i < params.pools.length; i++) {

        /// @dev we won't use the same pool twice
        /// this way we avoid situation where first pass through the pool can change the second pass quoted amount
        if (usedPools[i]) {
            continue;
        }

        const currPool = params.pools[i];

        if (!currPool.containsToken(previousTokenOut)) {
            continue;
        }

        const tokensToExplore = currPool.tokens.filter((token) => token._address.toLowerCase() !== previousTokenOut.toLowerCase());

        for (let token of tokensToExplore) {
            currentRoute.push({pool: currPool, tokenOut: token._address});
            usedPools[i] = true;

            _computeRoutes(
                params,
                currentRoute,
                usedPools,
                foundRoutes,
                token._address
            );

            usedPools[i] = false;
            currentRoute.pop();
        }
    }
}

function routeFound(route: TRouteStep[], params: ComputeRoutesParams): boolean {
    return route.length > 0 && route[route.length - 1].tokenOut.toLowerCase() === params.tokenOut.toLowerCase();
}

