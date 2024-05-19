const hre = require('hardhat')
const {resolve, join} = require("path");
const fs = require("fs");
const { config } = require('../addresses.config');
const addresses = config[hre.network.config.chainId];

async function deploySushiDex() {
  const SushiSwap = await hre.ethers.getContractFactory('SushiSwapDex');
  const sushiSwap = await SushiSwap.deploy(addresses.sushi.router);
  await sushiSwap.waitForDeployment();
  return sushiSwap;
}

async function deployCamelotDex() {
  const Camelot = await hre.ethers.getContractFactory('CamelotDex');
  const camelot = await Camelot.deploy(addresses.camelot.router);
  await camelot.waitForDeployment();
  return camelot;
}

async function deployUniswapDex() {
  const UniswapV3 = await hre.ethers.getContractFactory('UniswapV3Dex');
  const uniswap = await UniswapV3.deploy(addresses.uniV3.router);
  await uniswap.waitForDeployment();
  return uniswap;
}

async function deployCurveDex() {
  const Curve = await hre.ethers.getContractFactory("CurveDex");
  const curve = await Curve.deploy(addresses.curve.poolRegistry);
  await curve.waitForDeployment();
  return curve;
}

async function deployBalancerDex() {
    const Balancer = await hre.ethers.getContractFactory("BalancerDex");
    const balancer = await Balancer.deploy(addresses.balancer.vault);
    await balancer.waitForDeployment();
    return balancer;
}

async function deployRateX() {
  const sushiSwap = await deploySushiDex();
  const uniswap = await deployUniswapDex();
  const balancer = await deployBalancerDex();
  const curve = await deployCurveDex();
  const camelot = await deployCamelotDex();
  
  const sushiSwapAddress = await sushiSwap.getAddress();
  const uniswapAddress = await uniswap.getAddress();
  const balancerAddress = await balancer.getAddress();
  const curveAddress = await curve.getAddress();
  const camelotAddress = await camelot.getAddress();

  const initialDexes = [
    {
      dexId: "SUSHI_V2",
      dexAddress: sushiSwapAddress
    },
    {
      dexId: "UNI_V3",
      dexAddress: uniswapAddress
    },
    {
      dexId: "CURVE",
      dexAddress: curveAddress
    }, 
    {
      dexId: "BALANCER_V2",
      dexAddress: balancerAddress
    },
    {
      dexId: "CAMELOT",
      dexAddress: camelotAddress
    }
  ];

  const RateX = await hre.ethers.getContractFactory('RateX');
  const rateX = await RateX.deploy(initialDexes);
  await rateX.waitForDeployment();

  return rateX;
}

async function deploySushiSwapHelper() {
  const SushiHelper = await hre.ethers.getContractFactory('SushiSwapHelper');
  const sushiHelper = await SushiHelper.deploy();
  await sushiHelper.waitForDeployment();
  return sushiHelper;
}

async function deployBalancerHelper() {
    const BalancerHelper = await hre.ethers.getContractFactory("BalancerHelper");
    const balancerHelper = await BalancerHelper.deploy(addresses.balancer.vault);
    await balancerHelper.waitForDeployment();
    return balancerHelper;
}

async function deployCamelotHelper() {
  const CamelotHelper = await hre.ethers.getContractFactory('CamelotHelper');
  const camelotHelper = await CamelotHelper.deploy();
  await camelotHelper.waitForDeployment();
  return camelotHelper;
}

async function deployUniswapHelper() {
  const UniswapHelper = await hre.ethers.getContractFactory('UniswapHelper');
  const uniswapHelper = await UniswapHelper.deploy();
  await uniswapHelper.waitForDeployment();
  return uniswapHelper;
}

async function deployCurveHelper() {
  const CurveHelper = await hre.ethers.getContractFactory('CurveHelper');
  const curveHelper = await CurveHelper.deploy();
  await curveHelper.waitForDeployment();
  return curveHelper;
}

async function main() {
    console.log('Deploying contracts...');
    const rateX = await deployRateX();
    const uniswapHelper = await deployUniswapHelper();
    const balancerHelper = await deployBalancerHelper();
    const sushiHelper = await deploySushiSwapHelper();
    const curveHelper = await deployCurveHelper();
    const camelotHelper = await deployCamelotHelper();

    const rateXAddress = await rateX.getAddress();
    console.log('RateX address: ' + rateXAddress);

    const uniswapHelperAddress = await uniswapHelper.getAddress();
    console.log("UniswapHelper address: " + uniswapHelperAddress);

    const sushiSwapHelperAddress = await sushiHelper.getAddress();
    console.log("SushiSwapHelper address: " + sushiSwapHelperAddress);

    const curveHelperAddress = await curveHelper.getAddress();
    console.log("CurveHelper address: " + curveHelperAddress);

    const camelotHelperAddress = await camelotHelper.getAddress();
    console.log("CamelotHelper address: " + camelotHelperAddress);

    const balancerHelperAddress = await balancerHelper.getAddress();
    console.log("BalancerHelper address: " + balancerHelperAddress);

    _saveAddresses(
        rateXAddress,
        uniswapHelperAddress,
        sushiSwapHelperAddress,
        curveHelperAddress,
        camelotHelperAddress,
        balancerHelperAddress
    );
}

function _saveAddresses(
    rateXAddress,
    uniswapHelperAddress,
    sushiSwapHelperAddress,
    curveHelperAddress,
    camelotHelperAddress,
    balancerHelperAddress
) {

    const rateX = `
export const RATE_X_ADDRESS = "${rateXAddress}"`;

    const helpers = `
export const UNISWAP_HELPER_ADDRESS = "${uniswapHelperAddress}"
export const SUSHISWAP_HELPER_ADDRESS = "${sushiSwapHelperAddress}"
export const CURVE_HELPER_ADDRESS = "${curveHelperAddress}"
export const CAMELOT_HELPER_ADDRESS = "${camelotHelperAddress}"
export const BALANCER_HELPER_ADDRESS = "${balancerHelperAddress}"`;

    _saveToFile(resolve(__dirname, '../../UI/src/contracts'), rateX);
    _saveToFile(resolve(__dirname, '../../sdk/contracts'), helpers);
}

function _saveToFile(dir_path, content) {
    const filePath = join(dir_path, `addresses.ts`)
    try {
        fs.writeFileSync(filePath, content)
        console.log('File written successfully')
    } catch (error) {
        console.error(`Error writing file: ${error}`)
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

module.exports = {
    deploySushiDex,
    deployCamelotDex,
    deployUniswapDex,
    deployCurveDex,
    deployBalancerDex,
    deployRateX,
    deploySushiSwapHelper,
    deployBalancerHelper,
    deployCamelotHelper,
    deployUniswapHelper,
    deployCurveHelper
};