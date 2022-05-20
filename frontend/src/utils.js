import Web3 from "web3";

const getWeb3 = () => {
    return new Promise((resolve, reject) => {
        if(typeof window.ethereum !== 'undefined') {
          window.ethereum.enable()
            .then(() => {
              resolve(
                new Web3(window.ethereum)
              );
            })
            .catch(e => {
              reject(e);
            });
          return;
        }
        if(typeof window.web3 !== 'undefined') {
          return resolve(
            new Web3(window.web3.currentProvider)
          );
        }
        resolve(new Web3('http://localhost:7545'));
      });
};

export { getWeb3 };