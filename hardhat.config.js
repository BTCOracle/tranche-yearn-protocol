require("@nomiclabs/hardhat-waffle");
// require("hardhat-log-remover");
require("solidity-coverage");
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-truffle5");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

process.env.TEST_MNEMONIC =
  "test test test test test test test test test test test junk";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  accounts: {
    mnemonic: process.env.TEST_MNEMONIC,
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        runs: 200,
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.TEST_URI,
        gasLimit: 8e6,
        blockNumber: 11611333,
      },
    },
    // kovan: {
    //   url: process.env.INFURA_KOVAN_URI,
    //   accounts: {
    //     mnemonic: process.env.KOVAN_MNEMONIC
    //   }
    //   // accounts: [`0x${process.env.KOVAN_KEY}`, `0x${process.env.KOVAN_KEY2}`],
    // },
  },
  mocha: {
    timeout: 1000000,
  },

};
