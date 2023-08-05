import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { EventLog } from "ethers";

describe("FundsManager", function () {
  async function deployFundsManagerFixture() {
    const [owner, feeRecipient, beneficiary] = await ethers.getSigners();

    const FundsManager = await ethers.getContractFactory("FundsManager");
    const fundsManager = await upgrades.deployProxy(FundsManager, [
      feeRecipient.address,
      beneficiary.address,
      10,
    ]);

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

  it("Should emit a Withdrawal event", async function () {
    const { fundsManager, owner, feeRecipient, beneficiary } =
      await loadFixture(deployFundsManagerFixture);
    const transactionAmount = ethers.parseEther("1.0");
    await owner.sendTransaction({
      to: fundsManager.getAddress(),
      value: transactionAmount,
    });

    const tx = await fundsManager.withdraw();

    // Check if the Withdrawal event was emitted
    const txReceipt = await tx.wait();
    if (!txReceipt) {
      throw new Error("Transaction receipt not found");
    }
    const events = txReceipt.logs.filter(
      (item): item is EventLog => (item as EventLog).eventName === "Withdrawal"
    );
    expect(events.length).to.equal(1);

    // Check if the event contains the expected values
    const event = events[0];
    expect(event.args[0]).to.equal(feeRecipient.address);
    expect(event.args[1]).to.equal(beneficiary.address);
    expect(event.args[2]).to.equal((transactionAmount * 10n) / 100n);
    expect(event.args[3]).to.equal((transactionAmount * 90n) / 100n);
  });
});
