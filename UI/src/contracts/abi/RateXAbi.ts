export const RateXAbi = [{"inputs":[{"components":[{"internalType":"string","name":"dexId","type":"string"},{"internalType":"address","name":"dexAddress","type":"address"}],"internalType":"struct RateX.DexType[]","name":"_initialDexes","type":"tuple[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"dexId","type":"string"},{"indexed":false,"internalType":"address","name":"dexAddress","type":"address"}],"name":"DexAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"dexId","type":"string"}],"name":"DexRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"dexId","type":"string"},{"indexed":false,"internalType":"address","name":"oldAddress","type":"address"},{"indexed":false,"internalType":"address","name":"newAddress","type":"address"}],"name":"DexReplaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"tokenIn","type":"address"},{"indexed":false,"internalType":"address","name":"tokenOut","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountOut","type":"uint256"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"}],"name":"SwapEvent","type":"event"},{"inputs":[{"components":[{"internalType":"string","name":"dexId","type":"string"},{"internalType":"address","name":"dexAddress","type":"address"}],"internalType":"struct RateX.DexType","name":"_dex","type":"tuple"}],"name":"addDex","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"dexes","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSupportedDexes","outputs":[{"components":[{"internalType":"string","name":"dexId","type":"string"},{"internalType":"address","name":"dexAddress","type":"address"}],"internalType":"struct RateX.DexType[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_dexId","type":"string"}],"name":"removeDex","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"dexId","type":"string"},{"internalType":"address","name":"dexAddress","type":"address"}],"internalType":"struct RateX.DexType","name":"_dex","type":"tuple"}],"name":"replaceDex","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"supportedDexes","outputs":[{"internalType":"string","name":"dexId","type":"string"},{"internalType":"address","name":"dexAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"poolId","type":"address"},{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"string","name":"dexId","type":"string"}],"internalType":"struct RateX.SwapStep[]","name":"swaps","type":"tuple[]"},{"internalType":"uint256","name":"amountIn","type":"uint256"}],"internalType":"struct RateX.Route[]","name":"_foundRoutes","type":"tuple[]"},{"internalType":"address","name":"_tokenIn","type":"address"},{"internalType":"address","name":"_tokenOut","type":"address"},{"internalType":"uint256","name":"_amountIn","type":"uint256"},{"internalType":"uint256","name":"_quotedAmountWithSlippageProtection","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"}],"name":"swap","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]