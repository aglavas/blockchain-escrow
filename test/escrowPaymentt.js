const EscrowPayment = artifacts.require('EscrowPayment');
const truffleAssert = require('truffle-assertions');

contract('EscrowPayment', accounts => {
  let escrowPayment = null;
  const [lawyer, payer, recipient] = accounts;
  before(async () => {
    escrowPayment = await EscrowPayment.deployed();
  });

  it('should deposit', async () => {
    await escrowPayment.deposit({from: payer, value: 900});
    const escrowBalance = parseInt(await web3.eth.getBalance(escrowPayment.address));
    assert(escrowBalance === 900);
  });

  it('should NOT deposit if transfer balance is bigger than escrow defined amount', async () => {
    await truffleAssert.reverts(escrowPayment.deposit({from: payer, value: 2000}), 'Balance too high');
  });

  it('should NOT deposit if sender is wrong', async () => {
    await truffleAssert.reverts(escrowPayment.deposit({from: accounts[5], value: 1000}), 'Sender must be the payer');
  });

  it('should NOT release if escrow amount not met', async () => {
    await truffleAssert.reverts(escrowPayment.release({from: lawyer}), 'Escrow not funded');
  });

  it('should NOT release if not lawyer', async () => {
    await escrowPayment.deposit({from: payer, value: 100});
    await truffleAssert.reverts(escrowPayment.release({from: payer}), 'Only lawyer can release the funds');
  });

  it('should release', async () => {
    const initialRecipientBalance = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    
    await escrowPayment.release({from: lawyer});
    
    const finalRecipientBalance = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    
    assert(finalRecipientBalance.sub(initialRecipientBalance).toNumber() === 1000);
  });
  
});