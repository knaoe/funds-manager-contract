# Funds Manager Contract

This project is a simple contract that allows users to deposit and withdraw funds.

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

## Deploying
These are the environment variables that need to be set before deploying the contract.
- FEE_RECIPIENT_ADDRESS
- BENEFICIARY_ADDRESS
- FEE_PERCENTAGE
```shell
export FEE_RECIPIENT_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
export BENEFICIARY_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
export FEE_PERCENTAGE=10
npx hardhat run --network localhost scripts/deploy.ts
``````