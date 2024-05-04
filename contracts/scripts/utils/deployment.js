hre = require('hardhat');
const { config } = require('../../addresses.config');

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

module.exports = {
  deployRateX,
  deploySushiDex,
  deploySushiSwapHelper,
  deployCurveDex,
  deployCurveHelper,
  deployUniswapDex,
  deployUniswapHelper,
  deployBalancerDex,
  deployBalancerHelper,
  deployCamelotDex,
  deployCamelotHelper
}


