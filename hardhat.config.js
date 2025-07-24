require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "YOUR_SEPOLIA_RPC_URL", // Replace or use .env
      accounts: [process.env.PRIVATE_KEY || "YOUR_METAMASK_PRIVATE_KEY"], // Replace or use .env
    },
  },
  paths: {
    artifacts: "../client/src/artifacts", // Direct artifacts to the React app
  },
};