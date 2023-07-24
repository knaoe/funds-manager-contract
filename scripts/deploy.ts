import { ethers } from "hardhat";

async function main() {
  const fundsManager = await ethers.deployContract("FundsManager");

  await fundsManager.waitForDeployment();

  console.log(
    `FundsManager deployed to: ${fundsManager.getAddress()} 
    with owner: ${await fundsManager.owner()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
