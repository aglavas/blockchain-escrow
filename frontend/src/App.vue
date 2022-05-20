<template>
  <div id="app">
    <div v-if="ready" className="container">
        <h1 className="text-center">Escrow</h1>
        <div className="row">
          <div className="col-sm-12">
             <p>Balance: <b> {{ balance }} </b> wei </p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="form-group">
              <label for="deposit">Deposit </label>
              <br>
              <input type="number" v-model="amount" className="form-control" id="deposit" />
              <p><b> {{ results.amount }} </b></p>
              <ValidationErrors :errors="errors.amount"></ValidationErrors>
            </div>
            <br>
            <button @click="deposit" className="btn btn-primary">Submit</button>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-sm-12">
             <button @click="release" className="btn btn-primary">Release</button>
             <p><b> {{ results.release }} </b></p>
              <ValidationErrors :errors="errors.release"></ValidationErrors>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
import { getWeb3 } from './utils.js'
import EscrowPayment from '../../build/contracts/EscrowPayment.json'
import ValidationErrors from './components/ValidationErrors.vue'

export default {
  name: 'App',
  components: {
    ValidationErrors
  },
  data() {
    return {
      web3: null,
      accounts: [],
      currentAccount: null,
      contract: null,
      balance: null,
      ready: false,
      amount: 0,
      errors: {
        amount: [],
        release: []
      },
      results: {
        amount: null,
        release: null,
      }
    }
  },
  async mounted() {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = EscrowPayment.networks[networkId];
    const contract = new web3.eth.Contract(EscrowPayment.abi, deployedNetwork.address);

    this.web3 = web3;
    this.accounts = accounts;
    this.contract = contract;
    this.currentAccount = this.accounts[0];

    await this.refreshBalance();
    this.ready = true;
  },
  methods: {
    async refreshBalance() {
      this.balance = await this.contract.methods.getBalance().call();
    },
    async deposit() {
      this.errors.amount = [];
      this.results.amount = '';

      if (this.amount <= 0) {
        this.errors.amount.push("Amount should be positive");
        return false;
      }

      let depositPromise = this.contract.methods.deposit().send({
          from: this.currentAccount, 
          value: this.amount
      });
      
      depositPromise.then(() => {
        this.results.amount = `Escrow has been funded with ${this.amount} WEI`;
        this.refreshBalance();
      }).catch((error) => {
        let messageString = error.message;
        let indexOf = messageString.indexOf('{')
        let messageJson = JSON.parse(
          messageString.slice(indexOf, messageString.length - 1)
        );
        this.results.amount = messageJson.value.data.message;
      });
    
    },
    async release() {
      this.errors.release = [];
      this.results.release = '';

      let releasePromise = this.contract.methods.release().send({
          from: this.currentAccount
      });
      
      releasePromise.then(() => {
        this.results.release = `Funds have been released.`;
        this.refreshBalance();
      }).catch((error) => {
        let messageString = error.message;
        let indexOf = messageString.indexOf('{')
        let messageJson = JSON.parse(
          messageString.slice(indexOf, messageString.length - 1)
        );
        this.results.release = messageJson.value.data.message;
      });
    }
  }
}
</script>