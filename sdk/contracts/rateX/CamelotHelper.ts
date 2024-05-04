import { CamelotHelperAbi } from "../abi/CamelotHelperAbi";
import Web3 from "web3";
import initRPCProvider from "../../utils/rpcProvider";
import { CAMELOT_HELPER_ADDRESS } from "../addresses";

const web3: Web3 = initRPCProvider();

export const CamelotHelperContract = new web3.eth.Contract(
    CamelotHelperAbi,
    CAMELOT_HELPER_ADDRESS
);