// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract EscrowPayment {
  address public payerAddress;
  address payable public payeeAddress;
  address public lawyerAddress;
  uint public amount;

  constructor(address payer, address payable payee, uint _amount) {
    payerAddress = payer;
    payeeAddress = payee;
    lawyerAddress = msg.sender;
    amount = _amount;
  }

  function deposit() payable public {
    require(msg.sender == payerAddress, 'Sender must be the payer');
    require(address(this).balance <= amount, 'Balance too high');
  }

  function release() public {
    require(address(this).balance == amount, 'Escrow not funded');
    require(msg.sender == lawyerAddress, 'Only lawyer can release the funds');
    payeeAddress.transfer(amount);
  }

  function getBalance() view public returns(uint) {
    return address(this).balance;
  }
}
