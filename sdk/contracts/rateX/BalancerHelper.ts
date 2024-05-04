import { BalancerHelperAbi } from "../abi/BalancerHelperAbi";
import Web3 from "web3";
import initRPCProvider from "../../utils/rpcProvider";
import { BALANCER_HELPER_ADDRESS } from "../addresses";

const web3: Web3 = initRPCProvider();

export const BalancerHelperContract = new web3.eth.Contract(
    BalancerHelperAbi,
    BALANCER_HELPER_ADDRESS
);