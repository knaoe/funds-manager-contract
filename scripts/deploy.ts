import { ethers, upgrades } from "hardhat";

async function main() {
  const feeRecipientAddress = process.env.FEE_RECIPIENT_ADDRESS;
  if (!feeRecipientAddress) {
    throw new Error("FEE_RECIPIENT_ADDRESS environment variable not set");
  }
  const beneficiaryAddress = process.env.BENEFICIARY_ADDRESS;
  if (!beneficiaryAddress) {
    throw new Error("BENEFICIARY_ADDRESS environment variable not set");
  }
  const feePercentage = parseInt(process.env.FEE_PERCENTAGE ?? "");
  if (!feePercentage) {
    throw new Error("FEE_PERCENTAGE environment variable not set");
  }

  const FundsManager = await ethers.getContractFactory("FundsManager");
  const fundsManager = await upgrades.deployProxy(FundsManager, [
    feeRecipientAddress,
    beneficiaryAddress,
    feePercentage,
  ]);
  await fundsManager.waitForDeployment();

  console.log(
    `FundsManager deployed to: ${await fundsManager.getAddress()} 
    with owner: ${await fundsManager.owner()}`
  );
}
main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
