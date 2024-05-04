import {AmountPercentage, TRoute, TRouteWithQuote} from "./types";

/**
 * We will calculate everything offchain. Why?
 * Because if we want to call for quotes on uniswapV3, we will need separate call for each pool.
 * We can have route that theoretically looks like this:
 * sushiPool->uniPool->curvePool->uniPool->uniPool->balancerPool->uniPool
 * Here, we can't batch any calls, because we need amount out from previous pool. There is no other way than
 * to call for quote on each uni pool separately.
 * If we have 40 routes, 10 splitted amounts, and 2 uni pool on average per route, we will need 800 rpc calls.
 *
 * We can batch it, but that would require to calculate everything onchain. Which is also doable to try if we have time.
 *
 * Start with calculating everything offchain, and check final result.
 * The problem we can have is that for large trades we fetch only +- 15 ticks. Maybe that would be solved if
 * we split amount on lets say 5% percentage or even 2%. That would be fast because we will have offchain calculation. The only
 * concert is that we can end up with to many splits for large trade.
 * */

export function getRoutesWithQuotes(
    routes: TRoute[],
    amounts: AmountPercentage[]
): TRouteWithQuote[] {

    const routesWithQuotes: TRouteWithQuote[][] = [];
    routes.forEach(route => {
        routesWithQuotes.push(_getSingleRouteWithAllQuotes(route, amounts));
    });
    return routesWithQuotes.flat();
}

function _getSingleRouteWithAllQuotes(route: TRoute, amounts: AmountPercentage[]): TRouteWithQuote[] {
    const routes: TRouteWithQuote[] = [];

    amounts.forEach(amount => {
        routes.push(_getSingleRouteWithSingleQuote(route, amount));
    });

    return routes;
}

function _getSingleRouteWithSingleQuote(route: TRoute, amount: AmountPercentage): TRouteWithQuote {
    let tokenIn = route.tokenIn;
    let amountOut = amount.amountIn;

    for (let step of route.steps) {
        const tokenOut = step.tokenOut;

        amountOut = step.pool.calculateExpectedOutputAmount(tokenIn, tokenOut, amountOut);

        if (amountOut <= BigInt(0)) {
            break;
        }

        tokenIn = tokenOut;
    }
    return {
        route: route,
        quote: amountOut,
        amount: amount
    }
}
