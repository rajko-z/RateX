import {SushiSwapHelperAbi} from "../abi/SushiSwapHelperAbi";
import Web3 from "web3";
import initRPCProvider from "../../utils/rpcProvider";
import {SUSHISWAP_HELPER_ADDRESS} from "../addresses";

const web3: Web3 = initRPCProvider();

export const SushiSwapHelperContract = new web3.eth.Contract(
    SushiSwapHelperAbi,
    SUSHISWAP_HELPER_ADDRESS
);