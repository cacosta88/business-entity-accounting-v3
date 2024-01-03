import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Constructor arguments for the contract, update as needed.
  const initialOwners = [
    "0xd7220Cc7fa906DcDAdFdAD3A07cA52E4d37b1af7",
    "0xAE65221aF7f14F2Ede8957D3f068c98E2633C66C",
    "0x5c77aBD04CDfF1062D67EaCE52077f32A938c388",
  ];
  const initialCapital = [
    ethers.utils.parseEther("0.1"),
    ethers.utils.parseEther("0.1"),
    ethers.utils.parseEther("0.1"),
  ];

  await deploy("YourContract", {
    from: deployer,
    // Contract constructor arguments
    args: [initialOwners, initialCapital],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
