import { BalancerHelperAbi } from "../abi/BalancerHelperAbi";
import Web3 from "web3";
import { BALANCER_HELPER_ADDRESS } from "../addresses";
import { getInitializedProvider } from "../../utils/rpcProvider";

const web3: Web3 = getInitializedProvider();

export const BalancerHelperContract = new web3.eth.Contract(
    BalancerHelperAbi,
    BALANCER_HELPER_ADDRESS
);