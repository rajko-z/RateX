import {CurveHelperAbi} from "../abi/CurveHelperAbi";
import Web3 from "web3";
import {CURVE_HELPER_ADDRESS} from "../addresses";
import { getInitializedProvider } from "../../utils/rpcProvider";

const web3: Web3 = getInitializedProvider();

export const CurveHelperContract = new web3.eth.Contract(
    CurveHelperAbi,
    CURVE_HELPER_ADDRESS
);