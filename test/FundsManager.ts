import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("FundsManager", function () {
  async function deployFundsManagerFixture() {
    const [owner, feeRecipient, beneficiary] = await ethers.getSigners();

    const FundsManager = await ethers.getContractFactory("FundsManager");
    const fundsManager = await FundsManager.deploy();

    await fundsManager.initialize(
      feeRecipient.address,
      beneficiary.address,
      10
    );
    return { fundsManager, owner, feeRecipient, beneficiary };
  }

  it("Should set the right owner", async function () {
    const { fundsManager, owner } = await loadFixture(
      deployFundsManagerFixture
    );
    expect(await fundsManager.owner()).to.equal(owner.address);
  });

  it("Should initialize with correct values", async function () {
    const { fundsManager, feeRecipient, beneficiary } = await loadFixture(
      deployFundsManagerFixture
    );

    expect(await fundsManager.feeRecipient()).to.equal(feeRecipient.address);
    expect(await fundsManager.beneficiary()).to.equal(beneficiary.address);
    expect(await fundsManager.feePercentage()).to.equal(10);
  });

  it("Should correctly receive funds", async function () {
    const { fundsManager, owner } = await loadFixture(
      deployFundsManagerFixture
    );
    const transactionAmount = ethers.parseEther("1.0");
    await owner.sendTransaction({
      to: fundsManager.getAddress(),
      value: transactionAmount,
    });
    expect(
      await ethers.provider.getBalance(fundsManager.getAddress())
    ).to.equal(transactionAmount);
  });

  it("Should correctly distribute funds", async function () {
    const { fundsManager, owner, feeRecipient, beneficiary } =
      await loadFixture(deployFundsManagerFixture);
    const transactionAmount = ethers.parseEther("1.0");
    await owner.sendTransaction({
      to: fundsManager.getAddress(),
      value: transactionAmount,
    });

    const initialFeeRecipientBalance = await ethers.provider.getBalance(
      feeRecipient.address
    );
    const initialBeneficiaryBalance = await ethers.provider.getBalance(
      beneficiary.address
    );

    await fundsManager.withdraw();

    const finalFeeRecipientBalance = await ethers.provider.getBalance(
      feeRecipient.address
    );
    const finalBeneficiaryBalance = await ethers.provider.getBalance(
      beneficiary.address
    );

    expect(finalBeneficiaryBalance - initialBeneficiaryBalance).to.equal(
      (transactionAmount * 90n) / 100n
    );
    expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.equal(
      (transactionAmount * 10n) / 100n
    );
  });
});
