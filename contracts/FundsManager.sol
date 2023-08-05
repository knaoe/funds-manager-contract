// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract FundsManager is Initializable, OwnableUpgradeable {
    address payable public feeRecipient;
    address payable public beneficiary;
    uint256 public feePercentage;

    function initialize(
        address payable _feeRecipient,
        address payable _beneficiary,
        uint256 _feePercentage
    ) public initializer {
        __Ownable_init();
        require(
            _feePercentage <= 100,
            "Fee percentage should be between 0 and 100"
        );
        feeRecipient = _feeRecipient;
        beneficiary = _beneficiary;
        feePercentage = _feePercentage;
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function setFeeRecipient(address payable _feeRecipient) public onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function setFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(
            _feePercentage <= 100,
            "Fee percentage should be between 0 and 100"
        );
        feePercentage = _feePercentage;
    }

    receive() external payable {}

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        uint256 fee = (balance * feePercentage) / 100;
        feeRecipient.transfer(fee);
        beneficiary.transfer(balance - fee);
    }
}
