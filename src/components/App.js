import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';
import Loader from './Loader';

class App extends Component {
  
  componentDidMount() {
    this.loadBlockchainData();
    this.createAccountChangeListener();
  }

  async loadWeb3() {
    if (window.ethereum) {
      this.state.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      this.state.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    if (!this.state.web3) {
      await this.loadWeb3();
    }
    const web3 = this.state.web3;
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      if(!this.state.marketplace) {
        const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address);
        this.setState({ marketplace });
      }
      this.setUserData();
      this.loadProducts()
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
  }

  async loadProducts() {
    this.setState({ loading: false });
    let productCount = await this.state.marketplace.methods.productCount().call();
    this.setState({ productCount });
    let products = [];
    for (var i = 1; i <= productCount; i++) {
      const product = await this.state.marketplace.methods.products(i).call();
      products.push(product);
    }
    this.setState({ products, loading: false });
  }

  async setUserData() {
    const web3 = this.state.web3;
    const accounts = await web3.eth.getAccounts();
    const balanceInWei = await this.state.marketplace.methods.getMyBalance().call({ from: accounts[0] });
    const balance = parseFloat(web3.utils.fromWei(balanceInWei.toString(), 'Ether'));
    this.setState({ account: accounts[0], balance });
  }

  async setUserBalance() {
    const web3 = this.state.web3;
  }

  createAccountChangeListener() {
    window.ethereum.on('accountsChanged', (accounts) => {
      this.setUserData();
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      balance: 0
    };

    this.withdraw = this.withdraw.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
  }

  withdraw() {
    this.setState({ loading: true });
    this.state.marketplace.methods.withdraw()
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setUserData();
        this.setState({ loading: false });
      });
  }

  createProduct(name, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
          this.loadProducts();
      });
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id)
      .send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
          this.loadProducts();
      });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} balance={this.state.balance} withdraw={this.withdraw}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading 
                ? <Loader /> 
                : <Main 
                  products={this.state.products} 
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                  web3={this.state.web3} /> 
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
