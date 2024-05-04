require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path:__dirname+'/.env'})

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19"
      },
      {
        version: "0.8.0"
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.19",
      },
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    tenderly: {
        chainId: 42161,
        url: `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_ID}`,
        accounts: [
            process.env.SECRET_KEY || "",
        ]
    }
  }
};
