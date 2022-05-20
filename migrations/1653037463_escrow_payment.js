const EscrowPayment = artifacts.require("EscrowPayment");

module.exports = function(deployer, _network, accounts) {
  deployer.deploy(EscrowPayment, accounts[1], accounts[2], 1000, {from: accounts[0]});
};