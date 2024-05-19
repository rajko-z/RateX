import {UniswapHelperAbi} from "../abi/UniswapHelperAbi";
import Web3 from "web3";

import {UNISWAP_HELPER_ADDRESS} from "../addresses";
import { getInitializedProvider } from "../../utils/rpcProvider";

const web3: Web3 = getInitializedProvider();

export const UniswapHelperContract = new web3.eth.Contract(
    UniswapHelperAbi,
    UNISWAP_HELPER_ADDRESS
);